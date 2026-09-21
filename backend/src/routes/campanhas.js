const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapCampanha } = require("../mappers");
const { clientesElegiveisParaCampanha } = require("../elegibilidade");
const { enviarGiftback } = require("../enviarGiftback");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM campanhas_giftback WHERE empresa_id = $1 ORDER BY criado_em DESC", [
    req.usuario.empresaId,
  ]);
  res.json(result.rows.map(mapCampanha));
});

router.post("/", async (req, res) => {
  const {
    titulo, produtoGatilhoId, produtoAlvoId, valor, valorMinimo,
    mensagem, regras, mensagemRetorno, validade, permiteReenvio, intervalo,
  } = req.body || {};
  if (!titulo || !produtoGatilhoId || !produtoAlvoId || !valor || !validade || !mensagem) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios da campanha." });
  }
  if (produtoGatilhoId === produtoAlvoId) {
    return res.status(400).json({ erro: "O produto-alvo precisa ser diferente do produto-gatilho." });
  }
  try {
    const result = await db.query(
      `INSERT INTO campanhas_giftback
         (empresa_id, titulo, produto_gatilho_id, produto_alvo_id, valor_giftback, valor_minimo_compra,
          texto_mensagem, regras_uso, mensagem_retorno, validade_dias, permite_reenvio, intervalo_reenvio_dias)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        req.usuario.empresaId, titulo.trim(), produtoGatilhoId, produtoAlvoId,
        parseFloat(valor), parseFloat(valorMinimo) || 0,
        mensagem, regras || "", mensagemRetorno || "", parseInt(validade, 10),
        !!permiteReenvio, permiteReenvio ? (parseInt(intervalo, 10) || 30) : null,
      ]
    );
    res.status(201).json(mapCampanha(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível criar a campanha." });
  }
});

router.get("/:id/elegiveis", async (req, res) => {
  const lista = await clientesElegiveisParaCampanha(req.usuario.empresaId, req.params.id);
  res.json(lista);
});

router.post("/:id/enviar", async (req, res) => {
  const { clienteId, compraId } = req.body || {};
  if (!clienteId || !compraId) return res.status(400).json({ erro: "clienteId e compraId são obrigatórios." });
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const resultado = await enviarGiftback({
      empresaId: req.usuario.empresaId, clienteId, campanhaId: req.params.id, compraId, baseUrl,
    });
    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ erro: err.message || "Não foi possível enviar o giftback." });
  }
});

module.exports = router;
