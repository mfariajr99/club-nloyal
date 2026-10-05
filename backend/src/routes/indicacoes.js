const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapCampanhaIndicacao, mapIndicacao, mapIndicado } = require("../mappers");
const { enviarIndicacao } = require("../enviarIndicacao");

const router = express.Router();
router.use(requireAuth);

router.get("/campanhas", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM campanhas_indicacao WHERE empresa_id = $1 ORDER BY criado_em DESC",
    [req.usuario.empresaId]
  );
  res.json(result.rows.map(mapCampanhaIndicacao));
});

router.post("/campanhas", async (req, res) => {
  const {
    titulo, metaIndicacoes, premioIndicador, premioIndicado,
    condicoes, mensagem, textoEncaminhar, validade,
  } = req.body || {};
  if (!titulo || !metaIndicacoes || !premioIndicador || !mensagem || !textoEncaminhar || !validade) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios da campanha de indicação." });
  }
  try {
    const result = await db.query(
      `INSERT INTO campanhas_indicacao
         (empresa_id, titulo, meta_indicacoes, premio_indicador, premio_indicado, condicoes, texto_mensagem, texto_encaminhar, validade_dias)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.usuario.empresaId, titulo.trim(), parseInt(metaIndicacoes, 10), premioIndicador.trim(),
        (premioIndicado || "").trim(), condicoes || "", mensagem, textoEncaminhar, parseInt(validade, 10),
      ]
    );
    res.status(201).json(mapCampanhaIndicacao(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível criar a campanha de indicação." });
  }
});

// Todos os links pessoais já gerados para uma campanha (usado para saber,
// na tela de Consultar Indicação, quais clientes já receberam o convite).
router.get("/campanhas/:id/enviadas", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM indicacoes WHERE campanha_id = $1 AND empresa_id = $2",
    [req.params.id, req.usuario.empresaId]
  );
  res.json(result.rows.map(mapIndicacao));
});

router.post("/campanhas/:id/enviar", async (req, res) => {
  const { clienteId } = req.body || {};
  if (!clienteId) return res.status(400).json({ erro: "clienteId é obrigatório." });
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const resultado = await enviarIndicacao({
      empresaId: req.usuario.empresaId, clienteId, campanhaId: req.params.id, baseUrl,
    });
    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ erro: err.message || "Não foi possível enviar a indicação." });
  }
});

// Lista de Indicados: todo amigo já confirmado, com quem o indicou e em qual campanha.
router.get("/indicados", async (req, res) => {
  const result = await db.query(
    `SELECT ind.*, i.campanha_id, i.cliente_indicador_id, ci.titulo AS campanha_titulo,
            c.nome AS indicador_nome, c.telefone_whatsapp AS indicador_telefone
     FROM indicados ind
     JOIN indicacoes i ON i.id = ind.indicacao_id
     JOIN campanhas_indicacao ci ON ci.id = i.campanha_id
     JOIN clientes c ON c.id = i.cliente_indicador_id
     WHERE ind.empresa_id = $1
     ORDER BY ind.data_confirmacao DESC`,
    [req.usuario.empresaId]
  );
  res.json(
    result.rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      telefone: r.telefone_whatsapp,
      dataConfirmacao: r.data_confirmacao,
      campanhaId: r.campanha_id,
      campanhaTitulo: r.campanha_titulo,
      indicadorId: r.cliente_indicador_id,
      indicadorNome: r.indicador_nome,
      indicadorTelefone: r.indicador_telefone,
    }))
  );
});

// Acompanhamento de indicadores: TODO indicador que já confirmou
// participação na campanha (ativou o link), com o progresso de amigos
// indicados confirmados até a meta e se o prêmio dele já foi resgatado.
// Substitui o antigo /resgataveis (que só trazia quem já tinha batido a
// meta): agora também aparece quem ainda está "aguardando retorno" de
// indicações, pra dar mais clareza do estágio de cada indicador na tela
// "Resgate Indicações". LEFT JOIN em indicados (em vez de INNER JOIN) é o
// que permite um indicador aparecer aqui mesmo com 0 amigos confirmados
// ainda, contanto que ele mesmo já tenha confirmado participação.
router.get("/indicadores", async (req, res) => {
  const result = await db.query(
    `SELECT i.id AS indicacao_id, i.campanha_id, i.cliente_indicador_id, i.codigo,
            i.indicador_confirmado_em,
            ci.titulo AS campanha_titulo, ci.meta_indicacoes, ci.premio_indicador,
            c.nome AS indicador_nome, c.telefone_whatsapp AS indicador_telefone,
            COUNT(ind.id) AS total_confirmados,
            MAX(ind.data_confirmacao) AS ultima_confirmacao,
            (r.id IS NOT NULL) AS resgatado
     FROM indicacoes i
     JOIN campanhas_indicacao ci ON ci.id = i.campanha_id
     JOIN clientes c ON c.id = i.cliente_indicador_id
     LEFT JOIN indicados ind ON ind.indicacao_id = i.id
     LEFT JOIN resgates_indicacao r ON r.indicacao_id = i.id
     WHERE i.empresa_id = $1
       AND i.indicador_confirmado_em IS NOT NULL
     GROUP BY i.id, i.codigo, i.indicador_confirmado_em, ci.titulo, ci.meta_indicacoes,
              ci.premio_indicador, c.nome, c.telefone_whatsapp, r.id
     ORDER BY i.indicador_confirmado_em DESC`,
    [req.usuario.empresaId]
  );
  res.json(
    result.rows.map((r) => {
      const totalConfirmados = Number(r.total_confirmados);
      return {
        indicacaoId: r.indicacao_id,
        campanhaId: r.campanha_id,
        campanhaTitulo: r.campanha_titulo,
        metaIndicacoes: r.meta_indicacoes,
        premioIndicador: r.premio_indicador,
        indicadorId: r.cliente_indicador_id,
        indicadorNome: r.indicador_nome,
        indicadorTelefone: r.indicador_telefone,
        codigo: r.codigo || null,
        totalConfirmados,
        metaAtingida: totalConfirmados >= r.meta_indicacoes,
        resgatado: !!r.resgatado,
        indicadorConfirmadoEm: r.indicador_confirmado_em,
        ultimaConfirmacao: r.ultima_confirmacao,
      };
    })
  );
});

// Drill-down de UM indicador: os amigos indicados por ele que já
// confirmaram — usado no "X / Y" clicável da tela "Resgate Indicações".
router.get("/:indicacaoId/indicados", async (req, res) => {
  const indicacaoRes = await db.query("SELECT id FROM indicacoes WHERE id = $1 AND empresa_id = $2", [
    req.params.indicacaoId,
    req.usuario.empresaId,
  ]);
  if (!indicacaoRes.rows[0]) return res.status(404).json({ erro: "Indicação não encontrada." });
  const result = await db.query(
    "SELECT * FROM indicados WHERE indicacao_id = $1 ORDER BY data_confirmacao DESC",
    [req.params.indicacaoId]
  );
  res.json(result.rows.map(mapIndicado));
});

router.post("/resgates", async (req, res) => {
  const { indicacaoId, valorVendaGerada } = req.body || {};
  const valor = Number(valorVendaGerada);
  if (!indicacaoId || !(valor >= 0)) {
    return res.status(400).json({ erro: "Informe o valor da venda gerada." });
  }
  try {
    const indicacaoRes = await db.query("SELECT * FROM indicacoes WHERE id = $1 AND empresa_id = $2", [
      indicacaoId,
      req.usuario.empresaId,
    ]);
    if (!indicacaoRes.rows[0]) return res.status(404).json({ erro: "Indicação não encontrada." });
    const result = await db.query(
      `INSERT INTO resgates_indicacao (empresa_id, indicacao_id, valor_venda_gerada)
       VALUES ($1,$2,$3) RETURNING *`,
      [req.usuario.empresaId, indicacaoId, valor]
    );
    res.status(201).json({ ok: true, resgate: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ erro: "Este prêmio já foi resgatado anteriormente." });
    res.status(500).json({ erro: "Não foi possível registrar o resgate." });
  }
});

module.exports = router;
