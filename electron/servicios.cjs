// Servicios locales de la aplicación de escritorio ContaIA Colombia:
//   1. PostgreSQL embebida (binarios reales de Postgres, sin Docker ni
//      instalaciones; los datos viven en la carpeta de usuario).
//   2. Servidor Next.js standalone (la interfaz).
// Todo corre localmente: los datos nunca salen del computador del contador.

const { spawn } = require("node:child_process");
const { existsSync, mkdirSync, readFileSync } = require("node:fs");
const path = require("node:path");
const net = require("node:net");

const PG_USER = "contaia";
const PG_PASSWORD = "contaia_local"; // instancia local embebida, no requiere secreto
const PG_DB = "contaia";
const PG_PORT = 55432;

function esperarPuerto(puerto, intentos = 60) {
  return new Promise((resolve, reject) => {
    const intentar = (restantes) => {
      const socket = net.connect({ port: puerto, host: "127.0.0.1" });
      socket.once("connect", () => { socket.end(); resolve(true); });
      socket.once("error", () => {
        if (restantes <= 0) reject(new Error(`Puerto ${puerto} no respondió`));
        else setTimeout(() => intentar(restantes - 1), 500);
      });
    };
    intentar(intentos);
  });
}

// SQL de inicialización — idempotente, refleja prisma/schema.prisma.
const SQL_INICIAL = `
CREATE TABLE IF NOT EXISTS "LiquidacionRenta" (
  "id" TEXT PRIMARY KEY,
  "anioGravable" INTEGER NOT NULL,
  "esPersonaNatural" BOOLEAN NOT NULL,
  "ingresosTotales" DOUBLE PRECISION NOT NULL,
  "ingresosNoConstitutivos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "costosYDeducciones" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "rentasExentas" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "rentaLiquidaGravable" DOUBLE PRECISION NOT NULL,
  "impuestoBasicoCop" DOUBLE PRECISION NOT NULL,
  "uvt" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "LiquidacionRenta_createdAt_idx" ON "LiquidacionRenta"("createdAt");

CREATE TABLE IF NOT EXISTS "CalculoNomina" (
  "id" TEXT PRIMARY KEY,
  "salarioMensual" DOUBLE PRECISION NOT NULL,
  "auxilioTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "diasTrabajados" INTEGER NOT NULL,
  "prima" DOUBLE PRECISION NOT NULL,
  "cesantias" DOUBLE PRECISION NOT NULL,
  "intereses" DOUBLE PRECISION NOT NULL,
  "totalPrestaciones" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "RegistroEscaneo" (
  "id" TEXT PRIMARY KEY,
  "categorias" TEXT NOT NULL,
  "totalProtegidos" INTEGER NOT NULL,
  "destino" TEXT NOT NULL DEFAULT 'ia',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RegistroEscaneo_createdAt_idx" ON "RegistroEscaneo"("createdAt");
`;

async function iniciarPostgres(directorioDatos) {
  // El paquete es ESM; se importa dinámicamente desde el main CJS.
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  const dirPostgres = path.join(directorioDatos, "postgres");
  mkdirSync(dirPostgres, { recursive: true });

  const pg = new EmbeddedPostgres({
    databaseDir: dirPostgres,
    user: PG_USER,
    password: PG_PASSWORD,
    port: PG_PORT,
    persistent: true, // los datos sobreviven entre sesiones
  });

  const primeraVez = !existsSync(path.join(dirPostgres, "PG_VERSION"));
  if (primeraVez) {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase(PG_DB);
  } else {
    await pg.start();
  }

  // Crea las tablas si no existen (pg ya está instalado como cliente).
  const { Client } = require("pg");
  const cliente = new Client({
    host: "127.0.0.1", port: PG_PORT, user: PG_USER,
    password: PG_PASSWORD, database: PG_DB,
  });
  await cliente.connect();
  await cliente.query(SQL_INICIAL);
  await cliente.end();

  return {
    detener: async () => { try { await pg.stop(); } catch { /* ya detenida */ } },
    url: `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/${PG_DB}?schema=public`,
  };
}

function iniciarServidorNext(directorioServidor, databaseUrl, puerto) {
  const rutaServidor = path.join(directorioServidor, "server.js");
  if (!existsSync(rutaServidor)) throw new Error("Falta el build standalone de Next.js (npm run build).");
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, [rutaServidor], {
      env: {
        ...process.env,
        PORT: String(puerto),
        HOSTNAME: "127.0.0.1",
        DATABASE_URL: databaseUrl,
        ELECTRON_RUN_AS_NODE: "1",
      },
      stdio: "inherit",
    });
    proceso.on("error", reject);
    esperarPuerto(puerto).then(() => resolve(proceso), reject);
  });
}

module.exports = { iniciarPostgres, iniciarServidorNext, esperarPuerto };
