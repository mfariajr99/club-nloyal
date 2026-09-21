const db = require("./db");
const { mapCampanha, mapCliente, mapEnvio } = require("./mappers");
const { montarMensagem, montarLinkWhatsapp, novoToken } = require("./mensagens");

// Disparo de giftback — compartilhado entre "Nova compra" (lista de elegíveis
// pós-compra) e o botão de WhatsApp por cliente dentro de cada campanha.
async function enviarGiftback({ empresaId, clienteId, campanhaId, compraId, baseUrl }) {
  const campanhaRes = await db.query("SELECT * FROM campanhas_giftback WHERE id = $1 AND empresa_id = $2", [
    campanhaId,
    empresaId,
  ]);
  const campanhaRow = campanhaRes.rows[0];
  if (!campanhaRow) throw Object.assign(new Error("Campanha não encontrada."), { status: 404 });
  const campanha = mapCampanha(campanhaRow);

  const clienteRes = await db.query("SELECT * FROM clientes WHERE id = $1 AND empresa_id = $2", [
    clienteId,
    empresaId,
  ]);
  const clienteRow = clienteRes.rows[0];
  if (!clienteRow) throw Object.assign(new Error("Cliente não encontrado."), { status: 404 });
  const cliente = mapCliente(clienteRow);

  const produtosRes = await db.query("SELECT id, nome FROM produtos WHERE id = ANY($1)", [
    [campanha.produtoGatilhoId, campanha.produtoAlvoId],
  ]);
  const nomesPorId = {};
  produtosRes.rows.forEach((r) => (nomesPorId[r.id] = r.nome));

  const tok = novoToken();
  // O roteamento do frontend é baseado no "#" da URL (ex.: #/resgate/token) —
  // sem o "#/", o link cai na tela de login normal em vez de abrir direto a
  // página pública de resgate.
  const linkResgate = `${baseUrl}/#/resgate/${tok}`;
  const mensagem = montarMensagem({
    campanha,
    cliente,
    produtoGatilhoNome: nomesPorId[campanha.produtoGatilhoId],
    produtoAlvoNome: nomesPorId[campanha.produtoAlvoId],
    linkResgate,
  });
  const linkWhatsapp = montarLinkWhatsapp(cliente.telefone, mensagem);

  const insertRes = await db.query(
    `INSERT INTO envios_giftback
       (empresa_id, cliente_id, campanha_id, compra_origem_id, token_resgate, link_whatsapp, mensagem, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'enviado')
     RETURNING *`,
    [empresaId, clienteId, campanhaId, compraId, tok, linkWhatsapp, mensagem]
  );
  return { envio: mapEnvio(insertRes.rows[0]), mensagem, link: linkWhatsapp };
}

module.exports = { enviarGiftback };
