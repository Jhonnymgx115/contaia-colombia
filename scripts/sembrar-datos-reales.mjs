// Siembra datos REALES de datos.gov.co en la PostgreSQL local:
//   - Caracterización del Empleo Público — SIGEP II (Función Pública)
//     https://www.datos.gov.co/Empresas-y-Organizaciones/h8rs-jxum
// Cada fila es una entidad pública REAL con su salario mensual promedio real.
// Se liquidan los casos representativos de las 50 entidades con más
// servidores y se guardan en la base. Uso: npx tsx scripts/sembrar-datos-reales.mjs

import { PrismaClient } from "@prisma/client";
import { liquidar } from "../lib/herramientas/renta";

const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://contaia:contaia_dev@localhost:5432/contaia?schema=public" } },
});

const URL_SIGEP = "https://www.datos.gov.co/resource/h8rs-jxum.json?$limit=300";
const ANIO = 2025;
const TOP = 50;

console.log("⬇️  Descargando datos reales del SIGEP II (Función Pública)…");
const res = await fetch(URL_SIGEP);
const filas = await res.json();
console.log(`   ${filas.length} entidades públicas reales descargadas de datos.gov.co.`);

const entidades = filas
  .map((f) => ({
    nombre: f.nombre_de_la_entidad ?? "(sin nombre)",
    orden: f.orden ?? "",
    servidores: Number(f.genero_hombre ?? 0) + Number(f.genero_mujer ?? 0) + Number(f.genero_no_binario ?? 0),
    salario: Number(f.salario_mensual_promedio ?? 0),
  }))
  .filter((e) => e.salario > 0 && e.servidores > 0)
  .sort((a, b) => b.servidores - a.servidores)
  .slice(0, TOP);

console.log(`\n🧮 Liquidando renta (año ${ANIO}, UVT $49.799) para las ${entidades.length} entidades con más servidores…\n`);
const cop = (v) => `$${Math.round(v).toLocaleString("es-CO")}`;
let guardadas = 0;

for (const e of entidades) {
  const ingresosAnuales = e.salario * 12;
  const r = liquidar({
    ingresosTotales: ingresosAnuales,
    anio: ANIO,
    esPersonaNatural: true,
    ingresosLaborales: ingresosAnuales,
  });

  await prisma.liquidacionRenta.create({
    data: {
      anioGravable: ANIO,
      esPersonaNatural: true,
      ingresosTotales: r.ingresosTotales,
      ingresosNoConstitutivos: r.ingresosNoConstitutivos,
      costosYDeducciones: r.costosYDeducciones,
      rentasExentas: r.rentasExentas,
      rentaLiquidaGravable: r.rentaLiquidaGravable,
      impuestoBasicoCop: r.impuestoBasicoCop,
      uvt: r.uvt,
    },
  });
  guardadas++;

  console.log(
    `   ${e.nombre.padEnd(45).slice(0, 45)} ${String(e.servidores).padStart(6)} serv. · salario real ${cop(e.salario).padStart(12)}/mes → impuesto ${cop(r.impuestoBasicoCop)}`,
  );
}

const total = await prisma.liquidacionRenta.count();
console.log(`\n✅ ${guardadas} liquidaciones nuevas guardadas · total en la base: ${total}`);
console.log("   Consulte el historial en la app (rama web): http://localhost:3200/historial");
await prisma.$disconnect();
