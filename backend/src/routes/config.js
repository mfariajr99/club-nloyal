const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapEmpresa } = require("../mappers");

const router = express.Router();
router.use(requireAuth);

router.get("/empresa", async (req, res) => {
  const result = await db.query("SELECT * FROM empresas WHERE id = $1", [req.usuario.empresaId]);
  if (!result.rows[0]) return res.status(404).json({ erro: "Empresa não encontrada." });
  res.json(mapEmpresa(result.rows[0]));
});

router.put("/empresa", async (req, res) => {
  // Cada campo só é atualizado quando o cliente manda a chave — isto permite
  // que a tela "Empresa" (só WhatsApp) e a tela "Aparência" (nome, cor, logo,
  // Instagram) façam PUTs parciais e independentes sem um sobrescrever o
  // outro com um valor vazio.
  const atual = await db.query("SELECT * FROM empresas WHERE id = $1", [req.usuario.empresaId]);
  if (!atual.rows[0]) return res.status(404).json({ erro: "Empresa não encontrada." });
  const body = req.body || {};
  const valores = {
    nome: "nomeEmpresa" in body ? String(body.nomeEmpresa || "").trim() || atual.rows[0].nome : atual.rows[0].nome,
    whatsapp_numero: "whatsapp" in body ? String(body.whatsapp || "").trim() : atual.rows[0].whatsapp_numero,
    cor_principal: "corPrincipal" in body ? String(body.corPrincipal || "").trim() : atual.rows[0].cor_principal,
    logo_url: "logoUrl" in body ? String(body.logoUrl || "") : atual.rows[0].logo_url,
    instagram: "instagram" in body ? String(body.instagram || "").trim() : atual.rows[0].instagram,
  };
  const result = await db.query(
    `UPDATE empresas SET nome = $1, whatsapp_numero = $2, cor_principal = $3, logo_url = $4, instagram = $5
     WHERE id = $6 RETURNING *`,
    [valores.nome, valores.whatsapp_numero, valores.cor_principal, valores.logo_url, valores.instagram, req.usuario.empresaId]
  );
  res.json(mapEmpresa(result.rows[0]));
});

module.exports = router;
