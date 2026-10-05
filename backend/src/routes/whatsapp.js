// Configurações → Conexão WhatsApp — todas as rotas exigem requireAuth, que
// já recusa token de Painel Master e confere o status da empresa a cada
// request (ver backend/src/auth.js). O tenant usado em TODA operação é
// sempre req.usuario.empresaId (extraído do JWT verificado no servidor) —
// nunca um valor mandado pelo cliente no corpo/querystring, mesmo que a
// tela um dia venha a enviar um id "por engano".
const express = require("express");
const { requireAuth } = require("../auth");
const { obterConfig } = require("../whatsapp/metaConfig");
const nonceStore = require("../whatsapp/whatsappNonceStore");
const connectionService = require("../whatsapp/whatsappConnectionService");
const messageService = require("../whatsapp/whatsappMessageService");
const { rateLimitMiddleware } = require("../whatsapp/rateLimiter");

const router = express.Router();
router.use(requireAuth);

function tratarErro(res, err, fallback) {
  if (err.status === 401) throw err; // deixa o requireAuth/401 padrão seguir
  console.error("[whatsapp]", err.contexto || err.codigo || "erro", "-", err.message);
  res.status(err.status || 500).json({
    erro: err.mensagemAmigavel || err.message || fallback,
    codigo: err.codigo || null,
  });
}

// Dados públicos (não-secretos) necessários pro frontend inicializar o SDK
// do Facebook Login for Business — nunca o App Secret.
router.get("/embed-config", (req, res) => {
  try {
    const cfg = obterConfig();
    if (!cfg.appId || !cfg.configId) {
      return res.status(503).json({ erro: "Integração com WhatsApp não configurada neste ambiente." });
    }
    res.json({ appId: cfg.appId, configId: cfg.configId, graphApiVersion: cfg.versao });
  } catch (err) { tratarErro(res, err, "Não foi possível carregar a configuração."); }
});

router.get("/connection", async (req, res) => {
  try {
    const status = await connectionService.obterStatus(req.usuario.empresaId);
    res.json(status);
  } catch (err) { tratarErro(res, err, "Não foi possível consultar a conexão."); }
});

// Emite o nonce que o frontend deve devolver em /connection/complete —
// primeiro passo do botão "Conectar com a Meta".
router.post("/connection/iniciar", rateLimitMiddleware({ prefixo: "wa_iniciar", limite: 10, janelaMs: 60000 }), (req, res) => {
  const nonce = nonceStore.emitir(req.usuario.empresaId);
  res.json({ nonce });
});

router.post(
  "/connection/complete",
  rateLimitMiddleware({ prefixo: "wa_complete", limite: 10, janelaMs: 60000 }),
  async (req, res) => {
    const { code, wabaId, phoneNumberId, businessId, nonce } = req.body || {};
    if (!nonceStore.validarEConsumir(req.usuario.empresaId, nonce)) {
      return res.status(400).json({ erro: "Sessão de conexão expirada ou inválida. Clique em \"Conectar com a Meta\" novamente.", codigo: "nonce_invalido" });
    }
    try {
      const conexao = await connectionService.completarSignup({
        empresaId: req.usuario.empresaId, usuarioId: req.usuario.id,
        code, wabaId, phoneNumberId, businessId,
      });
      res.status(201).json(conexao);
    } catch (err) { tratarErro(res, err, "Não foi possível concluir a conexão com a Meta."); }
  }
);

router.post(
  "/connection/sync",
  rateLimitMiddleware({ prefixo: "wa_sync", limite: 20, janelaMs: 60000 }),
  async (req, res) => {
    try {
      const conexao = await connectionService.sincronizar({ empresaId: req.usuario.empresaId, usuarioId: req.usuario.id });
      res.json(conexao);
    } catch (err) { tratarErro(res, err, "Não foi possível sincronizar o status."); }
  }
);

router.post(
  "/test-message",
  rateLimitMiddleware({ prefixo: "wa_teste", limite: 10, janelaMs: 60000 }),
  async (req, res) => {
    const { destinatario, templateNome, templateIdioma, parametrosCorpo, idempotencyKey } = req.body || {};
    try {
      const msg = await messageService.enviarMensagemTeste({
        empresaId: req.usuario.empresaId, usuarioId: req.usuario.id,
        destinatario, templateNome, templateIdioma, parametrosCorpo, idempotencyKey,
      });
      res.status(201).json(msg);
    } catch (err) { tratarErro(res, err, "Não foi possível enviar a mensagem de teste."); }
  }
);

router.delete("/connection", async (req, res) => {
  try {
    const conexao = await connectionService.desconectar({ empresaId: req.usuario.empresaId, usuarioId: req.usuario.id });
    res.json(conexao);
  } catch (err) { tratarErro(res, err, "Não foi possível desconectar."); }
});

module.exports = router;
