const express = require("express");
const db = require("../db");
const { verificarLoginMaster, emitirTokenMaster, requireMaster, hashSenha } = require("../auth");
const { criarEmpresaEAdmin } = require("../criarEmpresa");
const { calcularDashboard, calcularAnalyticsMaster } = require("../dashboardStats");
const {
  mapEmpresa, mapCampanha, mapCampanhaIndicacao,
  mapCliente, mapProduto, mapCompra, mapEnvio, mapVoucher, mapIndicacao, mapIndicado,
} = require("../mappers");

// Teto de linhas nas consultas de "dados da empresa" do Master (vendas,
// envios, vouchers, indicações) — são telas de consulta/auditoria, não
// listas paginadas; 300 registros mais recentes cobre o uso normal sem
// arriscar uma consulta pesada numa empresa com muito histórico.
const LIMITE_CONSULTA = 300;

const STATUS_VALIDOS = ["ativa", "bloqueada", "desativada"];

// Acha o admin "principal" de uma empresa (o mais antigo com papel admin) —
// é nele que "Editar dados" e "Nova senha" do Master mexem, já que hoje uma
// empresa sempre tem pelo menos um admin (criado junto com ela).
async function buscarAdminPrincipal(empresaId) {
  const r = await db.query(
    "SELECT * FROM usuarios WHERE empresa_id = $1 AND papel = 'admin' ORDER BY criado_em ASC LIMIT 1",
    [empresaId]
  );
  return r.rows[0] || null;
}

const router = express.Router();

// Login do super-admin (Painel Master) — completamente separado do login por
// empresa: login/senha fixos, sem empresaId no token. A tela de login é a
// mesma do painel normal (o frontend tenta este endpoint quando o campo
// "e-mail" digitado é literalmente "mlf").
router.post("/login", async (req, res) => {
  const { login, senha } = req.body || {};
  if (!login || !senha) return res.status(400).json({ erro: "Informe login e senha." });
  const ok = await verificarLoginMaster(login, senha);
  if (!ok) return res.status(401).json({ erro: "Login ou senha incorretos." });
  const token = emitirTokenMaster();
  res.json({ token, master: true });
});

router.use(requireMaster);

// Lista as empresas da plataforma com um resumo de desempenho cada —
// reaproveita calcularDashboard() (a mesma lógica usada no painel de cada
// empresa) uma vez por empresa, em vez de reescrever as métricas numa
// consulta agregada à parte. Por padrão não traz as desativadas (mesmo
// soft-delete do painel de cada empresa: os dados continuam no banco, só
// somem da lista); ?desativadas=1 traz só essas, para a tela "Ver empresas
// desativadas" do Master.
router.get("/empresas", async (req, res) => {
  try {
    const querDesativadas = req.query.desativadas === "1";
    const empresasRes = await db.query(
      "SELECT * FROM empresas WHERE status " + (querDesativadas ? "= 'desativada'" : "<> 'desativada'") +
        " ORDER BY criado_em DESC"
    );
    const lista = await Promise.all(
      empresasRes.rows.map(async (e) => {
        const stats = await calcularDashboard(e.id);
        const admin = await buscarAdminPrincipal(e.id);
        return {
          id: e.id,
          nome: e.nome,
          criadoEm: e.criado_em,
          ativo: e.ativo,
          status: e.status || "ativa",
          adminNome: admin ? admin.nome : null,
          adminEmail: admin ? admin.email : null,
          clientesTotal: stats.clientesTotal,
          campanhasAtivas: stats.campanhasAtivas,
          enviosTotal: stats.enviosTotal,
          taxaConfirmados: stats.taxaConfirmados,
          faturamentoEfetivo: stats.faturamentoEfetivo,
          giftbackEnviadoAcumulado: stats.giftbackEnviadoAcumulado,
        };
      })
    );
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar as empresas." });
  }
});

// Drill-down de uma empresa: mesmo formato de estatísticas do GET /api/dashboard
// do tenant, a lista de campanhas (Giftback e Indicação) dela, os dados do
// admin principal e o analytics detalhado (% e evolução de 6 meses) usado
// pelos cards de Giftback/Indicações da tela de detalhe do Master.
router.get("/empresas/:id", async (req, res) => {
  try {
    const empresaRes = await db.query("SELECT * FROM empresas WHERE id = $1", [req.params.id]);
    const empresa = empresaRes.rows[0];
    if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada." });
    const [stats, campanhasRes, campanhasIndicacaoRes, admin, analytics] = await Promise.all([
      calcularDashboard(empresa.id),
      db.query("SELECT * FROM campanhas_giftback WHERE empresa_id = $1 ORDER BY criado_em DESC", [empresa.id]),
      db.query("SELECT * FROM campanhas_indicacao WHERE empresa_id = $1 ORDER BY criado_em DESC", [empresa.id]),
      buscarAdminPrincipal(empresa.id),
      calcularAnalyticsMaster(empresa.id),
    ]);
    res.json({
      empresa: mapEmpresa(empresa),
      criadoEm: empresa.criado_em,
      adminNome: admin ? admin.nome : null,
      adminEmail: admin ? admin.email : null,
      stats,
      campanhas: campanhasRes.rows.map(mapCampanha),
      campanhasIndicacao: campanhasIndicacaoRes.rows.map(mapCampanhaIndicacao),
      analytics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar esta empresa." });
  }
});

// Cria uma nova empresa cliente + seu admin — mesma lógica de
// POST /api/auth/registrar-empresa (função compartilhada em criarEmpresa.js),
// mas o Master não "vira" usuário dessa empresa: não devolve token de login,
// só a confirmação de que a conta foi criada. Aceita opcionalmente a cor e a
// logo já na criação (tela "Adicionar cliente" do Master tem o seletor).
router.post("/empresas", async (req, res) => {
  try {
    const { empresa, usuario } = await criarEmpresaEAdmin(req.body || {});
    const { corPrincipal, logoUrl } = req.body || {};
    if (corPrincipal || logoUrl) {
      await db.query(
        "UPDATE empresas SET cor_principal = COALESCE($1, cor_principal), logo_url = COALESCE($2, logo_url) WHERE id = $3",
        [corPrincipal || null, logoUrl || null, empresa.id]
      );
    }
    res.status(201).json({ id: empresa.id, nome: empresa.nome, email: usuario.email, criadoEm: empresa.criado_em });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ erro: err.message });
    console.error(err);
    res.status(500).json({ erro: "Não foi possível criar a empresa." });
  }
});

// Editar dados: nome da empresa + nome/e-mail do admin principal dela.
router.put("/empresas/:id", async (req, res) => {
  try {
    const empresaRes = await db.query("SELECT * FROM empresas WHERE id = $1", [req.params.id]);
    if (!empresaRes.rows[0]) return res.status(404).json({ erro: "Empresa não encontrada." });
    const { nome, adminNome, adminEmail } = req.body || {};
    if (!nome || !String(nome).trim() || !adminNome || !String(adminNome).trim() || !adminEmail || !String(adminEmail).trim()) {
      return res.status(400).json({ erro: "Preencha nome da empresa, nome do admin e e-mail." });
    }
    const emailNorm = String(adminEmail).toLowerCase().trim();
    const admin = await buscarAdminPrincipal(req.params.id);
    if (!admin) return res.status(404).json({ erro: "Esta empresa não tem um administrador cadastrado." });
    if (emailNorm !== admin.email) {
      const existente = await db.query("SELECT id FROM usuarios WHERE email = $1 AND id <> $2", [emailNorm, admin.id]);
      if (existente.rows.length) return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
    }
    const empresaAtualizada = await db.query(
      "UPDATE empresas SET nome = $1 WHERE id = $2 RETURNING *",
      [String(nome).trim(), req.params.id]
    );
    await db.query("UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3", [String(adminNome).trim(), emailNorm, admin.id]);
    res.json({ empresa: mapEmpresa(empresaAtualizada.rows[0]), adminNome: String(adminNome).trim(), adminEmail: emailNorm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível salvar os dados." });
  }
});

// Nova senha: redefine a senha do admin principal da empresa.
router.put("/empresas/:id/senha", async (req, res) => {
  try {
    const { senha } = req.body || {};
    if (!senha || String(senha).length < 6) {
      return res.status(400).json({ erro: "A senha precisa ter pelo menos 6 caracteres." });
    }
    const admin = await buscarAdminPrincipal(req.params.id);
    if (!admin) return res.status(404).json({ erro: "Esta empresa não tem um administrador cadastrado." });
    const hash = await hashSenha(String(senha));
    await db.query("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [hash, admin.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível redefinir a senha." });
  }
});

// Bloquear/desbloquear/desativar/reativar — os quatro são a mesma troca de
// status (ver comentário em schema.sql); o frontend manda o valor-alvo.
router.put("/empresas/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ erro: "Status inválido." });
    }
    const result = await db.query("UPDATE empresas SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ erro: "Empresa não encontrada." });
    res.json(mapEmpresa(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível atualizar o status." });
  }
});

// Aparência: cor principal e logo usadas nas páginas públicas de giftback e
// indicação desta empresa — mesmos campos que o PUT /api/config/empresa do
// próprio tenant edita, só que aqui o Master edita de fora, sem precisar
// estar logado como aquela empresa.
router.put("/empresas/:id/aparencia", async (req, res) => {
  try {
    const { corPrincipal, logoUrl } = req.body || {};
    const result = await db.query(
      "UPDATE empresas SET cor_principal = $1, logo_url = $2 WHERE id = $3 RETURNING *",
      [String(corPrincipal || "").trim(), String(logoUrl || ""), req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ erro: "Empresa não encontrada." });
    res.json(mapEmpresa(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível salvar a aparência." });
  }
});

// ---------------------------------------------------------------------
// Consulta somente-leitura dos dados operacionais de uma empresa cliente —
// o Master não "vira" usuário dela (não tem PUT/DELETE aqui, só GET), mas
// pode acompanhar tudo que ela cadastrou/gerou: clientes, produtos,
// campanhas, vendas, envios de giftback, vouchers e indicações. Cada rota
// confere primeiro que a empresa existe, pra devolver 404 em vez de uma
// lista vazia enganosa quando o :id é inválido.
// ---------------------------------------------------------------------
async function confirmarEmpresaExiste(id) {
  const r = await db.query("SELECT id FROM empresas WHERE id = $1", [id]);
  return !!r.rows[0];
}

router.get("/empresas/:id/clientes", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query("SELECT * FROM clientes WHERE empresa_id = $1 ORDER BY criado_em DESC", [req.params.id]);
    res.json(r.rows.map((row) => Object.assign(mapCliente(row), { criadoEm: row.criado_em })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar os clientes." });
  }
});

router.get("/empresas/:id/produtos", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query("SELECT * FROM produtos WHERE empresa_id = $1 ORDER BY nome ASC", [req.params.id]);
    res.json(r.rows.map((row) => Object.assign(mapProduto(row), {
      valorReferencia: row.valor_referencia !== null ? Number(row.valor_referencia) : null,
      ativo: row.ativo,
      criadoEm: row.criado_em,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar os produtos." });
  }
});

router.get("/empresas/:id/campanhas", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query(
      `SELECT cg.*, pg.nome AS produto_gatilho_nome, pa.nome AS produto_alvo_nome
       FROM campanhas_giftback cg
       JOIN produtos pg ON pg.id = cg.produto_gatilho_id
       JOIN produtos pa ON pa.id = cg.produto_alvo_id
       WHERE cg.empresa_id = $1 ORDER BY cg.criado_em DESC`,
      [req.params.id]
    );
    res.json(r.rows.map((row) => Object.assign(mapCampanha(row), {
      produtoGatilhoNome: row.produto_gatilho_nome, produtoAlvoNome: row.produto_alvo_nome,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar as campanhas de giftback." });
  }
});

router.get("/empresas/:id/campanhas-indicacao", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query("SELECT * FROM campanhas_indicacao WHERE empresa_id = $1 ORDER BY criado_em DESC", [req.params.id]);
    res.json(r.rows.map(mapCampanhaIndicacao));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar as campanhas de indicação." });
  }
});

router.get("/empresas/:id/vendas", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query(
      `SELECT c.*, cl.nome AS cliente_nome, p.nome AS produto_nome
       FROM compras c
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN produtos p ON p.id = c.produto_id
       WHERE c.empresa_id = $1 ORDER BY c.data DESC LIMIT ${LIMITE_CONSULTA}`,
      [req.params.id]
    );
    res.json(r.rows.map((row) => Object.assign(mapCompra(row), {
      clienteNome: row.cliente_nome, produtoNome: row.produto_nome,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar as vendas." });
  }
});

router.get("/empresas/:id/envios", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query(
      `SELECT eg.*, cl.nome AS cliente_nome, cg.titulo AS campanha_titulo
       FROM envios_giftback eg
       JOIN clientes cl ON cl.id = eg.cliente_id
       JOIN campanhas_giftback cg ON cg.id = eg.campanha_id
       WHERE eg.empresa_id = $1 ORDER BY eg.data_envio DESC LIMIT ${LIMITE_CONSULTA}`,
      [req.params.id]
    );
    res.json(r.rows.map((row) => Object.assign(mapEnvio(row), {
      clienteNome: row.cliente_nome, campanhaTitulo: row.campanha_titulo,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar os envios de giftback." });
  }
});

router.get("/empresas/:id/vouchers", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const r = await db.query(
      `SELECT v.*, eg.cliente_id, cl.nome AS cliente_nome
       FROM vouchers v
       JOIN envios_giftback eg ON eg.id = v.envio_id
       JOIN clientes cl ON cl.id = eg.cliente_id
       WHERE eg.empresa_id = $1 ORDER BY v.emitido_em DESC LIMIT ${LIMITE_CONSULTA}`,
      [req.params.id]
    );
    res.json(r.rows.map((row) => Object.assign(mapVoucher(row), { clienteNome: row.cliente_nome })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar os vouchers." });
  }
});

router.get("/empresas/:id/indicacoes", async (req, res) => {
  try {
    if (!(await confirmarEmpresaExiste(req.params.id))) return res.status(404).json({ erro: "Empresa não encontrada." });
    const [indicacoesRes, indicadosRes] = await Promise.all([
      db.query(
        `SELECT i.*, cl.nome AS indicador_nome, ci.titulo AS campanha_titulo
         FROM indicacoes i
         JOIN clientes cl ON cl.id = i.cliente_indicador_id
         JOIN campanhas_indicacao ci ON ci.id = i.campanha_id
         WHERE i.empresa_id = $1 ORDER BY i.data_envio DESC LIMIT ${LIMITE_CONSULTA}`,
        [req.params.id]
      ),
      db.query("SELECT * FROM indicados WHERE empresa_id = $1", [req.params.id]),
    ]);
    const indicadosPorIndicacao = {};
    indicadosRes.rows.forEach((row) => {
      (indicadosPorIndicacao[row.indicacao_id] = indicadosPorIndicacao[row.indicacao_id] || []).push(mapIndicado(row));
    });
    res.json(indicacoesRes.rows.map((row) => Object.assign(mapIndicacao(row), {
      indicadorNome: row.indicador_nome,
      campanhaTitulo: row.campanha_titulo,
      indicados: indicadosPorIndicacao[row.id] || [],
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível carregar as indicações." });
  }
});

module.exports = router;
