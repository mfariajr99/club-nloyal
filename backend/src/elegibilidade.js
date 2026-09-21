const db = require("./db");
const { mapCampanha } = require("./mappers");

// Mesma regra usada no schema.sql (vw_campanhas_elegiveis) e no protótipo:
// 1) campanha ativa com produto_gatilho == produto comprado
// 2) cliente ainda não é cliente do produto-alvo (não-canibalização)
// 3) campanha ainda não foi enviada a esse cliente (ou já passou o intervalo de reenvio)
async function campanhasElegiveis(empresaId, clienteId, produtoId) {
  const result = await db.query(
    `SELECT cg.* FROM campanhas_giftback cg
     WHERE cg.empresa_id = $1 AND cg.produto_gatilho_id = $2 AND cg.status = 'ativa'
       AND NOT EXISTS (
         SELECT 1 FROM cliente_produto cp WHERE cp.cliente_id = $3 AND cp.produto_id = cg.produto_alvo_id
       )
       AND NOT EXISTS (
         SELECT 1 FROM envios_giftback eg
         WHERE eg.cliente_id = $3 AND eg.campanha_id = cg.id AND eg.status <> 'cancelado'
           AND (
             cg.permite_reenvio = FALSE
             OR eg.data_envio > now() - (cg.intervalo_reenvio_dias || ' days')::interval
           )
       )`,
    [empresaId, produtoId, clienteId]
  );
  return result.rows.map(mapCampanha);
}

// Para uma campanha, lista os clientes que já compraram o produto-gatilho
// (pela compra mais recente) e ainda são elegíveis — usada no envio manual
// por cliente dentro da tela de Campanhas.
async function clientesElegiveisParaCampanha(empresaId, campanhaId) {
  const campanhaRes = await db.query("SELECT * FROM campanhas_giftback WHERE id = $1 AND empresa_id = $2", [
    campanhaId,
    empresaId,
  ]);
  const campanha = campanhaRes.rows[0];
  if (!campanha) return [];

  const result = await db.query(
    `WITH ultima_compra AS (
       SELECT DISTINCT ON (cliente_id) cliente_id, id AS compra_id, data
       FROM compras
       WHERE empresa_id = $1 AND produto_id = $2
       ORDER BY cliente_id, data DESC
     )
     SELECT uc.cliente_id, uc.compra_id, uc.data, c.nome, c.telefone_whatsapp
     FROM ultima_compra uc
     JOIN clientes c ON c.id = uc.cliente_id
     WHERE NOT EXISTS (
       SELECT 1 FROM cliente_produto cp WHERE cp.cliente_id = uc.cliente_id AND cp.produto_id = $3
     )
     AND NOT EXISTS (
       SELECT 1 FROM envios_giftback eg
       WHERE eg.cliente_id = uc.cliente_id AND eg.campanha_id = $4 AND eg.status <> 'cancelado'
         AND (
           $5 = FALSE
           OR eg.data_envio > now() - ($6 || ' days')::interval
         )
     )
     ORDER BY c.nome`,
    [
      empresaId,
      campanha.produto_gatilho_id,
      campanha.produto_alvo_id,
      campanhaId,
      campanha.permite_reenvio,
      campanha.intervalo_reenvio_dias || 0,
    ]
  );
  return result.rows.map((r) => ({
    clienteId: r.cliente_id,
    compraId: r.compra_id,
    dataCompra: r.data,
    nome: r.nome,
    telefone: r.telefone_whatsapp,
  }));
}

module.exports = { campanhasElegiveis, clientesElegiveisParaCampanha };
