const db = require("./db");
const { hashSenha } = require("./auth");

// Cria uma empresa (tenant) + seu primeiro usuário admin — lógica
// compartilhada entre o cadastro self-service (POST /api/auth/registrar-empresa,
// hoje só acessível de dentro do Painel Master) e a criação de cliente pelo
// Master (POST /api/master/empresas). Lança um erro com `status` (400/409)
// para erros de validação/negócio, e deixa erros inesperados subirem para o
// catch de cada rota logar e responder 500.
async function criarEmpresaEAdmin({ nomeEmpresa, nomeAdmin, email, senha }) {
  if (!nomeEmpresa || !nomeAdmin || !email || !senha) {
    throw Object.assign(new Error("Preencha nome da empresa, nome do admin, e-mail e senha."), { status: 400 });
  }
  if (String(senha).length < 6) {
    throw Object.assign(new Error("A senha precisa ter pelo menos 6 caracteres."), { status: 400 });
  }
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const existente = await client.query("SELECT id FROM usuarios WHERE email = $1", [email.toLowerCase().trim()]);
    if (existente.rows.length) {
      throw Object.assign(new Error("Já existe uma conta com este e-mail."), { status: 409 });
    }
    const empresaRes = await client.query(
      "INSERT INTO empresas (nome) VALUES ($1) RETURNING *",
      [nomeEmpresa.trim()]
    );
    const empresa = empresaRes.rows[0];
    const hash = await hashSenha(senha);
    const usuarioRes = await client.query(
      `INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel)
       VALUES ($1, $2, $3, $4, 'admin') RETURNING *`,
      [empresa.id, nomeAdmin.trim(), email.toLowerCase().trim(), hash]
    );
    await client.query("COMMIT");
    return { empresa, usuario: usuarioRes.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { criarEmpresaEAdmin };
