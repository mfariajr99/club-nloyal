// Webhook público da WAME — SEM login (é a WAME chamando o servidor, não um
// usuário). Cada empresa tem um endereço próprio com um segredo aleatório
// (/api/webhooks/wame/<segredo>), gerado quando a chave é cadastrada: o
// segredo identifica a empresa e impede que alguém de fora envie eventos
// falsos sem conhecer o endereço. A resposta é sempre mínima e não revela se
// o segredo existe ou não.
const express = require("express");
const { processarWebhook } = require("../wame/wameService");
const { rateLimitMiddleware } = require("../whatsapp/rateLimiter");

const router = express.Router();

// Algumas plataformas testam o endereço com um GET antes de usar.
router.get("/:segredo", (req, res) => res.status(200).json({ ok: true }));

router.post("/:segredo", rateLimitMiddleware({ prefixo: "wame_webhook", limite: 3000, janelaMs: 60000 }), (req, res) => {
  // A WAME pede resposta 200 o mais rápido possível — responde já e
  // processa em seguida.
  res.status(200).json({ ok: true });
  const segredo = String(req.params.segredo || "");
  if (!/^[0-9a-f]{48}$/.test(segredo)) return;
  processarWebhook(segredo, req.body).catch((err) => {
    console.error("[wame webhook] erro inesperado:", err.message);
  });
});

module.exports = router;
