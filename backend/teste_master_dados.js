// Teste manual das novas rotas de consulta somente-leitura do Master
// (clientes/produtos/campanhas/envios/vouchers/indicações/vendas de uma
// empresa específica). Semeia dados reais via a própria API do tenant e
// confere que o Master enxerga tudo. Uso: node teste_master_dados.js
const BASE = "http://localhost:3000/api";

async function req(path, opts) {
  opts = opts || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  const resp = await fetch(BASE + path, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = null;
  try { data = await resp.json(); } catch (e) {}
  return { status: resp.status, data };
}

let falhas = 0;
function check(desc, cond, extra) {
  if (cond) { console.log("PASS - " + desc); }
  else { console.log("FAIL - " + desc + (extra ? " :: " + JSON.stringify(extra) : "")); falhas++; }
}

async function main() {
  let r = await req("/master/login", { method: "POST", body: { login: "mlf", senha: "008088" } });
  const authMaster = { Authorization: "Bearer " + r.data.token };

  const email = "dados_" + Date.now() + "@exemplo.com";
  r = await req("/master/empresas", { method: "POST", headers: authMaster, body: {
    nomeEmpresa: "Empresa Dados Teste", nomeAdmin: "Admin Dados", email, senha: "senha123",
  }});
  const empresaId = r.data.id;
  check("empresa de teste criada", !!empresaId, r);

  r = await req("/auth/login", { method: "POST", body: { email, senha: "senha123" } });
  const authTenant = { Authorization: "Bearer " + r.data.token };
  check("login do tenant ok", r.status === 200, r);

  // produtos
  r = await req("/produtos", { method: "POST", headers: authTenant, body: { nome: "Corte de cabelo", categoria: "Serviço" } });
  const produtoGatilho = r.data.id;
  r = await req("/produtos", { method: "POST", headers: authTenant, body: { nome: "Escova", categoria: "Serviço" } });
  const produtoAlvo = r.data.id;
  check("2 produtos criados", !!produtoGatilho && !!produtoAlvo, r);

  // cliente
  r = await req("/clientes", { method: "POST", headers: authTenant, body: { nome: "Cliente Teste Master", telefone: "+5511999990000" } });
  const clienteId = r.data.id;
  check("cliente criado", !!clienteId, r);

  // campanha giftback
  r = await req("/campanhas", { method: "POST", headers: authTenant, body: {
    titulo: "Campanha Teste Master", produtoGatilhoId: produtoGatilho, produtoAlvoId: produtoAlvo,
    valor: 30, valorMinimo: 50, mensagem: "Você ganhou um giftback!", regras: "", mensagemRetorno: "",
    validade: 15, permiteReenvio: false, intervalo: null,
  }});
  const campanhaId = r.data.id;
  check("campanha de giftback criada", !!campanhaId, r);

  // venda (compra) do produto gatilho -> deve gerar elegibilidade pra campanha
  r = await req("/compras", { method: "POST", headers: authTenant, body: { clienteId, produtoId: produtoGatilho, valor: 80 } });
  const compraId = r.data.compra && r.data.compra.id;
  check("venda registrada", !!compraId, r);
  check("venda ficou elegível pra campanha criada", (r.data.elegiveis||[]).some(e => e.id === campanhaId), r.data);

  // dispara o envio do giftback, e confirma o resgate (últimos 4 do
  // WhatsApp "+5511999990000" -> "0000") pra gerar o voucher de verdade
  r = await req("/compras/" + compraId + "/enviar/" + campanhaId, { method: "POST", headers: authTenant });
  check("giftback enviado", r.status === 201, r);
  const tokenResgate = r.data.envio && r.data.envio.tok;
  r = await req("/public/resgate/" + tokenResgate + "/confirmar", { method: "POST", body: { ultimos4: "0000" } });
  check("resgate confirmado (voucher gerado)", r.status === 200 || r.status === 201, r);

  // campanha de indicação + envio de indicação
  r = await req("/indicacoes/campanhas", { method: "POST", headers: authTenant, body: {
    titulo: "Indique um amigo", metaIndicacoes: 1, premioIndicador: "10% de desconto",
    premioIndicado: "Brinde de boas-vindas", condicoes: "válido por cliente",
    mensagem: "Indique e ganhe!", textoEncaminhar: "Vem comigo! {{link_indicacao}}", validade: 30,
  }});
  const campanhaIndicacaoId = r.data.id;
  check("campanha de indicação criada", !!campanhaIndicacaoId, r);
  r = await req("/indicacoes/campanhas/" + campanhaIndicacaoId + "/enviar", { method: "POST", headers: authTenant, body: { clienteId } });
  check("indicação enviada", r.status === 201, r);

  // --- agora confere o que o Master enxerga ---
  r = await req("/master/empresas/" + empresaId + "/clientes", { headers: authMaster });
  check("Master vê o cliente criado", r.status === 200 && r.data.some(c => c.id === clienteId), r.data);

  r = await req("/master/empresas/" + empresaId + "/produtos", { headers: authMaster });
  check("Master vê os 2 produtos", r.status === 200 && r.data.length === 2, r.data);

  r = await req("/master/empresas/" + empresaId + "/campanhas", { headers: authMaster });
  check("Master vê a campanha de giftback com nomes de produto resolvidos", r.status === 200 &&
    r.data.some(c => c.id === campanhaId && c.produtoGatilhoNome === "Corte de cabelo" && c.produtoAlvoNome === "Escova"), r.data);

  r = await req("/master/empresas/" + empresaId + "/campanhas-indicacao", { headers: authMaster });
  check("Master vê a campanha de indicação", r.status === 200 && r.data.some(c => c.id === campanhaIndicacaoId), r.data);

  r = await req("/master/empresas/" + empresaId + "/envios", { headers: authMaster });
  check("Master vê o envio de giftback com nome do cliente e da campanha", r.status === 200 &&
    r.data.some(e => e.clienteNome === "Cliente Teste Master" && e.campanhaTitulo === "Campanha Teste Master"), r.data);

  r = await req("/master/empresas/" + empresaId + "/vouchers", { headers: authMaster });
  check("Master vê o voucher emitido", r.status === 200 && r.data.length === 1 && r.data[0].clienteNome === "Cliente Teste Master", r.data);

  r = await req("/master/empresas/" + empresaId + "/indicacoes", { headers: authMaster });
  check("Master vê a indicação enviada com nome do indicador", r.status === 200 &&
    r.data.some(i => i.indicadorNome === "Cliente Teste Master" && i.campanhaTitulo === "Indique um amigo"), r.data);

  r = await req("/master/empresas/" + empresaId + "/vendas", { headers: authMaster });
  check("Master vê a venda registrada", r.status === 200 &&
    r.data.some(v => v.id === compraId && v.clienteNome === "Cliente Teste Master" && v.produtoNome === "Corte de cabelo"), r.data);

  // rota inexistente/empresa inexistente -> 404, não lista vazia
  r = await req("/master/empresas/00000000-0000-0000-0000-000000000000/clientes", { headers: authMaster });
  check("empresa inexistente dá 404 (não lista vazia)", r.status === 404, r);

  console.log("\n" + (falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"));
  process.exit(falhas === 0 ? 0 : 1);
}

main().catch(e => { console.error("ERRO INESPERADO:", e); process.exit(1); });
