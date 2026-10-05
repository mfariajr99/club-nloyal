// Converte as linhas do Postgres (snake_case) para o formato camelCase que o
// frontend (herdado do protótipo) já espera — mantém a UI validada sem reescrever.

function mapCliente(r) {
  return { id: r.id, nome: r.nome, telefone: r.telefone_whatsapp, email: r.email };
}
function mapProduto(r) {
  return { id: r.id, nome: r.nome, categoria: r.categoria };
}
function mapCampanha(r) {
  return {
    id: r.id,
    titulo: r.titulo,
    produtoGatilhoId: r.produto_gatilho_id,
    produtoAlvoId: r.produto_alvo_id,
    valor: Number(r.valor_giftback),
    valorMinimoCompra: Number(r.valor_minimo_compra || 0),
    mensagem: r.texto_mensagem,
    regras: r.regras_uso,
    mensagemRetorno: r.mensagem_retorno,
    validadeDias: r.validade_dias,
    permiteReenvio: r.permite_reenvio,
    intervaloReenvioDias: r.intervalo_reenvio_dias,
    status: r.status,
  };
}
function mapCompra(r) {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    produtoId: r.produto_id,
    valor: Number(r.valor),
    origem: r.origem,
    data: r.data,
  };
}
function mapEnvio(r) {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    campanhaId: r.campanha_id,
    compraId: r.compra_origem_id,
    tok: r.token_resgate,
    mensagem: r.mensagem,
    linkWhatsapp: r.link_whatsapp,
    status: r.status,
    dataEnvio: r.data_envio,
    dataVisualizacao: r.data_visualizacao,
    dataConfirmacao: r.data_confirmacao,
  };
}
function mapVoucher(r) {
  return {
    id: r.envio_id,
    codigo: r.codigo,
    valor: Number(r.valor),
    produtoAlvoId: r.produto_alvo_id,
    emitidoEm: r.emitido_em,
    validoAte: r.valido_ate,
    status: r.status,
    dataUtilizacao: r.data_utilizacao,
    compraGeradaId: r.compra_gerada_id,
  };
}
function mapEmpresa(r) {
  return {
    id: r.id,
    nome: r.nome,
    nomeEmpresa: r.nome,
    whatsapp: r.whatsapp_numero,
    corPrincipal: r.cor_principal,
    logoUrl: r.logo_url,
    instagram: r.instagram,
    status: r.status || "ativa",
  };
}
function mapCampanhaIndicacao(r) {
  return {
    id: r.id,
    titulo: r.titulo,
    metaIndicacoes: r.meta_indicacoes,
    premioIndicador: r.premio_indicador,
    premioIndicado: r.premio_indicado,
    condicoes: r.condicoes,
    mensagem: r.texto_mensagem,
    textoEncaminhar: r.texto_encaminhar,
    validadeDias: r.validade_dias,
    status: r.status,
  };
}
function mapIndicacao(r) {
  return {
    id: r.id,
    campanhaId: r.campanha_id,
    clienteIndicadorId: r.cliente_indicador_id,
    token: r.token,
    linkWhatsapp: r.link_whatsapp,
    mensagem: r.mensagem,
    status: r.status,
    dataEnvio: r.data_envio,
    dataVisualizacao: r.data_visualizacao,
    indicadorConfirmadoEm: r.indicador_confirmado_em,
    codigo: r.codigo || null,
  };
}
function mapIndicado(r) {
  return {
    id: r.id,
    indicacaoId: r.indicacao_id,
    clienteId: r.cliente_id,
    nome: r.nome,
    telefone: r.telefone_whatsapp,
    codigo: r.codigo || null,
    dataConfirmacao: r.data_confirmacao,
  };
}

module.exports = {
  mapCliente, mapProduto, mapCampanha, mapCompra, mapEnvio, mapVoucher, mapEmpresa,
  mapCampanhaIndicacao, mapIndicacao, mapIndicado,
};
