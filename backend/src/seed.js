// Cria uma empresa de demonstração com login pronto, para testar o sistema
// (local ou recém-implantado) sem precisar cadastrar tudo manualmente.
// Uso: node src/seed.js
// Login gerado: admin@bellaestetica.com.br / demo1234
require("dotenv").config();
const db = require("./db");
const { hashSenha } = require("./auth");
const { novoToken, novoCodigoVoucher, montarMensagem, montarLinkWhatsapp } = require("./mensagens");

async function main() {
  const existente = await db.query("SELECT id FROM empresas WHERE nome = $1", ["Clínica Bella Estética (demo)"]);
  if (existente.rows.length) {
    console.log("Empresa de demonstração já existe — nada a fazer.");
    process.exit(0);
  }

  const empresaRes = await db.query(
    "INSERT INTO empresas (nome, whatsapp_numero) VALUES ($1,$2) RETURNING *",
    ["Clínica Bella Estética (demo)", "+55 11 3456-7890"]
  );
  const empresa = empresaRes.rows[0];

  const senhaHash = await hashSenha("demo1234");
  await db.query(
    "INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel) VALUES ($1,$2,$3,$4,'admin')",
    [empresa.id, "Admin Demo", "admin@bellaestetica.com.br", senhaHash]
  );

  const produtos = {};
  for (const nome of ["Botox", "Limpeza de Pele", "Preenchimento Labial"]) {
    const r = await db.query("INSERT INTO produtos (empresa_id, nome, categoria) VALUES ($1,$2,'Procedimento estético') RETURNING *", [
      empresa.id, nome,
    ]);
    produtos[nome] = r.rows[0];
  }

  const clientes = {};
  for (const [nome, tel] of [
    ["Marina Souza", "+55 11 91234-5678"],
    ["Carla Nunes", "+55 11 99876-5432"],
    ["Rafael Lima", "+55 11 98765-1234"],
  ]) {
    const r = await db.query("INSERT INTO clientes (empresa_id, nome, telefone_whatsapp) VALUES ($1,$2,$3) RETURNING *", [
      empresa.id, nome, tel,
    ]);
    clientes[nome] = r.rows[0];
  }

  const campA = (
    await db.query(
      `INSERT INTO campanhas_giftback
         (empresa_id, titulo, produto_gatilho_id, produto_alvo_id, valor_giftback, valor_minimo_compra,
          texto_mensagem, regras_uso, mensagem_retorno, validade_dias)
       VALUES ($1,'Botox → Limpeza de Pele',$2,$3,200,150,
         'Oi {{nome_cliente}}! Como agradecimento pelo seu {{produto_gatilho}}, deixamos um Giftback de {{valor_giftback}} para {{produto_alvo}}, válido por {{validade_dias}} dias após a confirmação. Ativa aqui: {{link_resgate}}',
         'Válido para uma limpeza de pele por cliente. Compra mínima de R$ 150,00.',
         'Obrigado pelo Giftback, foi resgatado com sucesso! Quero agendar meu procedimento de {{produto_alvo}} para: ',
         15)
       RETURNING *`,
      [empresa.id, produtos["Botox"].id, produtos["Limpeza de Pele"].id]
    )
  ).rows[0];

  const campB = (
    await db.query(
      `INSERT INTO campanhas_giftback
         (empresa_id, titulo, produto_gatilho_id, produto_alvo_id, valor_giftback, valor_minimo_compra,
          texto_mensagem, regras_uso, mensagem_retorno, validade_dias)
       VALUES ($1,'Botox → Preenchimento Labial',$2,$3,150,200,
         'Oi {{nome_cliente}}! Preparamos um Giftback de {{valor_giftback}} para você conhecer nosso {{produto_alvo}}, válido por {{validade_dias}} dias. Ativa aqui: {{link_resgate}}',
         'Sujeito a avaliação prévia. Compra mínima de R$ 200,00.',
         'Obrigado pelo Giftback, foi resgatado com sucesso! Quero agendar meu procedimento de {{produto_alvo}} para: ',
         20)
       RETURNING *`,
      [empresa.id, produtos["Botox"].id, produtos["Preenchimento Labial"].id]
    )
  ).rows[0];

  // Ciclo fechado (Rafael) para o dashboard já nascer com números diferentes de zero.
  const compra3 = (
    await db.query(
      "INSERT INTO compras (empresa_id, cliente_id, produto_id, valor, origem, data) VALUES ($1,$2,$3,1500,'compra_direta', now() - interval '12 days') RETURNING *",
      [empresa.id, clientes["Rafael Lima"].id, produtos["Botox"].id]
    )
  ).rows[0];
  await db.query(
    "INSERT INTO cliente_produto (cliente_id, produto_id, origem, primeira_compra_em) VALUES ($1,$2,'compra_direta', now() - interval '12 days')",
    [clientes["Rafael Lima"].id, produtos["Botox"].id]
  );

  const mensagem3 = montarMensagem({
    campanha: { valor: 150, valorMinimoCompra: 200, validadeDias: 20, mensagem: campB.texto_mensagem },
    cliente: { nome: "Rafael Lima" },
    produtoGatilhoNome: "Botox",
    produtoAlvoNome: "Preenchimento Labial",
    linkResgate: "https://exemplo.invalido/resgate/seed-demo-token-3",
  });
  const envio3 = (
    await db.query(
      `INSERT INTO envios_giftback (empresa_id, cliente_id, campanha_id, compra_origem_id, token_resgate, link_whatsapp, mensagem, status, data_envio, data_visualizacao, data_confirmacao)
       VALUES ($1,$2,$3,$4,'seed-demo-token-3',$5,$6,'confirmado', now() - interval '12 days', now() - interval '11 days', now() - interval '11 days')
       RETURNING *`,
      [empresa.id, clientes["Rafael Lima"].id, campB.id, compra3.id, montarLinkWhatsapp("+55 11 98765-1234", mensagem3), mensagem3]
    )
  ).rows[0];
  await db.query(
    `INSERT INTO vouchers (envio_id, codigo, valor, produto_alvo_id, emitido_em, valido_ate, status, data_utilizacao, compra_gerada_id)
     VALUES ($1,'GB-DEMO03',150,$2, now() - interval '11 days', now() + interval '9 days', 'utilizado', now() - interval '9 days', NULL)`,
    [envio3.id, produtos["Preenchimento Labial"].id]
  );
  const compra4 = (
    await db.query(
      "INSERT INTO compras (empresa_id, cliente_id, produto_id, valor, origem, data) VALUES ($1,$2,$3,260,'conversao_giftback', now() - interval '9 days') RETURNING id",
      [empresa.id, clientes["Rafael Lima"].id, produtos["Preenchimento Labial"].id]
    )
  ).rows[0];
  await db.query("UPDATE vouchers SET compra_gerada_id = $1 WHERE envio_id = $2", [compra4.id, envio3.id]);
  await db.query(
    "INSERT INTO cliente_produto (cliente_id, produto_id, origem, primeira_compra_em) VALUES ($1,$2,'conversao_giftback', now() - interval '9 days')",
    [clientes["Rafael Lima"].id, produtos["Preenchimento Labial"].id]
  );

  console.log("Empresa de demonstração criada.");
  console.log("Login: admin@bellaestetica.com.br / senha: demo1234");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
