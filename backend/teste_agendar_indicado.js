// Teste manual do botão "Agendar agora" na tela do amigo indicado: confere
// que a confirmação da indicação agora devolve um código de voucher e um
// link de WhatsApp pro estabelecimento, com a mensagem certa. Uso:
// node teste_agendar_indicado.js
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
  const email = "agendar_" + Date.now() + "@exemplo.com";
  let r = await req("/auth/registrar-empresa", { method: "POST", body: {
    nomeEmpresa: "Empresa Agendar Teste", nomeAdmin: "Admin Agendar", email, senha: "senha123",
  }});
  const auth = { Authorization: "Bearer " + r.data.token };
  check("empresa criada", r.status === 200 || r.status === 201, r);

  // WhatsApp de contato é obrigatório pro link de agendar existir
  r = await req("/config/empresa", { method: "PUT", headers: auth, body: { whatsapp: "+55 11 98888-7777" } });
  check("whatsapp de contato salvo", r.status === 200, r);

  r = await req("/clientes", { method: "POST", headers: auth, body: { nome: "Indicador Agendar", telefone: "+5511977776666" } });
  const clienteIndicadorId = r.data.id;

  r = await req("/indicacoes/campanhas", { method: "POST", headers: auth, body: {
    titulo: "Campanha Agendar Teste", metaIndicacoes: 1, premioIndicador: "10% de desconto",
    premioIndicado: "Day care grátis para o pet", condicoes: "", mensagem: "Indique!",
    textoEncaminhar: "Vem! {{link_indicacao}}", validade: 30,
  }});
  const campanhaId = r.data.id;

  r = await req("/indicacoes/campanhas/" + campanhaId + "/enviar", { method: "POST", headers: auth, body: { clienteId: clienteIndicadorId } });
  const tok = r.data.indicacao && r.data.indicacao.token;
  check("indicação enviada, token obtido", !!tok, r.data);

  // Estágio A: o indicador confirma participação (últimos 4 do WhatsApp "...6666")
  r = await req("/public/indicacao/" + tok + "/confirmar-indicador", { method: "POST", body: { ultimos4: "6666" } });
  check("indicador confirmou participação", r.status === 200, r);

  // Estágio B: o amigo confirma nome + WhatsApp -> deve vir codigoVoucher + linkAgendar
  r = await req("/public/indicacao/" + tok + "/confirmar", { method: "POST", body: {
    nome: "Amigo Agendar Teste", telefone: "+5511955554444",
  }});
  check("amigo confirmou a indicação", r.status === 201, r);
  check("resposta traz codigoVoucher no formato IN-XXXXXX", /^IN-[A-Z0-9]{6}$/.test(r.data.codigoVoucher || ""), r.data);
  check("resposta traz linkAgendar apontando pro wa.me do número certo", (r.data.linkAgendar || "").startsWith("https://wa.me/5511988887777?text="), r.data);
  const mensagemDecodificada = decodeURIComponent((r.data.linkAgendar || "").split("?text=")[1] || "");
  check("mensagem menciona o prêmio do indicado", mensagemDecodificada.includes("Day care grátis para o pet"), mensagemDecodificada);
  check("mensagem menciona o código do voucher", mensagemDecodificada.includes(r.data.codigoVoucher), mensagemDecodificada);
  check("mensagem tem os campos Data e Horário para o cliente preencher", mensagemDecodificada.includes("Data:") && mensagemDecodificada.includes("Horário:"), mensagemDecodificada);
  console.log("mensagem final:", JSON.stringify(mensagemDecodificada));

  console.log("\n" + (falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"));
  process.exit(falhas === 0 ? 0 : 1);
}

main().catch(e => { console.error("ERRO INESPERADO:", e); process.exit(1); });
