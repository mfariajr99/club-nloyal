// Configurações → WhatsApp (WAME). Todas as rotas exigem login (requireAuth)
// e sempre usam req.usuario.empresaId (do JWT) — nunca um id vindo do
// navegador.
const express = require("express");
const { requireAuth } = require("../auth");
const wame = require("../wame/wameService");
const { rateLimitMiddleware } = require("../whatsapp/rateLimiter");

const router = express.Router();
router.use(requireAuth);

function tratarErro(res, err, padrao) {
  console.error("[wame]", err.contexto || "", err.message);
  res.status(err.status && err.status < 600 ? err.status : 500).json({ erro: err.message || padrao });
}

// Status da conexão. ?atualizar=1 consulta a WAME antes de responder.
router.get("/", async (req, res) => {
  try {
    res.json(await wame.obterStatus(req.usuario.empresaId, { consultarWame: req.query.atualizar === "1" }));
  } catch (err) { tratarErro(res, err, "Não foi possível consultar a conexão."); }
});

router.put("/chave", rateLimitMiddleware({ prefixo: "wame_chave", limite: 10, janelaMs: 60000 }), async (req, res) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const status = await wame.salvarChave({ empresaId: req.usuario.empresaId, chave: (req.body || {}).chave, baseUrl });
    res.json(status);
  } catch (err) { tratarErro(res, err, "Não foi possível salvar a chave."); }
});

router.post("/qrcode", rateLimitMiddleware({ prefixo: "wame_qr", limite: 20, janelaMs: 60000 }), async (req, res) => {
  try {
    res.json(await wame.gerarQrCode(req.usuario.empresaId));
  } catch (err) { tratarErro(res, err, "Não foi possível gerar o QR Code."); }
});

router.post("/teste", rateLimitMiddleware({ prefixo: "wame_teste", limite: 10, janelaMs: 60000 }), async (req, res) => {
  const { telefone, texto } = req.body || {};
  if (!telefone || !String(texto || "").trim()) {
    return res.status(400).json({ erro: "Informe o número de destino e o texto da mensagem." });
  }
  try {
    const r = await wame.enviarTexto({
      empresaId: req.usuario.empresaId, telefone, texto: String(texto).trim(), origem: "teste",
    });
    if (!r) return res.status(400).json({ erro: "Cadastre a chave da WAME primeiro." });
    if (!r.enviado) return res.status(400).json({ erro: r.erro });
    res.status(201).json(r);
  } catch (err) { tratarErro(res, err, "Não foi possível enviar a mensagem de teste."); }
});

router.get("/mensagens", async (req, res) => {
  try {
    res.json(await wame.listarMensagens(req.usuario.empresaId, req.query.limite));
  } catch (err) { tratarErro(res, err, "Não foi possível carregar as mensagens."); }
});

router.delete("/", async (req, res) => {
  try {
    res.json(await wame.remover(req.usuario.empresaId));
  } catch (err) { tratarErro(res, err, "Não foi possível remover a integração."); }
});

module.exports = router;
