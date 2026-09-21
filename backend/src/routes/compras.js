const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapCompra } = require("../mappers");
const { campanhasElegiveis } = require("../elegibilidade");
const { enviarGiftback } = require("../enviarGiftback");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM compras WHERE empresa_id = $1 ORDER BY data DESC", [
    req.usuario.empresaId,
  ]);
  res.json(result.rows.map(mapCompra));
});

router.post("/", async (req, res) => {
  const { clienteId, produtoId, valor } = req.body || {};
  if (!clienteId || !produtoId || valor == null) {
    return res.status(400).json({ erro: "Cliente, produto e valor são obrigatórios." });
  }
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const compraRes = await client.query(
      `INSERT INTO compras (empresa_id, cliente_id, produto_id, valor, origem)
       VALUES ($1,$2,$3,$4,'compra_direta') RETURNING *`,
      [req.usuario.empresaId, clienteId, produtoId, parseFloat(valor)]
    );
    await client.query(
      `INSERT INTO cliente_produto (cliente_id, produto_id, origem)
       VALUES ($1,$2,'compra_direta')
       ON CONFLICT (cliente_id, produto_id) DO NOTHING`,
      [clienteId, produtoId]
    );
    await client.query("COMMIT");
    const compra = mapCompra(compraRes.rows[0]);
    const elegiveis = await campanhasElegiveis(req.usuario.empresaId, clienteId, produtoId);
    res.status(201).json({ compra, elegiveis });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ erro: "Não foi possível registrar a compra." });
  } finally {
    client.release();
  }
});

// Disparo de giftback a partir da tela "Nova compra" (mesma lógica do botão
// dentro da campanha, mas aqui a compra de origem já é conhecida).
router.post("/:compraId/enviar/:campanhaId", async (req, res) => {
  const { compraId, campanhaId } = req.params;
  const compraRes = await db.query("SELECT * FROM compras WHERE id = $1 AND empresa_id = $2", [
    compraId, req.usuario.empresaId,
  ]);
  if (!compraRes.rows[0]) return res.status(404).json({ erro: "Compra não encontrada." });
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const resultado = await enviarGiftback({
      empresaId: req.usuario.empresaId,
      clienteId: compraRes.rows[0].cliente_id,
      campanhaId,
      compraId,
      baseUrl,
    });
    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ erro: err.message || "Não foi possível enviar o giftback." });
  }
});

module.exports = router;
