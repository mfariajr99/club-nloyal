const db = require("./db");
const { mapCampanhaIndicacao, mapCliente, mapIndicacao } = require("./mappers");
const { montarMensagemIndicacao, montarLinkWhatsapp, novoToken } = require("./mensagens");
const wame = require("./wame/wameService");

// Se a empresa conectou o WhatsApp pela WAME, manda o convite sozinho pelo
// número dela. Devolve null quando não há WAME configurada (a tela segue com
// o link wa.me de sempre). Nunca lança erro: o convite já está registrado.
async function enviarPelaWame({ empresaId, cliente, mensagem, indicacaoId }) {
  try {
    return await wame.enviarTexto({
      empresaId, telefone: cliente.telefone, texto: mensagem, origem: "indicacao", indicacaoId,
    });
  } catch (err) {
    console.error("[wame] erro inesperado no envio automático da indicação:", err.message);
    return { enviado: false, erro: "Não foi possível enviar automaticamente pelo WhatsApp." };
  }
}

// Disparo do convite de indicação — usado quando a atendente clica no ícone
// de WhatsApp de um cliente dentro de uma campanha de indicação. Gera um
// link pessoal único (cliente + campanha); se o cliente já tiver um link
// nesta campanha, devolve o mesmo em vez de criar outro.
async function enviarIndicacao({ empresaId, clienteId, campanhaId, baseUrl }) {
  const campanhaRes = await db.query("SELECT * FROM campanhas_indicacao WHERE id = $1 AND empresa_id = $2", [
    campanhaId,
    empresaId,
  ]);
  const campanhaRow = campanhaRes.rows[0];
  if (!campanhaRow) throw Object.assign(new Error("Campanha de indicação não encontrada."), { status: 404 });
  const campanha = mapCampanhaIndicacao(campanhaRow);

  const clienteRes = await db.query("SELECT * FROM clientes WHERE id = $1 AND empresa_id = $2", [
    clienteId,
    empresaId,
  ]);
  const clienteRow = clienteRes.rows[0];
  if (!clienteRow) throw Object.assign(new Error("Cliente não encontrado."), { status: 404 });
  const cliente = mapCliente(clienteRow);

  const existenteRes = await db.query(
    "SELECT * FROM indicacoes WHERE campanha_id = $1 AND cliente_indicador_id = $2",
    [campanhaId, clienteId]
  );
  if (existenteRes.rows[0]) {
    const row = existenteRes.rows[0];
    const envioAutomatico = await enviarPelaWame({ empresaId, cliente, mensagem: row.mensagem, indicacaoId: row.id });
    return { indicacao: mapIndicacao(row), mensagem: row.mensagem, link: row.link_whatsapp, envioAutomatico };
  }

  const tok = novoToken();
  const linkIndicacao = `${baseUrl}/#/indicacao/${tok}`;
  const mensagem = montarMensagemIndicacao({ campanha, clienteIndicador: cliente, linkIndicacao });
  const linkWhatsapp = montarLinkWhatsapp(cliente.telefone, mensagem);

  const insertRes = await db.query(
    `INSERT INTO indicacoes (empresa_id, campanha_id, cliente_indicador_id, token, link_whatsapp, mensagem, status)
     VALUES ($1,$2,$3,$4,$5,$6,'enviado')
     RETURNING *`,
    [empresaId, campanhaId, clienteId, tok, linkWhatsapp, mensagem]
  );
  const envioAutomatico = await enviarPelaWame({ empresaId, cliente, mensagem, indicacaoId: insertRes.rows[0].id });
  return { indicacao: mapIndicacao(insertRes.rows[0]), mensagem, link: linkWhatsapp, envioAutomatico };
}

module.exports = { enviarIndicacao };
