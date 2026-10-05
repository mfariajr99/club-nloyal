// Traduz erros técnicos (da Meta ou nossos) em mensagens que fazem sentido
// pra quem está configurando a conexão no painel — mantendo o código/
// subcódigo originais da Meta disponíveis (err.metaCodigo/err.metaSubcodigo)
// pra log/diagnóstico, sem vazar isso pro texto mostrado na tela.
//
// Códigos de erro da Graph API referenciados abaixo são os documentados
// pela Meta (developers.facebook.com/docs/graph-api/guides/error-handling e
// developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes) e são
// estáveis há vários anos — o mapeamento completo (todos os subcódigos) deve
// ser conferido contra a documentação vigente ao evoluir esta lista.
const MAPA_CODIGO = {
  // OAuth / token
  190: "Sessão de autorização com a Meta expirou ou foi revogada. Reconecte o WhatsApp.",
  102: "Sessão de autorização inválida. Reconecte o WhatsApp.",
  200: "Permissão insuficiente na conta Meta Business para concluir esta ação.",
  10: "Permissão insuficiente no Business Portfolio para concluir esta ação.",
  // Parâmetros / validação
  100: "A Meta recusou os dados enviados (parâmetro inválido). Tente novamente ou reconecte.",
  131009: "Número de telefone em formato inválido.",
  131026: "Este número ainda não pode receber mensagens pelo WhatsApp.",
  131047: "Mensagem fora da janela de atendimento de 24h — é necessário um template aprovado.",
  131053: "Não foi possível enviar a mídia/mensagem: verifique o conteúdo enviado.",
  132000: "O template informado não existe ou não pertence a esta conexão.",
  132001: "O template informado não foi encontrado ou não está aprovado.",
  132012: "Parâmetro do template não confere com o template aprovado.",
  133016: "Limite de registros do número atingido — aguarde antes de tentar novamente (janela de 72h da Meta).",
  368: "Esta conta ou número está temporariamente restrito pela Meta por violação de política.",
  // Genéricos / infraestrutura
  1: "Falha temporária na Graph API. Tente novamente em instantes.",
  2: "Falha temporária na Graph API. Tente novamente em instantes.",
  4: "Limite de chamadas à Graph API atingido. Tente novamente em instantes.",
  80007: "Limite de chamadas à Graph API atingido para esta conta. Tente novamente em instantes.",
};

const SUBCODIGO_190 = {
  458: "O acesso foi revogado pelo usuário Meta que autorizou a conexão. Reconecte o WhatsApp.",
  459: "A conta Meta que autorizou a conexão está com restrições. Verifique o Business Manager.",
  460: "A senha ou as permissões da conta Meta mudaram. Reconecte o WhatsApp.",
  463: "A sessão de autorização expirou. Reconecte o WhatsApp.",
  467: "Token de autorização inválido. Reconecte o WhatsApp.",
};

function mensagemAmigavelMeta(err) {
  if (!err) return "Algo deu errado ao falar com a Meta.";
  if (err.metaCodigo === 190 && err.metaSubcodigo && SUBCODIGO_190[err.metaSubcodigo]) {
    return SUBCODIGO_190[err.metaSubcodigo];
  }
  if (err.metaCodigo != null && MAPA_CODIGO[err.metaCodigo]) return MAPA_CODIGO[err.metaCodigo];
  if (err.transitorio) return "Falha temporária ao falar com a Meta. Tente novamente em instantes.";
  return err.mensagemAmigavel || "Não foi possível concluir a operação com a Meta agora.";
}

// true = pode valer a pena tentar de novo automaticamente (rede/timeout/rate
// limit); false = erro permanente (não adianta retry sem o usuário agir).
function erroTransitorio(err) {
  if (!err) return false;
  if (err.transitorio) return true;
  if ([1, 2, 4, 80007].includes(err.metaCodigo)) return true;
  if (err.status >= 500) return true;
  return false;
}

module.exports = { mensagemAmigavelMeta, erroTransitorio };
