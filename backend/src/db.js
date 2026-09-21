const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Configure o .env (veja .env.example).");
}

// Render (e a maioria dos provedores gerenciados) exige SSL, mas com um
// certificado que o node não valida por padrão sem passar rejectUnauthorized:false.
// Em desenvolvimento local (PGSSL=false no .env) desligamos o SSL.
const ssl = process.env.PGSSL === "false" ? false : { rejectUnauthorized: false };

const pool = new Pool({ connectionString, ssl });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
