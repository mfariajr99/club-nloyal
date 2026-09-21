const express = require("express");
const db = require("../db");
const { mapCampanha, mapCliente, mapVoucher, mapCampanhaIndicacao } = require("../mappers");
const {
  last4, novoCodigoVoucher, montarMensagemRetorno, montarLinkWhatsapp,
  telefoneWa, montarMensagemEncaminhar, montarLinkWhatsappGenerico,
} = require("../mensagens");

const router = express.Router();

// Subconjunto seguro dos dados da empresa para expor nas páginas públicas
// (resgate/indicação) — usado para pintar a cor da marca, mostrar a logo e o
// selo "empresa verificada" ao cliente. Não inclui id nem whatsapp_numero cru
// (o WhatsApp só chega ao cliente já embutido em linkRetorno, quando existe).
function empresaPublica(e) {
  if (!e) return null;
  return { nome: e.nome, nomeEmpresa: e.nome, corPrincipal: e.cor_principal, logoUrl: e.logo_url, instagram: e.instagram };
}

async function carregarContexto(token) {
  const envioRes = await db.query("SELECT * FROM envios_giftback WHERE token_resgate = $1", [token]);
  const envioRow = envioRes.rows[0];
  if (!envioRow) return null;
  const [campanhaRes, clienteRes, empresaRes] = await Promise.all([
    db.query("SELECT * FROM campanhas_giftback WHERE id = $1", [envioRow.campanha_id]),
    db.query("SELECT * FROM clientes WHERE id = $1", [envioRow.cliente_id]),
    db.query("SELECT * FROM empresas WHERE id = $1", [envioRow.empresa_id]),
  ]);
  const campanha = mapCampanha(campanhaRes.rows[0]);
  const cliente = mapCliente(clienteRes.rows[0]);
  const empresa = empresaRes.rows[0];
  const produtoAlvoRes = await db.query("SELECT nome FROM produtos WHERE id = $1", [campanha.produtoAlvoId]);
  const produtoAlvoNome = produtoAlvoRes.rows[0]?.nome || "";
  return { envioRow, campanha, cliente, empresa, produtoAlvoNome };
}

router.get("/resgate/:token", async (req, res) => {
  const ctx = await carregarContexto(req.params.token);
  if (!ctx) {
    return res.json({ erro: "Este link de giftback não foi encontrado. Confira se o link foi copiado corretamente." });
  }
  const { envioRow, campanha, cliente, produtoAlvoNome } = ctx;

  if (envioRow.status === "enviado") {
    await db.query("UPDATE envios_giftback SET status = 'visualizado', data_visualizacao = now() WHERE id = $1", [
      envioRow.id,
    ]);
  }
  if (envioRow.status === "cancelado") {
    return res.json({ erro: "Este giftback foi cancelado e não pode mais ser ativado." });
  }
  if (envioRow.status === "expirado") {
    return res.json({ erro: "O prazo para ativar este giftback já passou." });
  }
  if (envioRow.status === "confirmado") {
    const voucherRes = await db.query("SELECT * FROM vouchers WHERE envio_id = $1", [envioRow.id]);
    const voucher = mapVoucher(voucherRes.rows[0]);
    const empresaWhatsapp = ctx.empresa.whatsapp_numero;
    let linkRetorno = null;
    if (empresaWhatsapp) {
      const mensagemRetorno = montarMensagemRetorno({ campanha, cliente, produtoAlvoNome, voucher });
      linkRetorno = montarLinkWhatsapp(empresaWhatsapp, mensagemRetorno);
    }
    return res.json({ confirmado: true, cliente, campanha, produtoAlvoNome, voucher, linkRetorno, empresa: empresaPublica(ctx.empresa) });
  }
  return res.json({ pendente: true, cliente, campanha, produtoAlvoNome, empresa: empresaPublica(ctx.empresa) });
});

router.post("/resgate/:token/confirmar", async (req, res) => {
  const ultimos4Informados = String(req.body?.ultimos4 || "").replace(/\D/g, "");
  const ctx = await carregarContexto(req.params.token);
  if (!ctx) return res.status(404).json({ erro: "Token de resgate inválido." });
  const { envioRow, campanha, cliente, produtoAlvoNome } = ctx;

  if (envioRow.status === "confirmado") return res.status(409).json({ erro: "Este giftback já foi confirmado anteriormente." });
  if (envioRow.status === "expirado" || envioRow.status === "cancelado") {
    return res.status(409).json({ erro: `Este giftback está com status '${envioRow.status}' e não pode mais ser confirmado.` });
  }
  if (ultimos4Informados.length !== 4) {
    return res.status(400).json({ erro: "Digite os 4 últimos números do seu WhatsApp." });
  }
  if (ultimos4Informados !== last4(cliente.telefone)) {
    return res.status(400).json({ erro: "Esses números não conferem com o WhatsApp cadastrado. Tente novamente." });
  }

  const codigo = novoCodigoVoucher();
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE envios_giftback SET status = 'confirmado', data_confirmacao = now() WHERE id = $1", [
      envioRow.id,
    ]);
    const voucherRes = await client.query(
      `INSERT INTO vouchers (envio_id, codigo, valor, produto_alvo_id, valido_ate, status)
       VALUES ($1,$2,$3,$4, now() + ($5 || ' days')::interval, 'ativo')
       RETURNING *`,
      [envioRow.id, codigo, campanha.valor, campanha.produtoAlvoId, campanha.validadeDias]
    );
    await client.query("COMMIT");
    const voucher = mapVoucher(voucherRes.rows[0]);
    const empresaWhatsapp = ctx.empresa.whatsapp_numero;
    let linkRetorno = null;
    if (empresaWhatsapp) {
      const mensagemRetorno = montarMensagemRetorno({ campanha, cliente, produtoAlvoNome, voucher });
      linkRetorno = montarLinkWhatsapp(empresaWhatsapp, mensagemRetorno);
    }
    res.json({ confirmado: true, cliente, campanha, produtoAlvoNome, voucher, linkRetorno });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ erro: "Não foi possível confirmar o resgate." });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------
// Programa de Indicações — link público (o mesmo link serve tanto para o
// indicador ver as condições e encaminhar, quanto para o amigo indicado
// confirmar a indicação; por isso não muda de "status" quando visualizado
// além de enviado → visualizado, e pode ser confirmado várias vezes por
// pessoas diferentes).
// ---------------------------------------------------------------------
async function carregarContextoIndicacao(token) {
  const indicacaoRes = await db.query("SELECT * FROM indicacoes WHERE token = $1", [token]);
  const indicacaoRow = indicacaoRes.rows[0];
  if (!indicacaoRow) return null;
  const [campanhaRes, clienteRes, empresaRes] = await Promise.all([
    db.query("SELECT * FROM campanhas_indicacao WHERE id = $1", [indicacaoRow.campanha_id]),
    db.query("SELECT * FROM clientes WHERE id = $1", [indicacaoRow.cliente_indicador_id]),
    db.query("SELECT * FROM empresas WHERE id = $1", [indicacaoRow.empresa_id]),
  ]);
  const campanha = mapCampanhaIndicacao(campanhaRes.rows[0]);
  const clienteIndicador = mapCliente(clienteRes.rows[0]);
  return { indicacaoRow, campanha, clienteIndicador, empresa: empresaRes.rows[0] };
}

router.get("/indicacao/:token", async (req, res) => {
  const ctx = await carregarContextoIndicacao(req.params.token);
  if (!ctx) {
    return res.json({ erro: "Este link de indicação não foi encontrado. Confira se o link foi copiado corretamente." });
  }
  const { indicacaoRow, campanha, clienteIndicador } = ctx;

  if (indicacaoRow.status === "cancelado") {
    return res.json({ erro: "Este programa de indicação foi cancelado." });
  }
  if (campanha.status === "encerrada") {
    return res.json({ erro: "Esta campanha de indicação já foi encerrada." });
  }
  if (indicacaoRow.status === "enviado") {
    await db.query("UPDATE indicacoes SET status = 'visualizado', data_visualizacao = now() WHERE id = $1", [
      indicacaoRow.id,
    ]);
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  const linkIndicacao = `${baseUrl}/#/indicacao/${indicacaoRow.token}`;
  const mensagemEncaminhar = montarMensagemEncaminhar({ campanha, clienteIndicador, linkIndicacao });
  const linkEncaminhar = montarLinkWhatsappGenerico(mensagemEncaminhar);

  const confirmadosRes = await db.query("SELECT COUNT(*)::int AS total FROM indicados WHERE indicacao_id = $1", [
    indicacaoRow.id,
  ]);

  res.json({
    campanha,
    clienteIndicador,
    totalConfirmados: confirmadosRes.rows[0].total,
    mensagemEncaminhar,
    linkEncaminhar,
    empresa: empresaPublica(ctx.empresa),
  });
});

router.post("/indicacao/:token/confirmar", async (req, res) => {
  const nome = String(req.body?.nome || "").trim();
  const telefone = String(req.body?.telefone || "").trim();
  const ctx = await carregarContextoIndicacao(req.params.token);
  if (!ctx) return res.status(404).json({ erro: "Link de indicação inválido." });
  const { indicacaoRow, campanha, clienteIndicador } = ctx;

  if (indicacaoRow.status === "cancelado") {
    return res.status(409).json({ erro: "Este programa de indicação foi cancelado." });
  }
  if (campanha.status === "encerrada") {
    return res.status(409).json({ erro: "Esta campanha de indicação já foi encerrada." });
  }
  if (!nome || telefoneWa(telefone).length < 8) {
    return res.status(400).json({ erro: "Informe seu nome completo e um WhatsApp válido." });
  }
  const telefoneDigitos = telefoneWa(telefone);
  if (telefoneDigitos === telefoneWa(clienteIndicador.telefone)) {
    return res.status(400).json({ erro: "Você não pode confirmar a sua própria indicação." });
  }

  const jaConfirmadoRes = await db.query(
    `SELECT 1 FROM indicados WHERE indicacao_id = $1 AND regexp_replace(telefone_whatsapp, '\\D', '', 'g') = $2`,
    [indicacaoRow.id, telefoneDigitos]
  );
  if (jaConfirmadoRes.rows[0]) {
    return res.status(409).json({ erro: "Este WhatsApp já confirmou esta indicação anteriormente." });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const existenteRes = await client.query(
      `SELECT id FROM clientes
       WHERE empresa_id = $1 AND regexp_replace(telefone_whatsapp, '\\D', '', 'g') = $2`,
      [indicacaoRow.empresa_id, telefoneDigitos]
    );
    let clienteId;
    if (existenteRes.rows[0]) {
      clienteId = existenteRes.rows[0].id;
    } else {
      const novoClienteRes = await client.query(
        `INSERT INTO clientes (empresa_id, nome, telefone_whatsapp) VALUES ($1,$2,$3) RETURNING id`,
        [indicacaoRow.empresa_id, nome, telefone]
      );
      clienteId = novoClienteRes.rows[0].id;
    }
    await client.query(
      `INSERT INTO indicados (empresa_id, indicacao_id, cliente_id, nome, telefone_whatsapp)
       VALUES ($1,$2,$3,$4,$5)`,
      [indicacaoRow.empresa_id, indicacaoRow.id, clienteId, nome, telefone]
    );
    await client.query("COMMIT");
    res.status(201).json({ confirmado: true, nome, premioIndicado: campanha.premioIndicado, campanha });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ erro: "Não foi possível confirmar sua indicação." });
  } finally {
    client.release();
  }
});

module.exports = router;
