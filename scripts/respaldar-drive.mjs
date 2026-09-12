// Respalda el historial de liquidaciones a Google Drive como CSV.
//
// REQUISITOS (una sola vez, los credenciales los entrega el usuario):
//   1. En Google Cloud Console: crear un proyecto y habilitar "Google Drive API".
//   2. Crear una CUENTA DE SERVICIO y descargar su clave JSON.
//   3. Guardar la clave como scripts/google-service-account.json (NUNCA subir
//      a git — .gitignore ya la excluye) o en la variable de entorno
//      GOOGLE_SERVICE_ACCOUNT_JSON.
//   4. Compartir la carpeta de Drive destino con el correo de la cuenta de
//      servicio (termina en @*.iam.gserviceaccount.com) y poner su ID en
//      GOOGLE_DRIVE_FOLDER_ID.
//
// Uso: npx tsx scripts/respaldar-drive.mjs
// Sin credenciales el script avisa y no hace nada (no falla la app).

import { createSign } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL ?? "postgresql://contaia:contaia_dev@localhost:5432/contaia?schema=public" } },
});

function credenciales() {
  const ruta = "scripts/google-service-account.json";
  const fuente = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? (existsSync(ruta) ? readFileSync(ruta, "utf8") : null);
  return fuente ? JSON.parse(fuente) : null;
}

// Firma un JWT RS256 con node:crypto — sin dependencias de Google.
async function tokenDeAcceso(cred) {
  const ahora = Math.floor(Date.now() / 1000);
  const afirmacion = {
    iss: cred.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: ahora + 3600,
    iat: ahora,
  };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const sinFirmar = `${b64({ alg: "RS256", typ: "JWT" })}.${b64(afirmacion)}`;
  const firma = createSign("RSA-SHA256").update(sinFirmar).sign(cred.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${sinFirmar}.${firma}`,
    }),
  });
  if (!res.ok) throw new Error(`Google respondió ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

const cred = credenciales();
if (!cred) {
  console.log("🔌 Google Drive no está configurado todavía.");
  console.log("   Siga los pasos del encabezado de este archivo (cuenta de servicio");
  console.log("   de Google Cloud + carpeta compartida). La app funciona sin esto.");
  process.exit(0);
}

const token = await tokenDeAcceso(cred);
const historial = await prisma.liquidacionRenta.findMany({ orderBy: { createdAt: "desc" } });

const csv = [
  "fecha,anio,tipo,ingresos_totales,gravable,impuesto",
  ...historial.map((h) =>
    [
      h.createdAt.toISOString(), h.anioGravable, h.esPersonaNatural ? "Natural" : "Jurídica",
      Math.round(h.ingresosTotales), Math.round(h.rentaLiquidaGravable), Math.round(h.impuestoBasicoCop),
    ].join(","),
  ),
].join("\n");

const nombre = `contaia-respaldo-${new Date().toISOString().slice(0, 10)}.csv`;
const carpeta = process.env.GOOGLE_DRIVE_FOLDER_ID;

const meta = { name: nombre, mimeType: "text/csv" };
if (carpeta) meta.parents = [carpeta];

const subida = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/related; boundary=contaia" },
  body: `--contaia\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(meta)}\r\n--contaia\r\nContent-Type: text/csv\r\n\r\n${csv}\r\n--contaia--`,
});

if (!subida.ok) throw new Error(`Subida falló: ${await subida.text()}`);
const archivo = await subida.json();
console.log(`✅ Respaldo subido a Google Drive: ${nombre} (${historial.length} filas) · id: ${archivo.id}`);
await prisma.$disconnect();
