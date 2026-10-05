// Converte as linhas de whatsapp_connections/whatsapp_messages (snake_case)
// para o formato camelCase da API — mesmo espírito de backend/src/mappers.js.
// NUNCA inclui token_ciphertext no retorno; WABA ID e Phone Number ID saem
// mascarados (pedido explícito da tela "Conectado").
const { mascarar } = require("./tokenCipher");

function mapWhatsappConnection(r) {
  if (!r) return { status: "nao_conectado" };
  return {
    id: r.id,
    status: r.connection_status,
    metaBusinessId: r.meta_business_id ? mascarar(r.meta_business_id, 4) : null,
    wabaId: mascarar(r.waba_id, 4),
    phoneNumberId: mascarar(r.phone_number_id, 4),
    displayPhoneNumber: r.display_phone_number,
    verifiedName: r.verified_name,
    numberStatus: r.number_status,
    qualityRating: r.quality_rating,
    codeVerificationStatus: r.code_verification_status,
    scopes: r.scopes ? r.scopes.split(",") : [],
    webhookStatus: r.webhook_status,
    connectedAt: r.connected_at,
    lastSyncedAt: r.last_synced_at,
    disconnectedAt: r.disconnected_at,
    lastErrorCode: r.last_error_code,
    lastErrorMessage: r.last_error_message_sanitized,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  };
}

function mapWhatsappMessage(r) {
  return {
    id: r.id,
    wamid: r.wamid,
    destinatario: r.destinatario,
    tipo: r.tipo,
    templateNome: r.template_nome,
    templateIdioma: r.template_idioma,
    origem: r.origem,
    status: r.status,
    erroCodigo: r.erro_codigo,
    erroMensagem: r.erro_mensagem,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  };
}

module.exports = { mapWhatsappConnection, mapWhatsappMessage };
