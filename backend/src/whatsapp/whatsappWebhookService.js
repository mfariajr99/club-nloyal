// Processamento do webhook oficial da Meta (WhatsApp Cloud API).
//
// Formato do payload confirmado na documentação oficial (Meta for
// Developers, consultada em setembro/2026):
//   { object: "whatsapp_business_account", entry: [{ id: <waba_id>,
//     changes: [{ field: "messages", value: {
//       messaging_product, metadata: {phone_number_id, display_phone_number},
//       messages?: [{ from, id, timestamp, type, text:{body}, ... }],
//       statuses?: [{ id, status, timestamp, recipient_id, conversation?, pricing?, errors? }],
//     }}] }] }
// O campo "statuses[].status" progride sent → delivered → read, ou falha
// como "failed" (com "errors"). A estrutura completa de "conversation" e
// "pricing" dentro de statuses é a documentada pela Meta há vários anos
// para o Cloud API; como o acesso à documentação nesta implementação não
// reproduziu um exemplo literal completo desses dois sub-objetos, GRAVAMOS
// o payload gerador do evento de forma resumida (sem token/segredo, que o
// webhook da Meta nunca envia) para conferência manual se algum campo vier
// diferente do esperado — sem travar o processamento por isso.
//
// Sem infraestrutura de fila no projeto (ver README): processamos síncrono
// mas rápido (sem chamadas de rede à Meta aqui dentro), e respondemos
// 200 imediatamente mesmo se algo individual falhar — a Meta reenvia com
// backoff próprio por até 7 dias se não recebermos 200, então nunca se deve
// deixar uma falha de um evento derrubar a resposta HTTP.
const crypto = require("crypto");
const db = require("../db");
const { obterConfig } = require("./metaConfig");

function verificarDesafio({ mode, token, challenge }) {
  const cfg = obterConfig();
  if (!cfg.webhookVerifyToken) {
    const e = new Error("META_WEBHOOK_VERIFY_TOKEN não configurado neste ambiente.");
    e.status = 503; throw e;
  }
  if (mode !== "subscribe" || token !== cfg.webhookVerifyToken) {
    const e = new Error("Verificação de webhook recusada.");
    e.status = 403; throw e;
  }
  return challenge;
}

// Compara em tempo constante (timingSafeEqual) para não vazar, por timing,
// quantos bytes do HMAC calculado conferem com o header recebido.
function validarAssinatura(rawBody, assinaturaHeader) {
  const cfg = obterConfig();
  if (!cfg.appSecret) return false;
  if (!assinaturaHeader || !assinaturaHeader.startsWith("sha256=")) return false;
  const esperada = crypto.createHmac("sha256", cfg.appSecret).update(rawBody).digest("hex");
  const recebida = assinaturaHeader.slice("sha256=".length);
  const bufEsperada = Buffer.from(esperada, "hex");
  const bufRecebida = Buffer.from(recebida, "hex");
  if (bufEsperada.length !== bufRecebida.length) return false;
  return crypto.timingSafeEqual(bufEsperada, bufRecebida);
}

function hashEvento(...partes) {
  return crypto.createHash("sha256").update(partes.join("|")).digest("hex");
}

// Retorna true se já tinha sido processado (duplicado — no-op) e false se
// esta chamada é quem registrou o evento agora (deve seguir processando).
async function registrarSeNovo({ wabaId, phoneNumberId, empresaId, campo, dedupKey }) {
  try {
    await db.query(
      `INSERT INTO whatsapp_webhook_events (waba_id, phone_number_id, empresa_id, campo, evento_hash, processado)
       VALUES ($1,$2,$3,$4,$5, false)`,
      [wabaId || null, phoneNumberId || null, empresaId || null, campo, dedupKey]
    );
    return false;
  } catch (err) {
    if (err.code === "23505") return true; // evento_hash já existia — duplicado
    throw err;
  }
}

async function marcarProcessado(dedupKey, erroSanitizado) {
  await db.query(
    "UPDATE whatsapp_webhook_events SET processado = $2, erro_sanitizado = $3 WHERE evento_hash = $1",
    [dedupKey, !erroSanitizado, erroSanitizado || null]
  );
}

async function conexaoPorPhoneNumberId(phoneNumberId) {
  const r = await db.query("SELECT * FROM whatsapp_connections WHERE phone_number_id = $1", [phoneNumberId]);
  return r.rows[0] || null;
}

async function processarStatus(conexao, status) {
  const dedupKey = hashEvento("status", status.id, status.status, status.timestamp);
  const duplicado = await registrarSeNovo({
    wabaId: conexao ? conexao.waba_id : null,
    phoneNumberId: conexao ? conexao.phone_number_id : null,
    empresaId: conexao ? conexao.empresa_id : null,
    campo: "messages:status", dedupKey,
  });
  if (duplicado) return;
  try {
    const erroPrincipal = Array.isArray(status.errors) && status.errors[0] ? status.errors[0] : null;
    const msgRes = await db.query(
      `UPDATE whatsapp_messages SET status = $2,
         erro_codigo = COALESCE($3, erro_codigo), erro_mensagem = COALESCE($4, erro_mensagem),
         atualizado_em = now()
       WHERE wamid = $1 RETURNING id`,
      [
        status.id, status.status,
        erroPrincipal ? String(erroPrincipal.code) : null,
        erroPrincipal ? String(erroPrincipal.title || erroPrincipal.message || "") : null,
      ]
    );
    const mensagemId = msgRes.rows[0] ? msgRes.rows[0].id : null;
    await db.query(
      `INSERT INTO whatsapp_message_events (mensagem_id, wamid, tipo_evento, status, erro_codigo, erro_mensagem)
       VALUES ($1,$2,'status',$3,$4,$5)`,
      [
        mensagemId, status.id, status.status,
        erroPrincipal ? String(erroPrincipal.code) : null,
        erroPrincipal ? String(erroPrincipal.title || erroPrincipal.message || "") : null,
      ]
    );
    await marcarProcessado(dedupKey, null);
  } catch (err) {
    console.error("[whatsapp webhook] falha ao processar status:", err.message);
    await marcarProcessado(dedupKey, "erro_interno_ao_processar");
  }
}

async function processarMensagemRecebida(conexao, mensagem) {
  const dedupKey = hashEvento("mensagem", mensagem.id);
  const duplicado = await registrarSeNovo({
    wabaId: conexao ? conexao.waba_id : null,
    phoneNumberId: conexao ? conexao.phone_number_id : null,
    empresaId: conexao ? conexao.empresa_id : null,
    campo: "messages:inbound", dedupKey,
  });
  if (duplicado) return;
  try {
    const corpo = mensagem.type === "text" && mensagem.text ? mensagem.text.body : `[${mensagem.type}]`;
    await db.query(
      `INSERT INTO whatsapp_message_events (mensagem_id, wamid, tipo_evento, de_telefone, corpo_texto)
       VALUES (NULL, $1, 'mensagem_recebida', $2, $3)`,
      [mensagem.id, mensagem.from, corpo]
    );
    await marcarProcessado(dedupKey, null);
  } catch (err) {
    console.error("[whatsapp webhook] falha ao processar mensagem recebida:", err.message);
    await marcarProcessado(dedupKey, "erro_interno_ao_processar");
  }
}

async function processarOutroCampo(wabaId, campo, value) {
  const dedupKey = hashEvento("campo", wabaId, campo, JSON.stringify(value || {}));
  const duplicado = await registrarSeNovo({ wabaId, phoneNumberId: null, empresaId: null, campo, dedupKey });
  if (duplicado) return;
  // Sem regra de negócio específica hoje para os demais campos (ex.:
  // message_template_status_update, account_update) — fica registrado para
  // diagnóstico/expansão futura, sem quebrar o processamento dos que
  // importam (mensagens e status).
  await marcarProcessado(dedupKey, null);
}

// Processa o corpo já parseado (chamado depois que a assinatura foi
// validada pela rota). Nunca lança para fora — cada item trata seu próprio
// erro, pra uma falha isolada não impedir os demais nem atrasar a resposta.
async function processarPayload(payload) {
  if (!payload || payload.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) return;
  for (const entry of payload.entry) {
    const wabaId = entry.id;
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const change of changes) {
      const campo = change.field;
      const value = change.value || {};
      if (campo === "messages") {
        const phoneNumberId = value.metadata ? value.metadata.phone_number_id : null;
        const conexao = phoneNumberId ? await conexaoPorPhoneNumberId(phoneNumberId) : null;
        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        const mensagens = Array.isArray(value.messages) ? value.messages : [];
        for (const status of statuses) await processarStatus(conexao, status);
        for (const mensagem of mensagens) await processarMensagemRecebida(conexao, mensagem);
      } else {
        await processarOutroCampo(wabaId, campo, value);
      }
    }
  }
}

module.exports = { verificarDesafio, validarAssinatura, processarPayload };
