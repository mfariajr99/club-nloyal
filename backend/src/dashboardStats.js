const db = require("./db");

// Estatísticas de uma única empresa — exatamente a mesma lógica que já vivia
// dentro de GET /api/dashboard (rota do painel de cada empresa). Fatorada
// aqui para poder ser reaproveitada também pelo Painel Master
// (routes/master.js), que chama esta função uma vez por empresa em vez de
// duplicar as queries.
async function calcularDashboard(empresaId) {
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

  return {
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
  };
}

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function rotuloMes(ym) {
  // ym vem como "AAAA-MM" (to_char(..., 'YYYY-MM')) — formata como o gráfico
  // do Painel Master espera: "mmm/aa" (ex.: "set/26").
  const [ano, mes] = ym.split("-");
  return MESES_ABREV[Number(mes) - 1] + "/" + ano.slice(2);
}

// Analytics detalhado de uma empresa para o Painel Master: números brutos de
// Giftback e Indicação (o frontend deriva os % e o "ticket médio" a partir
// deles, igual ao protótipo) mais a evolução mês a mês dos últimos 6 meses
// dos dois programas — tudo a partir de dados reais, sem nenhum valor fake.
async function calcularAnalyticsMaster(empresaId) {
  const [
    giftbackTotaisRes,
    giftbackValorRes,
    giftbackVendasRes,
    indicacaoEnviadasRes,
    indicacaoConfirmadasRes,
    indicacaoVendasRes,
    giftbackEvolucaoRes,
    indicacaoEvolucaoRes,
  ] = await Promise.all([
    db.query(
      `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'confirmado') AS confirmados
       FROM envios_giftback WHERE empresa_id = $1`,
      [empresaId]
    ),
    db.query(
      `SELECT COALESCE(SUM(v.valor),0) AS total FROM vouchers v
       JOIN envios_giftback eg ON eg.id = v.envio_id WHERE eg.empresa_id = $1`,
      [empresaId]
    ),
    db.query(
      `SELECT COALESCE(SUM(valor),0) AS total FROM compras
       WHERE empresa_id = $1 AND origem = 'conversao_giftback'`,
      [empresaId]
    ),
    db.query("SELECT COUNT(*) AS total FROM indicacoes WHERE empresa_id = $1", [empresaId]),
    db.query("SELECT COUNT(*) AS total FROM indicados WHERE empresa_id = $1", [empresaId]),
    db.query(
      `SELECT COALESCE(SUM(valor_venda_gerada),0) AS total FROM resgates_indicacao WHERE empresa_id = $1`,
      [empresaId]
    ),
    db.query(
      `WITH meses AS (
         SELECT date_trunc('month', now()) - (n || ' months')::interval AS mes
         FROM generate_series(5, 0, -1) AS n
       ),
       enviados AS (
         SELECT date_trunc('month', data_envio) AS mes, COUNT(*) AS qtd
         FROM envios_giftback WHERE empresa_id = $1 GROUP BY 1
       ),
       confirmados AS (
         SELECT date_trunc('month', data_confirmacao) AS mes, COUNT(*) AS qtd
         FROM envios_giftback
         WHERE empresa_id = $1 AND status = 'confirmado' AND data_confirmacao IS NOT NULL
         GROUP BY 1
       )
       SELECT to_char(m.mes,'YYYY-MM') AS ym, COALESCE(e.qtd,0) AS enviados, COALESCE(c.qtd,0) AS confirmados
       FROM meses m
       LEFT JOIN enviados e ON e.mes = m.mes
       LEFT JOIN confirmados c ON c.mes = m.mes
       ORDER BY m.mes`,
      [empresaId]
    ),
    db.query(
      `WITH meses AS (
         SELECT date_trunc('month', now()) - (n || ' months')::interval AS mes
         FROM generate_series(5, 0, -1) AS n
       ),
       enviadas AS (
         SELECT date_trunc('month', data_envio) AS mes, COUNT(*) AS qtd
         FROM indicacoes WHERE empresa_id = $1 GROUP BY 1
       ),
       confirmadas AS (
         SELECT date_trunc('month', data_confirmacao) AS mes, COUNT(*) AS qtd
         FROM indicados WHERE empresa_id = $1 GROUP BY 1
       )
       SELECT to_char(m.mes,'YYYY-MM') AS ym, COALESCE(e.qtd,0) AS enviadas, COALESCE(c.qtd,0) AS confirmadas
       FROM meses m
       LEFT JOIN enviadas e ON e.mes = m.mes
       LEFT JOIN confirmadas c ON c.mes = m.mes
       ORDER BY m.mes`,
      [empresaId]
    ),
  ]);

  const indicPorMes = {};
  indicacaoEvolucaoRes.rows.forEach((r) => { indicPorMes[r.ym] = r; });
  const evolucaoMensal = giftbackEvolucaoRes.rows.map((r) => {
    const indic = indicPorMes[r.ym] || { enviadas: 0, confirmadas: 0 };
    return {
      mes: rotuloMes(r.ym),
      giftbackEnviados: Number(r.enviados),
      giftbackConfirmados: Number(r.confirmados),
      indicacaoEnviados: Number(indic.enviadas),
      indicacaoConfirmados: Number(indic.confirmadas),
    };
  });

  return {
    giftbackEnviadosQtd: Number(giftbackTotaisRes.rows[0].total),
    giftbackEnviadosValor: Number(giftbackValorRes.rows[0].total),
    giftbackConfirmadosQtd: Number(giftbackTotaisRes.rows[0].confirmados),
    giftbackVendasGeradasValor: Number(giftbackVendasRes.rows[0].total),
    indicacaoEnviadosQtd: Number(indicacaoEnviadasRes.rows[0].total),
    indicacaoConfirmadosQtd: Number(indicacaoConfirmadasRes.rows[0].total),
    indicacaoVendasGeradasValor: Number(indicacaoVendasRes.rows[0].total),
    evolucaoMensal,
  };
}

module.exports = { calcularDashboard, calcularAnalyticsMaster };
