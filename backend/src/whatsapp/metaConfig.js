// Configuração centralizada da integração oficial com a Meta (WhatsApp
// Business Platform / Cloud API). Nenhum outro arquivo deve ler
// process.env.META_* diretamente nem montar a URL da Graph API na mão —
// tudo passa por aqui, pra nunca ter a versão da API espalhada em vários
// lugares (era um requisito explícito do pedido desta integração).
//
// Versão suportada confirmada na documentação oficial da Meta em
// setembro/2026 (developers.facebook.com/docs/graph-api/changelog/versions):
// a mais recente é v26.0; v21.0 a v25.0 ainda estão dentro da janela de
// suporte. O padrão abaixo (v21.0) é a mais antiga ainda plenamente
// suportada no momento desta implementação — dá margem de sobra até
// expirar. Ajustável via META_GRAPH_API_VERSION sem tocar em código.
const VERSAO_PADRAO = "v21.0";
const VERSOES_CONHECIDAS_SUPORTADAS = ["v21.0", "v22.0", "v23.0", "v24.0", "v25.0", "v26.0"];

function lerEnvObrigatoria(nome) {
  const v = process.env[nome];
  if (!v || !String(v).trim()) return null;
  return String(v).trim();
}

// Lazy: só valida quando alguém realmente tenta usar a integração (não trava
// a subida do servidor inteiro se a empresa ainda não configurou o WhatsApp
// oficial — as outras funcionalidades do sistema não dependem disso).
function obterConfig() {
  const versao = (process.env.META_GRAPH_API_VERSION || VERSAO_PADRAO).trim();
  if (!/^v\d+\.0$/.test(versao)) {
    throw new Error(
      `META_GRAPH_API_VERSION="${versao}" não parece uma versão válida da Graph API (formato esperado: "v21.0").`
    );
  }
  if (!VERSOES_CONHECIDAS_SUPORTADAS.includes(versao)) {
    console.warn(
      `[meta] Aviso: META_GRAPH_API_VERSION="${versao}" não está na lista de versões conhecidas como ` +
      `suportadas no momento em que este código foi escrito (${VERSOES_CONHECIDAS_SUPORTADAS.join(", ")}). ` +
      "Confirme em developers.facebook.com/docs/graph-api/changelog/versions antes de usar em produção."
    );
  }
  return {
    versao,
    appId: lerEnvObrigatoria("META_APP_ID"),
    appSecret: lerEnvObrigatoria("META_APP_SECRET"),
    configId: lerEnvObrigatoria("META_EMBEDDED_SIGNUP_CONFIG_ID"),
    webhookVerifyToken: lerEnvObrigatoria("META_WEBHOOK_VERIFY_TOKEN"),
    redirectUri: lerEnvObrigatoria("META_WHATSAPP_REDIRECT_URI"),
    tokenEncryptionKey: lerEnvObrigatoria("META_TOKEN_ENCRYPTION_KEY"),
    graphBaseUrl: "https://graph.facebook.com",
  };
}

// Lança erro claro (em vez de deixar uma chamada à Graph API falhar com
// mensagem genérica) quando falta alguma variável obrigatória pra uma
// operação específica — usado no início de cada rota/serviço que precisa
// delas, listando exatamente o que falta.
function exigirConfig(campos) {
  const cfg = obterConfig();
  const faltando = campos.filter((c) => !cfg[c]);
  if (faltando.length) {
    const nomesEnv = {
      appId: "META_APP_ID", appSecret: "META_APP_SECRET", configId: "META_EMBEDDED_SIGNUP_CONFIG_ID",
      webhookVerifyToken: "META_WEBHOOK_VERIFY_TOKEN", redirectUri: "META_WHATSAPP_REDIRECT_URI",
      tokenEncryptionKey: "META_TOKEN_ENCRYPTION_KEY",
    };
    const err = new Error(
      "Integração com WhatsApp (Meta) não está configurada neste ambiente. Variáveis faltando: " +
      faltando.map((c) => nomesEnv[c] || c).join(", ") + ". Veja .env.example."
    );
    err.status = 503;
    err.codigo = "meta_nao_configurada";
    throw err;
  }
  return cfg;
}

function graphUrl(caminho, versaoOverride) {
  const cfg = obterConfig();
  const versao = versaoOverride || cfg.versao;
  const limpo = String(caminho).replace(/^\/+/, "");
  return `${cfg.graphBaseUrl}/${versao}/${limpo}`;
}

module.exports = { obterConfig, exigirConfig, graphUrl, VERSAO_PADRAO, VERSOES_CONHECIDAS_SUPORTADAS };
