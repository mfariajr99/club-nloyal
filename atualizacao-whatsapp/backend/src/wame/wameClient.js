// Cliente fino da API da WAME (https://wame.api.br/docs/api) — só faz as
// chamadas HTTP e normaliza resposta/erro. Regras de negócio ficam em
// wameService.js.
//
// Na WAME a chave da instância vai DENTRO do caminho da URL
// (https://server.wame.api.br/{CHAVE}/...), sem cabeçalho de autenticação.
// Por isso esta camada NUNCA coloca a URL completa em mensagem de erro nem em
// log — só o "contexto" da chamada — pra chave não vazar nos logs do Render.
//
// Endpoints usados (documentação oficial da WAME, consultada em outubro/2026):
//   GET    /{key}/instance        → dados/status da instância
//   POST   /{key}/instance        → gera o QR Code de conexão
//   PUT    /{key}/instance        → configura os webhooks
//   POST   /{key}/message/text    → envia mensagem de texto
const BASE_PADRAO = "https://server.wame.api.br";
const TIMEOUT_MS = 15000;

function baseUrl() {
  return String(process.env.WAME_BASE_URL || BASE_PADRAO).trim().replace(/\/+$/, "");
}

async function chamar(chave, metodo, caminho, corpo, contexto) {
  if (!chave) {
    const e = new Error("Chave da WAME não informada.");
    e.status = 400;
    throw e;
  }
  const url = `${baseUrl()}/${encodeURIComponent(chave)}${caminho}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let resp;
  try {
    resp = await fetch(url, {
      method: metodo,
      headers: Object.assign({ Accept: "application/json" }, corpo ? { "Content-Type": "application/json" } : {}),
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const err = new Error(
      e.name === "AbortError"
        ? "A WAME demorou demais para responder. Tente de novo em instantes."
        : "Não foi possível falar com a WAME (falha de rede)."
    );
    err.status = 502;
    err.contexto = contexto;
    throw err;
  }
  clearTimeout(timer);

  let dados = null;
  try { dados = await resp.json(); } catch (e) { dados = null; }

  // A WAME às vezes responde HTTP 200 com {"status": 4xx/5xx} no corpo —
  // trata os dois jeitos como erro.
  const statusCorpo = dados && typeof dados.status === "number" ? dados.status : null;
  if (!resp.ok || (statusCorpo && statusCorpo >= 400) || (dados && dados.error === true)) {
    const status = !resp.ok ? resp.status : statusCorpo || 400;
    const msgWame = dados && (dados.message || dados.msg || (typeof dados.error === "string" ? dados.error : null));
    const err = new Error(msgWame ? String(msgWame) : `A WAME recusou a operação (HTTP ${status}).`);
    err.status = status;
    err.contexto = contexto;
    err.respostaWame = dados;
    throw err;
  }
  return dados || {};
}

function obterInstancia(chave) {
  return chamar(chave, "GET", "/instance", null, "obter_instancia");
}

function gerarQrCode(chave) {
  return chamar(chave, "POST", "/instance", null, "gerar_qrcode");
}

// Aponta os eventos de mensagens (recebidas + status de entrega) e de conexão
// pro nosso servidor, no formato padrão Meta ("webhookFormat": "meta") — o
// mesmo formato que wameService.processarWebhook sabe ler.
function configurarWebhook(chave, urlWebhook) {
  return chamar(chave, "PUT", "/instance", {
    allowWebhook: true,
    allowNumber: "all",
    webhookFormat: "meta",
    webhookMessage: urlWebhook,
    webhookConnection: urlWebhook,
    webhookGroup: "",
    webhookQrCode: "",
    webhookMessageFromMe: "",
    webhookHistory: "",
  }, "configurar_webhook");
}

function desativarWebhook(chave) {
  return chamar(chave, "PUT", "/instance", {
    allowWebhook: false,
    webhookMessage: "",
    webhookConnection: "",
  }, "desativar_webhook");
}

function enviarTexto(chave, para, texto) {
  return chamar(chave, "POST", "/message/text", { to: para, text: texto, provider: "whatsapp" }, "enviar_texto");
}

module.exports = { obterInstancia, gerarQrCode, configurarWebhook, desativarWebhook, enviarTexto };
