// Testes automatizados da integração WAME. Sobe uma WAME FALSA em
// localhost:3002 (imitando as respostas documentadas em wame.api.br/docs/api)
// e exercita o backend real em localhost:3000 — que precisa estar rodando com
// WAME_BASE_URL=http://localhost:3002 e PUBLIC_BASE_URL=http://localhost:3000.
//
// Uso: node teste_wame.js
require("dotenv").config();
const http = require("http");
const BASE = "http://localhost:3000/api";

// ---------------------------------------------------------------- WAME falsa
const CHAVE_VALIDA = "CHAVE-TESTE-123456";
const fake = { conectado: false, enviados: [], webhookConfig: null, falharEnvio: false, nextId: 1 };
const servidorFake = http.createServer((req, res) => {
  let corpo = "";
  req.on("data", (c) => (corpo += c));
  req.on("end", () => {
    const json = corpo ? JSON.parse(corpo) : null;
    const [, chave, ...resto] = req.url.split("?")[0].split("/");
    const caminho = "/" + resto.join("/");
    const responder = (status, obj) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
    if (decodeURIComponent(chave) !== CHAVE_VALIDA) return responder(401, { error: true, message: "Invalid key" });
    if (caminho === "/instance" && req.method === "GET") {
      return responder(200, { status: 200, instance: {
        phoneConnected: fake.conectado,
        user: fake.conectado ? { id: "5511988887777@s.whatsapp.net", name: "Loja Teste" } : null,
        webhook: fake.webhookConfig,
      } });
    }
    if (caminho === "/instance" && req.method === "POST") {
      if (fake.conectado) return responder(200, { status: 200, phoneConnected: true, user: { id: "5511988887777@s.whatsapp.net", name: "Loja Teste" } });
      return responder(200, { status: 200, phoneConnected: false, qrcode: "x", image: "data:image/png;base64,iVBORw0KGgo=", user: null });
    }
    if (caminho === "/instance" && req.method === "PUT") { fake.webhookConfig = json; return responder(200, { status: 200, message: "Settings updated" }); }
    if (caminho === "/message/text" && req.method === "POST") {
      if (fake.falharEnvio) return responder(200, { status: 400, error: true, message: "Instance not connected" });
      const id = "3EB0TESTE" + fake.nextId++;
      fake.enviados.push(Object.assign({ id }, json));
      return responder(200, { status: 200, data: { key: { remoteJid: json.to + "@s.whatsapp.net", fromMe: true, id }, status: "PENDING" } });
    }
    responder(404, { error: true, message: "not found" });
  });
});

// ---------------------------------------------------------------- utilitários
let falhas = 0;
function ok(cond, desc) { console.log((cond ? "  ✓ " : "  ✗ ") + desc); if (!cond) falhas++; }
async function req(path, { method = "GET", body, token } = {}) {
  const resp = await fetch(BASE + path, {
    method,
    headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await resp.json(); } catch (e) {}
  return { status: resp.status, data };
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
function envelope(field, value) {
  return { object: "wame", provider: "whatsapp", instance: "x", official: false,
    entry: [{ id: "wame.x", changes: [{ field, value: Object.assign({ messaging_product: "whatsapp", metadata: { display_phone_number: "5511988887777", phone_number_id: "x" } }, value) }] }] };
}
async function novaEmpresa(sufixo) {
  const email = `wame_${sufixo}_${Date.now()}@teste.com`;
  const r = await req("/auth/registrar-empresa", { method: "POST", body: { nomeEmpresa: "Loja WAME " + sufixo, nomeAdmin: "Admin", email, senha: "senha123" } });
  return r.data.token;
}

async function main() {
  await new Promise((r) => servidorFake.listen(3002, r));
  const tokenA = await novaEmpresa("a");
  const tokenB = await novaEmpresa("b");

  console.log("\n1. Sem WAME configurada");
  let r = await req("/config/wame", { token: tokenA });
  ok(r.status === 200 && r.data.configurado === false, "status inicial = não configurado");
  r = await req("/config/wame", {});
  ok(r.status === 401, "rota exige login");

  console.log("\n2. Cadastro da chave");
  r = await req("/config/wame/chave", { method: "PUT", token: tokenA, body: { chave: "chave-errada" } });
  ok(r.status === 400 && /não reconheceu/.test(r.data.erro), "chave inválida é recusada com mensagem clara");
  r = await req("/config/wame/chave", { method: "PUT", token: tokenA, body: { chave: "  " + CHAVE_VALIDA + "  " } });
  ok(r.status === 200 && r.data.configurado && r.data.status === "desconectado", "chave válida salva (status desconectado)");
  ok(r.data.chaveFinal === "3456" && !JSON.stringify(r.data).includes(CHAVE_VALIDA), "chave nunca volta inteira pro navegador");
  ok(fake.webhookConfig && /\/api\/webhooks\/wame\/[0-9a-f]{48}$/.test(fake.webhookConfig.webhookMessage), "webhook configurado na WAME com endereço exclusivo");
  ok(fake.webhookConfig.webhookConnection === fake.webhookConfig.webhookMessage && fake.webhookConfig.webhookFormat === "meta", "eventos de conexão no mesmo endereço, formato meta");
  const urlWebhook = fake.webhookConfig.webhookMessage.replace("http://localhost:3000", "");
  const db = require("./src/db");
  const linhaBanco = (await db.query("SELECT chave_cifrada FROM wame_conexoes WHERE chave_final = '3456' ORDER BY criado_em DESC LIMIT 1")).rows[0];
  ok(linhaBanco && !linhaBanco.chave_cifrada.includes(CHAVE_VALIDA), "chave gravada cifrada no banco");

  console.log("\n3. QR Code e conexão");
  r = await req("/config/wame/qrcode", { method: "POST", token: tokenA });
  ok(r.status === 200 && r.data.conectado === false && r.data.imagem.startsWith("data:image/png;base64,"), "QR Code devolvido como imagem");
  r = await req("/config/wame", { token: tokenA });
  ok(r.data.status === "aguardando_qr", "status = aguardando leitura do QR");
  fake.conectado = true;
  await fetch("http://localhost:3000" + urlWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(envelope("connection", { connection: { status: "open", code: 200 } })) });
  await espera(300);
  r = await req("/config/wame", { token: tokenA });
  ok(r.data.status === "conectado" && r.data.telefone === "5511988887777", "webhook de conexão marca como conectado");
  r = await req("/config/wame?atualizar=1", { token: tokenA });
  ok(r.data.status === "conectado" && r.data.nomePerfil === "Loja Teste", "atualizar status consulta a WAME");

  console.log("\n4. Envio automático de giftback");
  const prodA = (await req("/produtos", { method: "POST", token: tokenA, body: { nome: "Limpeza de pele" } })).data;
  const prodB = (await req("/produtos", { method: "POST", token: tokenA, body: { nome: "Peeling" } })).data;
  const cli = (await req("/clientes", { method: "POST", token: tokenA, body: { nome: "Maria Teste", telefone: "(11) 97777-6666" } })).data;
  const camp = (await req("/campanhas", { method: "POST", token: tokenA, body: {
    titulo: "Camp WAME", produtoGatilhoId: prodA.id, produtoAlvoId: prodB.id, valor: 50, validade: 30,
    mensagem: "Oi {{nome_cliente}}, ganhou giftback: {{link_resgate}}",
  } })).data;
  const compra = (await req("/compras", { method: "POST", token: tokenA, body: { clienteId: cli.id, produtoId: prodA.id, valor: 200 } })).data.compra;
  r = await req(`/campanhas/${camp.id}/enviar`, { method: "POST", token: tokenA, body: { clienteId: cli.id, compraId: compra.id } });
  ok(r.status === 201 && r.data.envioAutomatico && r.data.envioAutomatico.enviado === true, "giftback enviado automaticamente pela WAME");
  ok(r.data.link && r.data.link.startsWith("https://wa.me/"), "link wa.me continua disponível como alternativa");
  const enviado = fake.enviados[fake.enviados.length - 1];
  ok(enviado && enviado.to === "5511977776666", "telefone normalizado com 55 + DDD (" + (enviado && enviado.to) + ")");
  ok(enviado && /Maria/.test(enviado.text) && /#\/resgate\//.test(enviado.text), "mensagem tem o nome e o link de resgate");

  console.log("\n5. Status de entrega via webhook");
  const statusWebhook = (s) => fetch("http://localhost:3000" + urlWebhook, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envelope("messages", { statuses: [{ id: enviado.id, status: s, timestamp: "1700000000", recipient_id: enviado.to }] })) });
  await statusWebhook("read"); await espera(200);
  await statusWebhook("delivered"); await espera(300);
  r = await req("/config/wame/mensagens", { token: tokenA });
  const msgGift = r.data.find((m) => m.origem === "giftback");
  ok(msgGift && msgGift.status === "lida", "status 'lida' não é rebaixado por 'entregue' atrasado");

  console.log("\n6. Mensagem recebida do cliente");
  const recebida = envelope("messages", { contacts: [{ profile: { name: "Maria" }, wa_id: "5511977776666" }],
    messages: [{ from: "5511977776666", chat_type: "individual", id: "WAMID_IN_1", timestamp: "1700000001", type: "text", text: { body: "Quero agendar!" } }] });
  for (let i = 0; i < 2; i++) { // a WAME pode reenviar o mesmo evento
    await fetch("http://localhost:3000" + urlWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recebida) });
  }
  const grupo = envelope("messages", { messages: [{ from: "120363@g.us", chat_type: "group", id: "WAMID_G", type: "text", text: { body: "grupo" } }] });
  await fetch("http://localhost:3000" + urlWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(grupo) });
  await espera(400);
  r = await req("/config/wame/mensagens", { token: tokenA });
  const entradas = r.data.filter((m) => m.direcao === "entrada");
  ok(entradas.length === 1 && entradas[0].texto === "Quero agendar!" && entradas[0].nomeContato === "Maria", "resposta do cliente registrada uma única vez (grupo ignorado)");

  console.log("\n7. Isolamento entre empresas e segurança do webhook");
  r = await req("/config/wame/mensagens", { token: tokenB });
  ok(r.status === 200 && r.data.length === 0, "outra empresa não vê as mensagens");
  r = await req("/config/wame", { token: tokenB });
  ok(r.data.configurado === false, "outra empresa continua sem WAME");
  const falso = await fetch("http://localhost:3000/api/webhooks/wame/" + "0".repeat(48), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recebida) });
  ok(falso.status === 200, "segredo desconhecido responde 200 sem revelar nada");
  await espera(200);
  const totalEntradas = (await db.query("SELECT count(*)::int n FROM wame_mensagens WHERE wame_id = 'WAMID_IN_1'")).rows[0].n;
  ok(totalEntradas === 1, "evento com segredo falso não grava nada");

  console.log("\n8. Indicação + falhas");
  const campInd = (await req("/indicacoes/campanhas", { method: "POST", token: tokenA, body: {
    titulo: "Indique", metaIndicacoes: 3, premioIndicador: "Brinde", premioIndicado: "10% off",
    mensagem: "Oi {{nome_cliente}}, indique: {{link_indicacao}}", textoEncaminhar: "Vem!", validade: "2027-12-31",
  } })).data;
  r = await req(`/indicacoes/campanhas/${campInd.id}/enviar`, { method: "POST", token: tokenA, body: { clienteId: cli.id } });
  ok(r.status === 201 && r.data.envioAutomatico && r.data.envioAutomatico.enviado, "convite de indicação enviado automaticamente");
  fake.falharEnvio = true;
  r = await req(`/indicacoes/campanhas/${campInd.id}/enviar`, { method: "POST", token: tokenA, body: { clienteId: cli.id } });
  ok(r.status === 201 && r.data.envioAutomatico.enviado === false && /WAME/.test(r.data.envioAutomatico.erro) && r.data.link, "falha da WAME não quebra o envio: devolve erro + link wa.me");
  fake.falharEnvio = false;
  await fetch("http://localhost:3000" + urlWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(envelope("connection", { connection: { status: "close", code: 1004, reason: "disconnected" } })) });
  await espera(300);
  r = await req(`/indicacoes/campanhas/${campInd.id}/enviar`, { method: "POST", token: tokenA, body: { clienteId: cli.id } });
  ok(r.data.envioAutomatico.enviado === false && /QR Code/.test(r.data.envioAutomatico.erro), "número desconectado: não tenta enviar e orienta a ler o QR Code");

  console.log("\n9. Empresa sem WAME continua como antes");
  const pB1 = (await req("/produtos", { method: "POST", token: tokenB, body: { nome: "A" } })).data;
  const pB2 = (await req("/produtos", { method: "POST", token: tokenB, body: { nome: "B" } })).data;
  const cB = (await req("/clientes", { method: "POST", token: tokenB, body: { nome: "João", telefone: "11966665555" } })).data;
  const campB = (await req("/campanhas", { method: "POST", token: tokenB, body: { titulo: "C", produtoGatilhoId: pB1.id, produtoAlvoId: pB2.id, valor: 10, validade: 30, mensagem: "Oi {{link_resgate}}" } })).data;
  const compB = (await req("/compras", { method: "POST", token: tokenB, body: { clienteId: cB.id, produtoId: pB1.id, valor: 50 } })).data.compra;
  const antes = fake.enviados.length;
  r = await req(`/compras/${compB.id}/enviar/${campB.id}`, { method: "POST", token: tokenB });
  ok(r.status === 201 && r.data.envioAutomatico === null && fake.enviados.length === antes, "sem WAME: nada é enviado pela WAME, segue o link wa.me");

  console.log("\n10. Teste manual e remoção");
  fake.conectado = true;
  await req("/config/wame?atualizar=1", { token: tokenA });
  r = await req("/config/wame/teste", { method: "POST", token: tokenA, body: { telefone: "11 95555-4444", texto: "teste" } });
  ok(r.status === 201 && fake.enviados[fake.enviados.length - 1].to === "5511955554444", "mensagem de teste enviada");
  r = await req("/config/wame", { method: "DELETE", token: tokenA });
  ok(r.status === 200 && r.data.configurado === false && fake.webhookConfig.allowWebhook === false, "remover desliga o webhook na WAME e apaga a chave");

  await db.pool.end();
  servidorFake.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTODOS OS TESTES PASSARAM");
  process.exit(falhas ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
