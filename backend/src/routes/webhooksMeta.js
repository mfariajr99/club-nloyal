// Webhook público da Meta (WhatsApp Cloud API) — SEM requireAuth (a Meta não
// manda nosso JWT; a autenticidade vem da assinatura HMAC, não de sessão).
// Nunca retorna detalhe interno nem segredo no corpo da resposta — só um
// corpo mínimo fixo, sempre.
const express = require("express");
const { verificarDesafio, validarAssinatura, processarPayload } = require("../whatsapp/whatsappWebhookService");
const { rateLimitMiddleware } = require("../whatsapp/rateLimiter");

const router = express.Router();

// Verificação inicial (chamada uma vez, quando a callback URL é configurada
// no App Dashboard, e sempre que a Meta reconfirma a assinatura).
router.get("/", (req, res) => {
  try {
    const challenge = verificarDesafio({
      mode: req.query["hub.mode"],
      token: req.query["hub.verify_token"],
      challenge: req.query["hub.challenge"],
    });
    res.status(200).type("text/plain").send(challenge);
  } catch (err) {
    res.sendStatus(err.status || 403);
  }
});

// Eventos (mensagens recebidas, status de envio, atualizações de conta).
// Limite generoso — é tráfego legítimo da Meta, não de usuário; o limite
// existe só como último cinto de segurança contra um remetente forjado
// martelando o endpoint.
router.post("/", rateLimitMiddleware({ prefixo: "wa_webhook", limite: 600, janelaMs: 60000 }), (req, res) => {
  // req.rawBody é capturado pelo verify() do express.json() global (ver
  // server.js) — a assinatura da Meta é sobre os BYTES originais do corpo,
  // não sobre o objeto já reserializado pelo JSON.parse.
  const assinatura = req.headers["x-hub-signature-256"];
  if (!req.rawBody || !validarAssinatura(req.rawBody, assinatura)) {
    // Assinatura ausente/incorreta: rejeita. Não processa nada, não
    // descreve o motivo em detalhe (evita dar dica de como forjar).
    return res.sendStatus(403);
  }
  // Responde rápido (a Meta reenvia com backoff próprio por até 7 dias se
  // não receber 200) e processa depois, sem bloquear a resposta — o projeto
  // não tem fila; cada evento é idempotente e trata seu próprio erro (ver
  // whatsappWebhookService.processarPayload), então isso é seguro mesmo
  // "solto" após a resposta.
  res.sendStatus(200);
  processarPayload(req.body).catch((err) => {
    console.error("[whatsapp webhook] erro inesperado ao processar payload:", err.message);
  });
});

module.exports = router;
