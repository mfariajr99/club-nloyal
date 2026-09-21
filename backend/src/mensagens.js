const crypto = require("crypto");

function telefoneWa(tel) {
  return String(tel || "").replace(/\D/g, "");
}
function last4(tel) {
  return telefoneWa(tel).slice(-4);
}
function primeiroNome(nome) {
  return String(nome || "").trim().split(/\s+/)[0] || nome;
}
function reais(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function novoToken() {
  return crypto.randomBytes(9).toString("base64url");
}
function novoCodigoVoucher() {
  const alf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "GB-";
  for (let i = 0; i < 6; i++) s += alf[crypto.randomInt(alf.length)];
  return s;
}

// Monta a mensagem que vai para o CLIENTE, substituindo as variáveis do
// template da campanha. `linkResgate` é a URL pública já pronta.
function montarMensagem({ campanha, cliente, produtoGatilhoNome, produtoAlvoNome, linkResgate }) {
  const vars = {
    nome_cliente: primeiroNome(cliente.nome),
    produto_gatilho: produtoGatilhoNome || "",
    produto_alvo: produtoAlvoNome || "",
    valor_giftback: reais(campanha.valor),
    valor_minimo_compra: reais(campanha.valorMinimoCompra),
    validade_dias: String(campanha.validadeDias),
    link_resgate: linkResgate,
  };
  let msg = campanha.mensagem || "";
  Object.keys(vars).forEach((k) => {
    msg = msg.split("{{" + k + "}}").join(vars[k]);
  });
  return msg;
}

// Mensagem que o cliente reenvia ao WhatsApp do estabelecimento após confirmar.
function montarMensagemRetorno({ campanha, cliente, produtoAlvoNome, voucher }) {
  const vars = {
    nome_cliente: primeiroNome(cliente.nome),
    produto_alvo: produtoAlvoNome || "",
    valor_giftback: reais(campanha.valor),
    codigo_voucher: voucher.codigo,
  };
  let msg =
    campanha.mensagemRetorno ||
    "Obrigado pelo Giftback, foi resgatado com sucesso! Quero agendar meu procedimento de {{produto_alvo}} para: ";
  Object.keys(vars).forEach((k) => {
    msg = msg.split("{{" + k + "}}").join(vars[k]);
  });
  return msg;
}

function montarLinkWhatsapp(tel, mensagem) {
  return "https://wa.me/" + telefoneWa(tel) + "?text=" + encodeURIComponent(mensagem);
}

// Link de WhatsApp sem número de destino — abre o seletor de contatos do
// próprio WhatsApp do indicador, para ele "encaminhar" a mensagem a um amigo.
function montarLinkWhatsappGenerico(mensagem) {
  return "https://wa.me/?text=" + encodeURIComponent(mensagem);
}

// Mensagem que vai para o CLIENTE (indicador), convidando-o a indicar amigos.
function montarMensagemIndicacao({ campanha, clienteIndicador, linkIndicacao }) {
  const vars = {
    nome_cliente: primeiroNome(clienteIndicador.nome),
    meta_indicacoes: String(campanha.metaIndicacoes),
    premio_indicador: campanha.premioIndicador,
    premio_indicado: campanha.premioIndicado,
    link_indicacao: linkIndicacao,
  };
  let msg = campanha.mensagem || "";
  Object.keys(vars).forEach((k) => {
    msg = msg.split("{{" + k + "}}").join(vars[k]);
  });
  return msg;
}

// Mensagem pré-estabelecida que o indicador encaminha aos amigos dele.
function montarMensagemEncaminhar({ campanha, clienteIndicador, linkIndicacao }) {
  const vars = {
    nome_indicador: primeiroNome(clienteIndicador.nome),
    premio_indicado: campanha.premioIndicado,
    condicoes: campanha.condicoes,
    link_indicacao: linkIndicacao,
  };
  let msg = campanha.textoEncaminhar || "";
  Object.keys(vars).forEach((k) => {
    msg = msg.split("{{" + k + "}}").join(vars[k]);
  });
  return msg;
}

module.exports = {
  telefoneWa,
  last4,
  primeiroNome,
  reais,
  novoToken,
  novoCodigoVoucher,
  montarMensagem,
  montarMensagemRetorno,
  montarLinkWhatsapp,
  montarLinkWhatsappGenerico,
  montarMensagemIndicacao,
  montarMensagemEncaminhar,
};
