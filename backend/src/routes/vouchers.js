const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapVoucher } = require("../mappers");

const router = express.Router();
router.use(requireAuth);

async function expirarVencidos(empresaId) {
  await db.query(
    `UPDATE vouchers SET status = 'expirado'
     WHERE status = 'ativo' AND valido_ate < now()
       AND envio_id IN (SELECT id FROM envios_giftback WHERE empresa_id = $1)`,
    [empresaId]
  );
}

router.get("/", async (req, res) => {
  await expirarVencidos(req.usuario.empresaId);
  const result = await db.query(
    `SELECT v.* FROM vouchers v
     JOIN envios_giftback eg ON eg.id = v.envio_id
     WHERE eg.empresa_id = $1`,
    [req.usuario.empresaId]
  );
  res.json(result.rows.map(mapVoucher));
});

// "Venda gerada": dá baixa no voucher, respeitando a compra mínima da
// campanha, e registra a nova compra do produto-alvo (origem conversao_giftback).
router.post("/:envioId/usar", async (req, res) => {
  const { envioId } = req.params;
  const valorVenda = Number(req.body?.valorVenda);
  await expirarVencidos(req.usuario.empresaId);

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const voucherRes = await client.query(
      `SELECT v.*, eg.empresa_id, eg.cliente_id, eg.campanha_id FROM vouchers v
       JOIN envios_giftback eg ON eg.id = v.envio_id
       WHERE v.envio_id = $1 AND eg.empresa_id = $2 FOR UPDATE`,
      [envioId, req.usuario.empresaId]
    );
    const voucher = voucherRes.rows[0];
    if (!voucher) {
      await client.query("ROLLBACK");
      return res.status(404).json({ erro: "Voucher não encontrado." });
    }
    if (voucher.status !== "ativo") {
      await client.query("ROLLBACK");
      return res.status(409).json({ erro: "Este voucher não está mais ativo." });
    }
    if (!(valorVenda > 0)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ erro: "Informe o valor da venda gerada." });
    }
    const campanhaRes = await client.query("SELECT valor_minimo_compra FROM campanhas_giftback WHERE id = $1", [
      voucher.campanha_id,
    ]);
    const minimo = Number(campanhaRes.rows[0]?.valor_minimo_compra || 0);
    if (minimo && valorVenda < minimo) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        erro: `O valor da venda precisa ser de pelo menos R$ ${minimo.toFixed(2).replace(".", ",")} (compra mínima desta campanha).`,
      });
    }
    const compraRes = await client.query(
      `INSERT INTO compras (empresa_id, cliente_id, produto_id, valor, origem)
       VALUES ($1,$2,$3,$4,'conversao_giftback') RETURNING id`,
      [voucher.empresa_id, voucher.cliente_id, voucher.produto_alvo_id, valorVenda]
    );
    const compraId = compraRes.rows[0].id;
    await client.query(
      `INSERT INTO cliente_produto (cliente_id, produto_id, origem)
       VALUES ($1,$2,'conversao_giftback')
       ON CONFLICT (cliente_id, produto_id) DO NOTHING`,
      [voucher.cliente_id, voucher.produto_alvo_id]
    );
    await client.query(
      `UPDATE vouchers SET status = 'utilizado', data_utilizacao = now(), compra_gerada_id = $1 WHERE envio_id = $2`,
      [compraId, envioId]
    );
    await client.query("COMMIT");
    res.json({ ok: true, compraId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ erro: "Não foi possível registrar o uso do voucher." });
  } finally {
    client.release();
  }
});

module.exports = router;
