// Levanta una PostgreSQL 17 REAL embebida para desarrollo/pruebas, sin
// Docker ni instalaciones. Uso:  node scripts/db-local.mjs
// Los datos persisten en .db-local/ (excluido de git).

import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), ".db-local");
mkdirSync(DIR, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir: path.join(DIR, "postgres"),
  user: "contaia",
  password: "contaia_dev",
  port: 5432,
  persistent: true,
});

const primeraVez = !existsSync(path.join(DIR, "postgres", "PG_VERSION"));

if (primeraVez) {
  console.log("🆕 Primera vez: inicializando clúster PostgreSQL 17…");
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("contaia");
  console.log("✅ Base de datos 'contaia' creada.");
} else {
  await pg.start();
  console.log("✅ PostgreSQL arrancada (datos existentes en .db-local/).");
}

console.log("➡️  Conexión: postgresql://contaia:contaia_dev@localhost:5432/contaia");
console.log("   (Ctrl+C para detener)");

process.on("SIGINT", async () => {
  console.log("\n🛑 Deteniendo PostgreSQL…");
  await pg.stop();
  process.exit(0);
});
