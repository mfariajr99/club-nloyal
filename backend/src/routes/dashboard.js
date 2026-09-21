const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const empresaId = req.usuario.empresaId;

  await db.query(
    `UPDATE vouchers SET status = 'expirado'
     WHERE status = 'ativo' AND valido_ate < now()
       AND envio_id IN (SELECT id FROM envios_giftback WHERE empresa_id = $1)`,
    [empresaId]
  );

  const enviosRes = await db.query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'confirmado') AS confirmados
     FROM envios_giftback WHERE empresa_id = $1`,
    [empresaId]
  );
  const envios = enviosRes.rows[0];
  const totalEnvios = Number(envios.total);
  const confirmados = Number(envios.confirmados);
  const taxaConfirmados = totalEnvios ? Math.round((confirmados / totalEnvios) * 100) : 0;

  // Cada voucher, com a compra mínima e o valor do giftback da sua campanha —
  // base para os três indicadores de faturamento e o comparativo.
  const vouchersRes = await db.query(
    `SELECT v.status, v.valido_ate, v.valor AS valor_giftback, cg.valor_minimo_compra
     FROM vouchers v
     JOIN envios_giftback eg ON eg.id = v.envio_id
     JOIN campanhas_giftback cg ON cg.id = eg.campanha_id
     WHERE eg.empresa_id = $1`,
    [empresaId]
  );
  let vouchersAtivos = 0, vouchersUtilizados = 0;
  let faturamentoAtivoEmResgate = 0, giftbackEnviadoAcumulado = 0, faturamentoEstimadoTotal = 0;
  const agora = new Date();
  vouchersRes.rows.forEach((v) => {
    const minimo = Number(v.valor_minimo_compra || 0);
    giftbackEnviadoAcumulado += Number(v.valor_giftback || 0);
    faturamentoEstimadoTotal += minimo;
    const ativoEValido = v.status === "ativo" && new Date(v.valido_ate) >= agora;
    if (ativoEValido) {
      vouchersAtivos += 1;
      faturamentoAtivoEmResgate += minimo;
    }
    if (v.status === "utilizado") vouchersUtilizados += 1;
  });

  const faturamentoRes = await db.query(
    `SELECT COALESCE(SUM(valor),0) AS total, COUNT(*) AS qtd FROM compras
     WHERE empresa_id = $1 AND origem = 'conversao_giftback'`,
    [empresaId]
  );
  const faturamentoEfetivo = Number(faturamentoRes.rows[0].total);
  const qtdConversoes = Number(faturamentoRes.rows[0].qtd);

  const clientesRes = await db.query("SELECT COUNT(*) AS total FROM clientes WHERE empresa_id = $1", [empresaId]);
  const campanhasRes = await db.query(
    "SELECT COUNT(*) AS total FROM campanhas_giftback WHERE empresa_id = $1 AND status = 'ativa'",
    [empresaId]
  );

  res.json({
    enviosTotal: totalEnvios,
    taxaConfirmados,
    vouchersAtivos,
    vouchersUtilizados,
    faturamentoAtivoEmResgate,
    giftbackEnviadoAcumulado,
    faturamentoEstimadoTotal,
    faturamentoEfetivo,
    qtdConversoes,
    clientesTotal: Number(clientesRes.rows[0].total),
    campanhasAtivas: Number(campanhasRes.rows[0].total),
  });
});

module.exports = router;
