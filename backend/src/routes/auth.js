const express = require("express");
const db = require("../db");
const { verificarSenha, emitirToken, requireAuth } = require("../auth");
const { mapEmpresa } = require("../mappers");
const { criarEmpresaEAdmin } = require("../criarEmpresa");

const router = express.Router();

// Cadastro de uma nova empresa (tenant) + usuário admin. Não é mais exposto
// como auto-cadastro público na tela de login (decisão do produto) — hoje só
// é chamado de dentro do Painel Master (ver routes/master.js), mas o endpoint
// em si continua funcionando como antes, inclusive devolvendo um token já
// logado nesta nova empresa (é assim que era usado pelo signup público, e
// continuaria valendo caso volte a ser exposto).
router.post("/registrar-empresa", async (req, res) => {
  try {
    const { empresa, usuario } = await criarEmpresaEAdmin(req.body || {});
    const token = emitirToken(usuario);
    res.status(201).json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
      empresa: mapEmpresa(empresa),
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ erro: err.message });
    console.error(err);
    res.status(500).json({ erro: "Não foi possível criar a conta." });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ erro: "Informe e-mail e senha." });
  const result = await db.query(
    "SELECT u.*, e.nome AS empresa_nome, e.whatsapp_numero, e.status AS empresa_status FROM usuarios u JOIN empresas e ON e.id = u.empresa_id WHERE u.email = $1 AND u.ativo = TRUE",
    [email.toLowerCase().trim()]
  );
  const usuario = result.rows[0];
  if (!usuario) return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  const ok = await verificarSenha(senha, usuario.senha_hash);
  if (!ok) return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  // Empresa bloqueada/desativada pelo Painel Master: credenciais corretas,
  // mas o acesso está suspenso — mensagem específica em vez do genérico
  // "e-mail ou senha incorretos", para não confundir com senha errada.
  if (usuario.empresa_status === "bloqueada") {
    return res.status(403).json({ erro: "O acesso desta conta está suspenso. Fale com o suporte." });
  }
  if (usuario.empresa_status !== "ativa") {
    return res.status(403).json({ erro: "Esta conta não está mais ativa." });
  }
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
