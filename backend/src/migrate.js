// Aplica schema.sql no banco apontado por DATABASE_URL.
// Uso: node src/migrate.js  (rodado automaticamente no start em produção)
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL não definida — configure o .env (veja .env.example).");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("Migração aplicada com sucesso.");
  } catch (err) {
    console.error("Erro ao aplicar migração:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
