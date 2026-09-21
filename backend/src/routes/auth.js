const express = require("express");
const db = require("../db");
const { hashSenha, verificarSenha, emitirToken, requireAuth } = require("../auth");
const { mapEmpresa } = require("../mappers");

const router = express.Router();

// Cadastro self-service de uma nova empresa (tenant) + usuário admin.
router.post("/registrar-empresa", async (req, res) => {
  const { nomeEmpresa, nomeAdmin, email, senha } = req.body || {};
  if (!nomeEmpresa || !nomeAdmin || !email || !senha) {
    return res.status(400).json({ erro: "Preencha nome da empresa, seu nome, e-mail e senha." });
  }
  if (String(senha).length < 6) {
    return res.status(400).json({ erro: "A senha precisa ter pelo menos 6 caracteres." });
  }
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const existente = await client.query("SELECT id FROM usuarios WHERE email = $1", [email.toLowerCase().trim()]);
    if (existente.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
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
    const usuario = usuarioRes.rows[0];
    const token = emitirToken(usuario);
    res.status(201).json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
      empresa: mapEmpresa(empresa),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ erro: "Não foi possível criar a conta." });
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ erro: "Informe e-mail e senha." });
  const result = await db.query(
    "SELECT u.*, e.nome AS empresa_nome, e.whatsapp_numero FROM usuarios u JOIN empresas e ON e.id = u.empresa_id WHERE u.email = $1 AND u.ativo = TRUE",
    [email.toLowerCase().trim()]
  );
  const usuario = result.rows[0];
  if (!usuario) return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  const ok = await verificarSenha(senha, usuario.senha_hash);
  if (!ok) return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  const token = emitirToken(usuario);
  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
    empresa: { id: usuario.empresa_id, nome: usuario.empresa_nome, whatsapp: usuario.whatsapp_numero },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await db.query(
    "SELECT u.id, u.nome, u.email, u.papel, e.id AS empresa_id, e.nome AS empresa_nome, e.whatsapp_numero FROM usuarios u JOIN empresas e ON e.id = u.empresa_id WHERE u.id = $1",
    [req.usuario.id]
  );
  const r = result.rows[0];
  if (!r) return res.status(404).json({ erro: "Usuário não encontrado." });
  res.json({
    usuario: { id: r.id, nome: r.nome, email: r.email, papel: r.papel },
    empresa: { id: r.empresa_id, nome: r.empresa_nome, whatsapp: r.whatsapp_numero },
  });
});

module.exports = router;
