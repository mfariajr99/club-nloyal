// Cliente fino da Graph API / WhatsApp Cloud API — só faz chamadas HTTP e
// normaliza a resposta/erro. NENHUMA regra de negócio aqui (isso fica nos
// services); é só pra não espalhar `fetch("https://graph.facebook.com/...")`
// pelos controllers, como pedido.
//
// Endpoints usados abaixo, confirmados na documentação oficial da Meta
// (developers.facebook.com, consultada em setembro/2026):
//   - POST /{versao}/oauth/access_token            → troca do code pelo token
//   - GET  /{versao}/debug_token                    → valida/inspeciona um token
//   - GET  /{versao}/{waba-id}/phone_numbers         → números de uma WABA
//   - GET  /{versao}/{phone-number-id}               → detalhes de um número
//   - POST /{versao}/{waba-id}/subscribed_apps       → assina o app na WABA
//   - POST /{versao}/{phone-number-id}/register      → registra o número na Cloud API
//   - POST /{versao}/{phone-number-id}/messages      → envia mensagem
//   - GET  /{versao}/{waba-id}/message_templates     → lista templates aprovados
// O endpoint de troca do code (oauth/access_token) é o padrão estável do
// Facebook Login usado por qualquer app Meta há anos; para o fluxo de popup
// do Embedded Signup (sem redirect real), a chamada é feita SEM redirect_uri
// — confirme esse detalhe específico no seu App Dashboard (Embedded Signup →
// Implementation) antes de ir para produção, já que a documentação pública
// não reproduz o exemplo completo de curl para este endpoint.
const { graphUrl, obterConfig } = require("./metaConfig");

const TIMEOUT_PADRAO_MS = 15000;

// Erro normalizado: nunca inclui token/secret, sempre preserva o código e
// subcódigo originais da Meta (pedido explícito, pra diagnóstico) dentro de
// `err.metaCodigo`/`err.metaSubcodigo`/`err.metaTipo`, sem vazar no `message`
// exposto ao chamador (quem decide o que mostrar ao usuário é o service).
function erroDaMeta(status, corpo, contexto) {
  const erroMeta = corpo && corpo.error ? corpo.error : null;
  const err = new Error(
    (erroMeta && erroMeta.message) || `Falha na chamada à Graph API (${contexto}), HTTP ${status}.`
  );
  err.status = status;
  err.metaCodigo = erroMeta ? erroMeta.code : null;
  err.metaSubcodigo = erroMeta ? erroMeta.error_subcode : null;
  err.metaTipo = erroMeta ? erroMeta.type : null;
  err.metaFbtraceId = erroMeta ? erroMeta.fbtrace_id : null;
  err.contexto = contexto;
  return err;
}

async function chamar(url, { method = "GET", body, accessToken, timeoutMs = TIMEOUT_PADRAO_MS, contexto } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { Accept: "application/json" };
  if (accessToken) headers.Authorization = "Bearer " + accessToken;
  if (body) headers["Content-Type"] = "application/json";
  let resp;
  try {
    resp = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      const err = new Error(`Tempo esgotado ao chamar a Graph API (${contexto}).`);
      err.status = 504;
      err.transitorio = true;
      err.contexto = contexto;
      throw err;
    }
    const err = new Error(`Falha de rede ao chamar a Graph API (${contexto}): ${e.message}`);
    err.status = 502;
    err.transitorio = true;
    err.contexto = contexto;
    throw err;
  }
  clearTimeout(timer);
  let corpo = null;
  try { corpo = await resp.json(); } catch (e) { corpo = null; }
  if (!resp.ok) throw erroDaMeta(resp.status, corpo, contexto);
  return corpo;
}

// Troca o authorization code (retornado pelo FB.login/Embedded Signup) pelo
// token de sistema do negócio. O code expira em ~30s — chamar isso assim
// que o backend recebe o code do frontend, sem esperar nenhum outro passo.
async function trocarCodePorToken(code) {
  const cfg = obterConfig();
  // DIAGNÓSTICO TEMPORÁRIO — a Meta vinha recusando a troca com
  // OAuthException subcódigo 36008 ("redirect_uri is identical..."), e não
  // está claro qual valor de redirect_uri ela espera para o code do
  // Embedded Signup (a documentação oficial não usa nenhum). Tentamos as
  // variações em sequência, usamos a primeira que funcionar e, se nenhuma
  // funcionar, o erro lançado lista o resultado de cada uma — assim um único
  // teste descobre a resposta. Depois de descoberto, deixar só a variação
  // correta aqui.
  const base = cfg.redirectUri ? cfg.redirectUri.replace(/\/+$/, "") : null;
  const variacoes = [
    { rotulo: "sem_redirect_uri", valor: undefined },
    { rotulo: "vazio", valor: "" },
  ];
  if (base) {
    variacoes.push({ rotulo: "dominio", valor: base });
    variacoes.push({ rotulo: "dominio_com_barra", valor: base + "/" });
  }
  variacoes.push({ rotulo: "login_success", valor: "https://www.facebook.com/connect/login_success.html" });

  const tentativas = [];
  let ultimoErro = null;
  for (const v of variacoes) {
    const url = new URL(graphUrl("oauth/access_token"));
    url.searchParams.set("client_id", cfg.appId);
    url.searchParams.set("client_secret", cfg.appSecret);
    url.searchParams.set("code", code);
    if (v.valor !== undefined) url.searchParams.set("redirect_uri", v.valor);
    try {
      const resp = await chamar(url.toString(), { method: "GET", contexto: "trocar_code_por_token" });
      console.log(`[whatsapp] troca do code funcionou com a variação: ${v.rotulo}`);
      return resp;
    } catch (err) {
      ultimoErro = err;
      tentativas.push(`${v.rotulo}=${err.metaSubcodigo || err.metaCodigo || err.status}`);
      // Só vale a pena tentar outra variação se o erro for o de redirect_uri
      // (36008). Qualquer outro erro (code expirado, já usado, secret
      // errado...) não muda trocando o redirect_uri.
      if (err.metaSubcodigo !== 36008) break;
    }
  }
  console.error("[whatsapp] troca do code falhou em todas as variações:", tentativas.join(" "));
  ultimoErro.message = `${ultimoErro.message} | tentativas: ${tentativas.join(" ")}`;
  throw ultimoErro;
}

// Confirma o que o token realmente autoriza direto na Graph API — nunca
// confiamos só no que o frontend reportou no evento FINISH do popup. Usa o
// "app access token" (appId|appSecret) como credencial de quem consulta,
// que é o padrão da Meta para inspecionar tokens de terceiros.
async function inspecionarToken(inputToken) {
  const cfg = obterConfig();
  const url = new URL(graphUrl("debug_token"));
  url.searchParams.set("input_token", inputToken);
  url.searchParams.set("access_token", `${cfg.appId}|${cfg.appSecret}`);
  return chamar(url.toString(), { method: "GET", contexto: "inspecionar_token" });
}

async function listarNumerosDaWaba(wabaId, accessToken) {
  const url = graphUrl(`${encodeURIComponent(wabaId)}/phone_numbers`);
  return chamar(url, { accessToken, contexto: "listar_numeros_waba" });
}

async function buscarDetalhesNumero(phoneNumberId, accessToken) {
  const url = new URL(graphUrl(encodeURIComponent(phoneNumberId)));
  url.searchParams.set(
    "fields",
    "display_phone_number,verified_name,code_verification_status,quality_rating,platform_type,status"
  );
  return chamar(url.toString(), { accessToken, contexto: "detalhes_numero" });
}

// Assina o app nos eventos da WABA — sem isso, os webhooks (mensagens
// recebidas, status de envio) não chegam pra essa WABA específica.
async function assinarApp(wabaId, accessToken) {
  const url = graphUrl(`${encodeURIComponent(wabaId)}/subscribed_apps`);
  return chamar(url, { method: "POST", accessToken, contexto: "assinar_app_waba" });
}

async function listarApsAssinados(wabaId, accessToken) {
  const url = graphUrl(`${encodeURIComponent(wabaId)}/subscribed_apps`);
  return chamar(url, { accessToken, contexto: "listar_apps_assinados" });
}

// Remove a assinatura do app na WABA — usado na desconexão (revoga o app,
// NUNCA apaga o número/WABA/portfolio do cliente na Meta).
async function desassinarApp(wabaId, accessToken) {
  const url = graphUrl(`${encodeURIComponent(wabaId)}/subscribed_apps`);
  return chamar(url, { method: "DELETE", accessToken, contexto: "desassinar_app_waba" });
}

// Registro do número na Cloud API — só é exigido quando o número ainda não
// está registrado (números migrados por coexistência às vezes já vêm
// registrados pelo próprio fluxo do Embedded Signup). O service decide
// quando chamar isso, verificando o status atual antes.
async function registrarNumero(phoneNumberId, pin, accessToken) {
  const url = graphUrl(`${encodeURIComponent(phoneNumberId)}/register`);
  return chamar(url, {
    method: "POST",
    accessToken,
    contexto: "registrar_numero",
    body: { messaging_product: "whatsapp", pin: String(pin) },
  });
}

async function listarTemplates(wabaId, accessToken) {
  const url = new URL(graphUrl(`${encodeURIComponent(wabaId)}/message_templates`));
  url.searchParams.set("limit", "100");
  return chamar(url.toString(), { accessToken, contexto: "listar_templates" });
}

// Envio de mensagem via template — obrigatório para mensagem iniciada pela
// empresa fora da janela de atendimento de 24h (o caso normal de campanhas e
// de mensagem de teste vindas do painel administrativo).
async function enviarMensagemTemplate({ phoneNumberId, accessToken, para, templateNome, idioma, parametrosCorpo }) {
  const url = graphUrl(`${encodeURIComponent(phoneNumberId)}/messages`);
  const components = parametrosCorpo && parametrosCorpo.length
    ? [{ type: "body", parameters: parametrosCorpo.map((texto) => ({ type: "text", text: String(texto) })) }]
    : undefined;
  return chamar(url, {
    method: "POST",
    accessToken,
    contexto: "enviar_mensagem_template",
    body: {
      messaging_product: "whatsapp",
      to: para,
      type: "template",
      template: { name: templateNome, language: { code: idioma }, ...(components ? { components } : {}) },
    },
  });
}

module.exports = {
  trocarCodePorToken,
  inspecionarToken,
  listarNumerosDaWaba,
  buscarDetalhesNumero,
  assinarApp,
  listarApsAssinados,
  desassinarApp,
  registrarNumero,
  listarTemplates,
  enviarMensagemTemplate,
};
