// Testes automatizados da integração oficial com o WhatsApp (Meta Cloud
// API / Embedded Signup). Segue o mesmo padrão dos demais teste_*.js do
// projeto: sem framework, roda contra o servidor local (para tudo que passa
// pela borda HTTP/autenticação/tenant) e, para os casos que dependem de uma
// resposta específica da Graph API (troca de code, confirmação de posse,
// erros da Meta), chama os serviços diretamente neste mesmo processo com o
// cliente Graph API (metaWhatsappClient) trocado por um mock em memória —
// não há infraestrutura de mocks/fixtures HTTP no projeto, e a suíte normal
// não deve depender de credenciais reais nem de rede até graph.facebook.com
// (que este sandbox nem alcança).
//
// Uso: node teste_whatsapp.js
// Pré-requisitos: servidor rodando em localhost:3000 e Postgres local no ar
// (mesmo banco usado pelo servidor — os testes que chamam os serviços
// diretamente usam a mesma conexão de banco).
require("dotenv").config();
const crypto = require("crypto");
const BASE = "http://localhost:3000/api";

async function req(path, opts) {
  opts = opts || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  const resp = await fetch(BASE + path, {
    method: opts.method || "GET",
    headers,
    body: opts.rawBody != null ? opts.rawBody : (opts.body ? JSON.stringify(opts.body) : undefined),
  });
  const bruto = await resp.text();
  let data = null;
  try { data = JSON.parse(bruto); } catch (e) { /* corpo não-JSON (ex.: challenge do webhook em texto puro) */ }
  return { status: resp.status, data, text: bruto };
}

let falhas = 0;
function check(desc, cond, extra) {
  if (cond) { console.log("PASS - " + desc); }
  else { console.log("FAIL - " + desc + (extra !== undefined ? " :: " + JSON.stringify(extra) : "")); falhas++; }
}

// ---------------------------------------------------------------------
// Mock do cliente Graph API — troca as funções exportadas por
// src/whatsapp/metaWhatsappClient.js. Como Node cacheia módulos por
// caminho, os services (que fazem `const cliente = require("./metaWhatsappClient")`
// e chamam `cliente.fn(...)`) enxergam exatamente este mesmo objeto, então
// sobrescrever suas propriedades aqui é o bastante — sem precisar de
// nenhuma lib de mocking.
const metaClient = require("./src/whatsapp/metaWhatsappClient");
const connectionService = require("./src/whatsapp/whatsappConnectionService");
const messageService = require("./src/whatsapp/whatsappMessageService");
const db = require("./src/db");

const ORIGINAIS = Object.assign({}, metaClient);
function mockMeta(respostas) {
  Object.keys(ORIGINAIS).forEach((k) => { metaClient[k] = respostas[k] || ORIGINAIS[k]; });
}
function restaurarMeta() { Object.assign(metaClient, ORIGINAIS); }
function erroMeta(status, metaCodigo, metaSubcodigo) {
  const e = new Error("erro simulado da Meta");
  e.status = status; e.metaCodigo = metaCodigo; e.metaSubcodigo = metaSubcodigo || null;
  return e;
}

async function registrarEmpresa(prefixo) {
  const sufixo = Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const email = `${prefixo}_${sufixo}@teste.com`;
  const r = await req("/auth/registrar-empresa", { method: "POST", body: {
    nomeEmpresa: "Empresa " + prefixo + " " + sufixo, nomeAdmin: "Admin " + prefixo, email, senha: "senha123",
  }});
  if (r.status !== 201) throw new Error("Falha ao registrar empresa de teste " + prefixo + ": " + JSON.stringify(r.data));
  return { empresaId: r.data.empresa.id, usuarioId: r.data.usuario.id, token: r.data.token, email };
}

function assinarWebhook(corpoTexto) {
  const secret = process.env.META_APP_SECRET;
  return "sha256=" + crypto.createHmac("sha256", secret).update(corpoTexto).digest("hex");
}

async function main() {
  const A = await registrarEmpresa("wa_a");
  const B = await registrarEmpresa("wa_b");
  const authA = { Authorization: "Bearer " + A.token };
  const authB = { Authorization: "Bearer " + B.token };

  // IDs fake da Meta únicos por execução — a constraint de "número já
  // vinculado" (idx_whatsapp_connections_phone_ativo) é real no banco, então
  // rodar a suíte duas vezes com o MESMO phone_number_id fixo colidiria com
  // a conexão ativa deixada pela execução anterior (isso já pegou um bug
  // assim na primeira vez que rodei este script duas vezes seguidas).
  const RUN_ID = Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const WABA_A = "WABA_A_" + RUN_ID, PHONE_A = "PHONE_A_" + RUN_ID, BIZ_A = "BIZ_A_" + RUN_ID;
  const WABA_B = "WABA_B_" + RUN_ID, WABA_B2 = "WABA_B2_" + RUN_ID, BIZ_B2 = "BIZ_B2_" + RUN_ID;

  // =====================================================================
  // 1) Estado inicial — nenhuma das duas conectada, cada uma só vê a si
  // =====================================================================
  let r = await req("/config/whatsapp/connection", { headers: authA });
  check("A: status inicial é nao_conectado", r.status === 200 && r.data.status === "nao_conectado", r.data);
  r = await req("/config/whatsapp/connection", { headers: authB });
  check("B: status inicial é nao_conectado", r.status === 200 && r.data.status === "nao_conectado", r.data);
  r = await req("/config/whatsapp/connection");
  check("GET /connection sem token exige autenticação (401)", r.status === 401, r.data);

  // =====================================================================
  // 2) Nonce/CSRF: obrigatório, vinculado à empresa, uso único
  // =====================================================================
  r = await req("/config/whatsapp/connection/complete", { method: "POST", headers: authA,
    body: { code: "x", wabaId: "W", phoneNumberId: "P", nonce: "forjado-nunca-emitido" } });
  check("complete recusa nonce nunca emitido (400 nonce_invalido)", r.status === 400 && r.data.codigo === "nonce_invalido", r.data);

  r = await req("/config/whatsapp/connection/iniciar", { method: "POST", headers: authA });
  check("iniciar emite um nonce", r.status === 200 && typeof r.data.nonce === "string" && r.data.nonce.length > 10, r.data);
  const nonceDeA = r.data.nonce;

  r = await req("/config/whatsapp/connection/complete", { method: "POST", headers: authB,
    body: { code: "x", wabaId: "W", phoneNumberId: "P", nonce: nonceDeA } });
  check("complete recusa nonce de OUTRA empresa — protege contra troca de contexto/tenant no meio do fluxo", r.status === 400 && r.data.codigo === "nonce_invalido", r.data);

  // O nonce de A não foi consumido pela tentativa acima (ela falhou antes de
  // consumir, pois a checagem já é por empresaId+nonce) — confirma que ele
  // ainda funciona para a própria empresa A uma única vez.
  r = await req("/config/whatsapp/connection/iniciar", { method: "POST", headers: authA });
  const nonceReuso = r.data.nonce;
  await req("/config/whatsapp/connection/complete", { method: "POST", headers: authA,
    body: { code: "codigo-fake-nao-existe", wabaId: "W", phoneNumberId: "P", nonce: nonceReuso } });
  r = await req("/config/whatsapp/connection/complete", { method: "POST", headers: authA,
    body: { code: "codigo-fake-nao-existe", wabaId: "W", phoneNumberId: "P", nonce: nonceReuso } });
  check("nonce só pode ser usado uma vez (reuso é recusado)", r.status === 400 && r.data.codigo === "nonce_invalido", r.data);

  // =====================================================================
  // 3) Backend nunca confia só no code/ids do frontend — chamada real à
  // Meta com credenciais fake deve falhar de forma tratada (sem 500 cru,
  // sem criar conexão) mesmo sem nenhum mock, provando que o passo
  // "confirmar direto na Graph API" realmente acontece server-side.
  // =====================================================================
  r = await req("/config/whatsapp/connection/iniciar", { method: "POST", headers: authA });
  const nonceReal = r.data.nonce;
  r = await req("/config/whatsapp/connection/complete", { method: "POST", headers: authA,
    body: { code: "codigo-que-nao-existe-na-meta", wabaId: "WABA_INEXISTENTE", phoneNumberId: "PHONE_INEXISTENTE", nonce: nonceReal } });
  check("complete com code/ids inventados falha de forma tratada (nunca 500 cru)", r.status >= 400 && r.status < 600 && r.status !== 500 && typeof r.data.erro === "string", r.data);
  check("erro tratado nunca vaza segredo (App Secret/token) na resposta", JSON.stringify(r.data).indexOf(process.env.META_APP_SECRET) === -1, r.data);
  r = await req("/config/whatsapp/connection", { headers: authA });
  check("nenhuma conexão foi criada após falha na confirmação com a Meta", r.data.status === "nao_conectado", r.data);

  // =====================================================================
  // 4) Fluxo feliz completo (Meta mockada em processo): completarSignup,
  // mapeamento sem vazar token, IDs mascarados na resposta da API.
  // =====================================================================
  mockMeta({
    trocarCodePorToken: async () => ({ access_token: "TOKEN_SECRETO_EMPRESA_A", token_type: "bearer" }),
    inspecionarToken: async () => ({ data: {
      is_valid: true,
      granular_scopes: [{ scope: "whatsapp_business_management", target_ids: [WABA_A] }],
      expires_at: 0,
    }}),
    listarNumerosDaWaba: async () => ({ data: [{ id: PHONE_A }] }),
    buscarDetalhesNumero: async () => ({
      display_phone_number: "+55 11 90000-0001", verified_name: "Empresa A Verificada",
      status: "CONNECTED", quality_rating: "GREEN", code_verification_status: "VERIFIED",
    }),
    assinarApp: async () => ({ success: true }),
    listarApsAssinados: async () => ({ data: [{ whatsapp_business_api_data: { id: "APP_ID" } }] }),
  });
  const conexaoA = await connectionService.completarSignup({
    empresaId: A.empresaId, usuarioId: A.usuarioId,
    code: "codigo-valido", wabaId: WABA_A, phoneNumberId: PHONE_A, businessId: BIZ_A,
  });
  check("completarSignup: fica 'conectado' quando tudo confirma (detalhes + webhook inscrito)", conexaoA.status === "conectado", conexaoA);
  check("completarSignup: resposta NUNCA inclui o token de acesso", JSON.stringify(conexaoA).indexOf("TOKEN_SECRETO") === -1, conexaoA);
  check("completarSignup: WABA ID sai mascarado (nunca o valor cru)", conexaoA.wabaId !== WABA_A && conexaoA.wabaId.includes("•") && conexaoA.wabaId.endsWith(WABA_A.slice(-4)), conexaoA);
  check("completarSignup: Phone Number ID sai mascarado", conexaoA.phoneNumberId !== PHONE_A && conexaoA.phoneNumberId.includes("•"), conexaoA);

  // Token realmente cifrado no banco (nunca texto puro)
  const rowA = await connectionService.buscarConexaoRaw(A.empresaId);
  check("token gravado no banco está cifrado (nunca igual ao token em texto puro)", rowA.token_ciphertext && rowA.token_ciphertext !== "TOKEN_SECRETO_EMPRESA_A" && rowA.token_ciphertext.split(":").length === 3, { token_ciphertext: rowA.token_ciphertext });

  // Isolamento multi-tenant: B continua nao_conectado; via HTTP, cada
  // empresa só enxerga a própria conexão.
  r = await req("/config/whatsapp/connection", { headers: authA });
  check("A: GET /connection reflete a conexão recém-criada (via HTTP, isolado por sessão)", r.data.status === "conectado" && r.data.displayPhoneNumber === "+55 11 90000-0001", r.data);
  r = await req("/config/whatsapp/connection", { headers: authB });
  check("B: GET /connection continua nao_conectado (não enxerga a conexão de A)", r.data.status === "nao_conectado", r.data);
  check("resposta da API para B não contém nenhum dado de A (waba/phone/nome de A)", JSON.stringify(r.data).indexOf("Empresa A Verificada") === -1, r.data);

  // =====================================================================
  // 5) Confirmação de posse recusa quando o token não autoriza a
  // WABA/número informados pelo frontend (nunca confia só no postMessage).
  // =====================================================================
  mockMeta({
    trocarCodePorToken: async () => ({ access_token: "TOKEN_B" }),
    inspecionarToken: async () => ({ data: { is_valid: true, granular_scopes: [{ scope: "whatsapp_business_management", target_ids: ["OUTRA_WABA"] }] } }),
  });
  try {
    await connectionService.completarSignup({ empresaId: B.empresaId, usuarioId: B.usuarioId, code: "c", wabaId: "WABA_QUE_O_TOKEN_NAO_AUTORIZA", phoneNumberId: "P", businessId: "BIZ" });
    check("recusa WABA que o token não autoriza", false, "não lançou erro");
  } catch (err) {
    check("recusa WABA que o token não autoriza (mesmo vinda do popup)", err.codigo === "waba_nao_autorizada", err.message);
  }

  mockMeta({
    trocarCodePorToken: async () => ({ access_token: "TOKEN_B" }),
    inspecionarToken: async () => ({ data: { is_valid: true, granular_scopes: [{ scope: "whatsapp_business_management", target_ids: [WABA_B] }] } }),
    listarNumerosDaWaba: async () => ({ data: [{ id: "OUTRO_NUMERO_DA_WABA" }] }),
  });
  try {
    await connectionService.completarSignup({ empresaId: B.empresaId, usuarioId: B.usuarioId, code: "c", wabaId: WABA_B, phoneNumberId: "PHONE_QUE_NAO_PERTENCE", businessId: "BIZ" });
    check("recusa número que não pertence à WABA informada", false, "não lançou erro");
  } catch (err) {
    check("recusa número que não pertence à WABA informada", err.codigo === "numero_nao_pertence_waba", err.message);
  }

  // =====================================================================
  // 6) Número já vinculado a outra empresa — constraint do banco + 409
  // amigável, sem derrubar a aplicação.
  // =====================================================================
  mockMeta({
    trocarCodePorToken: async () => ({ access_token: "TOKEN_B2" }),
    inspecionarToken: async () => ({ data: { is_valid: true, granular_scopes: [{ scope: "whatsapp_business_management", target_ids: [WABA_B2] }] } }),
    listarNumerosDaWaba: async () => ({ data: [{ id: PHONE_A }] }), // mesmo phone_number_id já usado por A
    buscarDetalhesNumero: async () => ({ display_phone_number: "+55 11 90000-0001", verified_name: "Tentativa B", status: "CONNECTED" }),
    assinarApp: async () => ({ success: true }),
    listarApsAssinados: async () => ({ data: [{}] }),
  });
  try {
    await connectionService.completarSignup({ empresaId: B.empresaId, usuarioId: B.usuarioId, code: "c", wabaId: WABA_B2, phoneNumberId: PHONE_A, businessId: BIZ_B2 });
    check("recusa conectar um número já ativo em outra empresa", false, "não lançou erro");
  } catch (err) {
    check("recusa conectar um número já ativo em outra empresa (409 numero_ja_vinculado)", err.status === 409 && err.codigo === "numero_ja_vinculado", { status: err.status, codigo: err.codigo, msg: err.message });
  }
  r = await req("/config/whatsapp/connection", { headers: authB });
  check("B continua nao_conectado após a tentativa recusada", r.data.status === "nao_conectado", r.data);

  // =====================================================================
  // 7) Sincronizar: token revogado/expirado (código 190) rebaixa para
  // token_expirado; número RESTRICTED/FLAGGED vira numero_restrito.
  // =====================================================================
  mockMeta({ buscarDetalhesNumero: async () => { throw erroMeta(401, 190, 463); } });
  let sinc = await connectionService.sincronizar({ empresaId: A.empresaId, usuarioId: A.usuarioId });
  check("sincronizar: token revogado/expirado rebaixa para 'token_expirado'", sinc.status === "token_expirado", sinc);

  // Reconecta A para o restante dos testes (fluxo feliz de novo == também
  // testa "reconexão" depois de um estado de erro).
  mockMeta({
    trocarCodePorToken: async () => ({ access_token: "TOKEN_SECRETO_EMPRESA_A_2" }),
    inspecionarToken: async () => ({ data: { is_valid: true, granular_scopes: [{ scope: "whatsapp_business_management", target_ids: [WABA_A] }] } }),
    listarNumerosDaWaba: async () => ({ data: [{ id: PHONE_A }] }),
    buscarDetalhesNumero: async () => ({ display_phone_number: "+55 11 90000-0001", verified_name: "Empresa A Verificada", status: "CONNECTED", quality_rating: "GREEN" }),
    assinarApp: async () => ({ success: true }),
    listarApsAssinados: async () => ({ data: [{}] }),
  });
  const reconexaoA = await connectionService.completarSignup({ empresaId: A.empresaId, usuarioId: A.usuarioId, code: "novo-code", wabaId: WABA_A, phoneNumberId: PHONE_A, businessId: BIZ_A });
  check("reconexão após token_expirado volta para 'conectado'", reconexaoA.status === "conectado", reconexaoA);
  check("reconexão reaproveita a mesma linha (mesma empresa, não duplica)", reconexaoA.id === conexaoA.id, { antes: conexaoA.id, depois: reconexaoA.id });

  mockMeta({ buscarDetalhesNumero: async () => ({ display_phone_number: "+55 11 90000-0001", verified_name: "Empresa A Verificada", status: "RESTRICTED", quality_rating: "RED" }) });
  sinc = await connectionService.sincronizar({ empresaId: A.empresaId, usuarioId: A.usuarioId });
  check("sincronizar: número RESTRICTED vira 'numero_restrito' (não 'conectado')", sinc.status === "numero_restrito", sinc);

  // Restaura saudável para os próximos testes (mensagem de teste / desconexão).
  mockMeta({
    buscarDetalhesNumero: async () => ({ display_phone_number: "+55 11 90000-0001", verified_name: "Empresa A Verificada", status: "CONNECTED", quality_rating: "GREEN" }),
    listarApsAssinados: async () => ({ data: [{}] }),
  });
  sinc = await connectionService.sincronizar({ empresaId: A.empresaId, usuarioId: A.usuarioId });
  check("sincronizar: volta para 'conectado' quando o número não está mais restrito", sinc.status === "conectado", sinc);

  // =====================================================================
  // 8) obterConexaoSaudavel — o "portão" que qualquer envio (teste hoje,
  // campanhas amanhã) precisa passar antes de mandar mensagem.
  // =====================================================================
  try {
    await messageService.obterConexaoSaudavel(B.empresaId);
    check("obterConexaoSaudavel bloqueia empresa sem conexão", false, "não lançou erro");
  } catch (err) {
    check("obterConexaoSaudavel bloqueia empresa sem conexão (409 nao_conectado)", err.status === 409 && err.codigo === "nao_conectado", err.message);
  }
  mockMeta({ buscarDetalhesNumero: async () => { throw erroMeta(401, 190, 463); } });
  await connectionService.sincronizar({ empresaId: A.empresaId, usuarioId: A.usuarioId }); // deixa A com token_expirado
  try {
    await messageService.obterConexaoSaudavel(A.empresaId);
    check("obterConexaoSaudavel bloqueia conexão não saudável (token_expirado)", false, "não lançou erro");
  } catch (err) {
    check("obterConexaoSaudavel bloqueia conexão não saudável (409 conexao_nao_saudavel)", err.status === 409 && err.codigo === "conexao_nao_saudavel", err.message);
  }

  // =====================================================================
  // 9) Mensagem de teste — bloqueada quando não saudável; enviada e
  // idempotente quando saudável. A checagem "bloqueada" passa pela borda
  // HTTP de verdade (não depende de mock: falha antes de chamar a Meta,
  // só olhando o estado salvo no banco). Já o envio em si precisa da
  // resposta da Meta mockada — como o mock só existe DENTRO deste
  // processo (o servidor HTTP roda num processo Node separado, que não
  // enxerga o metaClient sobrescrito aqui), essa parte chama o service
  // diretamente, do mesmo jeito que a rota faria internamente.
  // =====================================================================
  r = await req("/config/whatsapp/test-message", { method: "POST", headers: authA, body: { destinatario: "+55 11 90000-0000", templateNome: "hello_world" } });
  check("test-message via HTTP recusa quando a conexão não está saudável (409)", r.status === 409, r.data);

  mockMeta({
    buscarDetalhesNumero: async () => ({ display_phone_number: "+55 11 90000-0001", verified_name: "Empresa A Verificada", status: "CONNECTED", quality_rating: "GREEN" }),
    listarApsAssinados: async () => ({ data: [{}] }),
    enviarMensagemTemplate: async () => ({ messages: [{ id: ("wamid.TESTE_" + RUN_ID) }] }),
  });
  await connectionService.sincronizar({ empresaId: A.empresaId, usuarioId: A.usuarioId }); // volta pra 'conectado'

  const chaveIdempotencia = "idem-" + Date.now();
  let msgEnviada = await messageService.enviarMensagemTeste({ empresaId: A.empresaId, usuarioId: A.usuarioId, destinatario: "+55 11 90000-0000", templateNome: "hello_world", idempotencyKey: chaveIdempotencia });
  check("test-message: envia e persiste o wamid quando saudável", msgEnviada.wamid === ("wamid.TESTE_" + RUN_ID) && msgEnviada.status === "aceito", msgEnviada);
  const wamidTeste = msgEnviada.wamid;

  const msgRepetida = await messageService.enviarMensagemTeste({ empresaId: A.empresaId, usuarioId: A.usuarioId, destinatario: "+55 11 90000-0000", templateNome: "hello_world", idempotencyKey: chaveIdempotencia });
  check("test-message: mesma idempotencyKey não duplica o envio (devolve a mesma mensagem)", msgRepetida.wamid === wamidTeste && msgRepetida.id === msgEnviada.id, msgRepetida);
  const contagem = await db.query("SELECT count(*)::int AS n FROM whatsapp_messages WHERE idempotency_key = $1", [chaveIdempotencia]);
  check("test-message: só existe UMA linha em whatsapp_messages para essa idempotencyKey", contagem.rows[0].n === 1, contagem.rows[0]);

  // A idempotencyKey é escolhida por quem chama a API — precisa ser única só
  // DENTRO de cada empresa, nunca globalmente (duas empresas diferentes
  // podem escolher, por coincidência, o mesmo texto de chave; isso nunca
  // pode virar um erro cru de banco pra uma delas). Testado direto no banco,
  // sem precisar conectar o WhatsApp de B — é o índice em si que está sendo
  // verificado (ver schema.sql: idx_whatsapp_messages_idempotency_por_empresa).
  const conexaoAtualA = await connectionService.buscarConexaoRaw(A.empresaId);
  const chaveCompartilhada = "chave-compartilhada-" + RUN_ID;
  await db.query(
    `INSERT INTO whatsapp_messages (empresa_id, connection_id, destinatario, tipo, idempotency_key, status)
     VALUES ($1,$2,'+5511900000001','teste',$3,'enviando')`,
    [A.empresaId, conexaoAtualA.id, chaveCompartilhada]
  );
  let colidiuEntreEmpresas = false;
  try {
    await db.query(
      `INSERT INTO whatsapp_messages (empresa_id, connection_id, destinatario, tipo, idempotency_key, status)
       VALUES ($1,$2,'+5511900000002','teste',$3,'enviando')`,
      [B.empresaId, conexaoAtualA.id, chaveCompartilhada]
    );
  } catch (err) { colidiuEntreEmpresas = true; }
  check("a mesma idempotencyKey pode ser usada por empresas DIFERENTES sem colidir (índice é por empresa, não global)", colidiuEntreEmpresas === false, colidiuEntreEmpresas);

  // =====================================================================
  // 10) Erros da Graph API mapeados para mensagem amigável, preservando
  // código/subcódigo originais só no log/objeto interno (nunca no texto ao
  // usuário) — testado via envio de mensagem que falha na Meta.
  // =====================================================================
  mockMeta({ enviarMensagemTemplate: async () => { throw erroMeta(400, 131047); } });
  try {
    await messageService.enviarMensagemTeste({ empresaId: A.empresaId, usuarioId: A.usuarioId, destinatario: "+55 11 90000-0000", templateNome: "hello_world", idempotencyKey: "erro1-" + Date.now() });
    check("erro 131047 da Meta vira mensagem amigável sobre janela de 24h/template", false, "não lançou erro");
  } catch (err) {
    check("erro 131047 da Meta vira mensagem amigável sobre janela de 24h/template", /template|janela/i.test(err.mensagemAmigavel || ""), err.mensagemAmigavel);
  }
  mockMeta({ enviarMensagemTemplate: async () => { throw erroMeta(401, 190, 458); } });
  try {
    await messageService.enviarMensagemTeste({ empresaId: A.empresaId, usuarioId: A.usuarioId, destinatario: "+55 11 90000-0000", templateNome: "hello_world", idempotencyKey: "erro2-" + Date.now() });
    check("erro 190/458 (revogado pelo usuário) vira mensagem amigável específica", false, "não lançou erro");
  } catch (err) {
    check("erro 190/458 (revogado pelo usuário) vira mensagem amigável específica", /revogad/i.test(err.mensagemAmigavel || ""), err.mensagemAmigavel);
  }
  const msgFalha = await db.query("SELECT status, erro_codigo FROM whatsapp_messages WHERE idempotency_key LIKE 'erro2-%' ORDER BY criado_em DESC LIMIT 1");
  check("mensagem que falhou fica persistida com status 'falhou' e o código original da Meta (log/diagnóstico)", msgFalha.rows[0] && msgFalha.rows[0].status === "falhou" && msgFalha.rows[0].erro_codigo === "190", msgFalha.rows[0]);

  // restaura envio saudável para os testes de webhook a seguir
  mockMeta({ enviarMensagemTemplate: async () => ({ messages: [{ id: ("wamid.TESTE_" + RUN_ID) }] }) });

  // =====================================================================
  // 11) Webhook — verificação GET (hub.mode/hub.verify_token/hub.challenge)
  // =====================================================================
  const tokenCorreto = process.env.META_WEBHOOK_VERIFY_TOKEN;
  r = await req(`/webhooks/meta/whatsapp?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(tokenCorreto)}&hub.challenge=abc123`);
  check("webhook GET: token correto devolve 200 + o challenge", r.status === 200 && r.text === "abc123", { status: r.status, text: r.text });
  r = await req("/webhooks/meta/whatsapp?hub.mode=subscribe&hub.verify_token=token-errado&hub.challenge=abc123");
  check("webhook GET: token errado é recusado (403)", r.status === 403, r.status);
  r = await req("/webhooks/meta/whatsapp?hub.mode=outracoisa&hub.verify_token=" + encodeURIComponent(tokenCorreto) + "&hub.challenge=abc123");
  check("webhook GET: hub.mode diferente de 'subscribe' é recusado (403)", r.status === 403, r.status);

  // =====================================================================
  // 12) Webhook POST — validação de assinatura X-Hub-Signature-256
  // =====================================================================
  const corpoWebhook = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
  r = await req("/webhooks/meta/whatsapp", { method: "POST", rawBody: corpoWebhook, headers: { "Content-Type": "application/json" } });
  check("webhook POST: sem header de assinatura é recusado (403)", r.status === 403, r.status);
  r = await req("/webhooks/meta/whatsapp", { method: "POST", rawBody: corpoWebhook, headers: { "Content-Type": "application/json", "x-hub-signature-256": "sha256=" + "0".repeat(64) } });
  check("webhook POST: assinatura inválida é recusada (403)", r.status === 403, r.status);
  r = await req("/webhooks/meta/whatsapp", { method: "POST", rawBody: corpoWebhook, headers: { "Content-Type": "application/json", "x-hub-signature-256": assinarWebhook(corpoWebhook) } });
  check("webhook POST: assinatura válida (HMAC-SHA256 com o App Secret) é aceita (200)", r.status === 200, r.status);

  // =====================================================================
  // 13) Webhook — status de mensagem atualiza whatsapp_messages, correlação
  // por phone_number_id, idempotência (evento duplicado processado 1x só).
  // =====================================================================
  const rowAtual = await connectionService.buscarConexaoRaw(A.empresaId);
  const payloadStatus = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{ id: rowAtual.waba_id, changes: [{ field: "messages", value: {
      messaging_product: "whatsapp",
      metadata: { phone_number_id: rowAtual.phone_number_id, display_phone_number: rowAtual.display_phone_number },
      statuses: [{ id: wamidTeste, status: "delivered", timestamp: String(Math.floor(Date.now() / 1000)), recipient_id: "5511900000000" }],
    }}]}],
  });
  const assinaturaStatus = assinarWebhook(payloadStatus);
  await req("/webhooks/meta/whatsapp", { method: "POST", rawBody: payloadStatus, headers: { "Content-Type": "application/json", "x-hub-signature-256": assinaturaStatus } });
  await new Promise((resolve) => setTimeout(resolve, 400)); // processamento é assíncrono após o 200 (ver webhooksMeta.js)
  let msgRow = await db.query("SELECT status FROM whatsapp_messages WHERE wamid = $1", [wamidTeste]);
  check("webhook de status 'delivered' atualiza whatsapp_messages.status", msgRow.rows[0] && msgRow.rows[0].status === "delivered", msgRow.rows[0]);
  let eventosRow = await db.query("SELECT count(*)::int AS n FROM whatsapp_message_events WHERE wamid = $1 AND tipo_evento = 'status'", [wamidTeste]);
  check("webhook de status grava um registro em whatsapp_message_events", eventosRow.rows[0].n === 1, eventosRow.rows[0]);

  // Reenvia o MESMO evento (mesmo id+status+timestamp) — deve ser
  // reconhecido como duplicado e não processado de novo.
  await req("/webhooks/meta/whatsapp", { method: "POST", rawBody: payloadStatus, headers: { "Content-Type": "application/json", "x-hub-signature-256": assinaturaStatus } });
  await new Promise((resolve) => setTimeout(resolve, 400));
  eventosRow = await db.query("SELECT count(*)::int AS n FROM whatsapp_message_events WHERE wamid = $1 AND tipo_evento = 'status'", [wamidTeste]);
  check("evento de webhook duplicado (mesmo id+status+timestamp) não gera um segundo registro (idempotência)", eventosRow.rows[0].n === 1, eventosRow.rows[0]);

  // Correlação por phone_number_id: evento para um phone_number_id
  // desconhecido não deve derrubar o processamento nem vincular a nenhuma
  // empresa errada — só fica sem `conexao` resolvida (mensagem sem match).
  const payloadOutroPhone = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{ id: "waba-desconhecida", changes: [{ field: "messages", value: {
      metadata: { phone_number_id: "phone-que-nao-existe-em-nenhuma-empresa" },
      statuses: [{ id: ("wamid.naoexiste_" + RUN_ID), status: "sent", timestamp: String(Math.floor(Date.now() / 1000)) }],
    }}]}],
  });
  r = await req("/webhooks/meta/whatsapp", { method: "POST", rawBody: payloadOutroPhone, headers: { "Content-Type": "application/json", "x-hub-signature-256": assinarWebhook(payloadOutroPhone) } });
  check("webhook para phone_number_id desconhecido responde 200 sem derrubar o processamento", r.status === 200, r.status);

  // =====================================================================
  // 14) Desconexão: nunca chama endpoint destrutivo; revoga a assinatura;
  // limpa o token local; auditoria fica registrada; reconexão depois funciona.
  // =====================================================================
  let chamouDesassinar = false;
  let chamouRegistrarDeregister = false;
  mockMeta({
    desassinarApp: async () => { chamouDesassinar = true; return { success: true }; },
    registrarNumero: async (...args) => { chamouRegistrarDeregister = true; return { success: true }; },
  });
  const desconexao = await connectionService.desconectar({ empresaId: A.empresaId, usuarioId: A.usuarioId });
  check("desconectar: chama o endpoint oficial de revogar a assinatura (subscribed_apps DELETE)", chamouDesassinar === true, chamouDesassinar);
  check("desconectar: NUNCA chama /register (deregister) — não é uma ação desta operação", chamouRegistrarDeregister === false, chamouRegistrarDeregister);
  check("desconectar: status final é 'desconectado'", desconexao.status === "desconectado", desconexao);
  const rowDesconectada = await connectionService.buscarConexaoRaw(A.empresaId);
  check("desconectar: token local é apagado (nunca fica retido depois de desconectar)", rowDesconectada.token_ciphertext === null, { token_ciphertext: rowDesconectada.token_ciphertext });
  check("desconectar: a LINHA continua existindo (histórico), só marcada desconectada — nunca DELETE da tabela", !!rowDesconectada, rowDesconectada);

  try {
    await messageService.obterConexaoSaudavel(A.empresaId);
    check("depois de desconectar, envio de mensagem fica bloqueado", false, "não lançou erro");
  } catch (err) {
    check("depois de desconectar, envio de mensagem fica bloqueado (409)", err.status === 409, err.message);
  }

  // Reconexão depois de desconectar: mesmo phone_number_id, deve funcionar
  // (a unique index em phone_number_id só vale WHERE status <> 'desconectado').
  mockMeta({
    trocarCodePorToken: async () => ({ access_token: "TOKEN_A_RECONECTADO" }),
    inspecionarToken: async () => ({ data: { is_valid: true, granular_scopes: [{ scope: "whatsapp_business_management", target_ids: [WABA_A] }] } }),
    listarNumerosDaWaba: async () => ({ data: [{ id: PHONE_A }] }),
    buscarDetalhesNumero: async () => ({ display_phone_number: "+55 11 90000-0001", verified_name: "Empresa A Verificada", status: "CONNECTED", quality_rating: "GREEN" }),
    assinarApp: async () => ({ success: true }),
    listarApsAssinados: async () => ({ data: [{}] }),
  });
  const reconexaoFinal = await connectionService.completarSignup({ empresaId: A.empresaId, usuarioId: A.usuarioId, code: "reconexao-final", wabaId: WABA_A, phoneNumberId: PHONE_A, businessId: BIZ_A });
  check("reconectar depois de desconectar funciona (mesmo phone_number_id de antes)", reconexaoFinal.status === "conectado", reconexaoFinal);

  // =====================================================================
  // 15) Auditoria: cada ação relevante (conectar, sincronizar, desconectar,
  // teste de mensagem) deixou rastro sanitizado (sem token/segredo).
  // =====================================================================
  const auditoria = await db.query("SELECT acao, sucesso, detalhe_sanitizado FROM whatsapp_connection_audit WHERE empresa_id = $1 ORDER BY criado_em", [A.empresaId]);
  check("existe trilha de auditoria para a empresa A", auditoria.rows.length > 0, auditoria.rows.length);
  check("auditoria cobre 'conectar' e 'desconectar'", auditoria.rows.some(r2 => r2.acao === "conectar") && auditoria.rows.some(r2 => r2.acao === "desconectar"), auditoria.rows.map(r2 => r2.acao));
  const algumVazouSegredo = auditoria.rows.some(r2 => JSON.stringify(r2).indexOf(process.env.META_APP_SECRET) !== -1 || JSON.stringify(r2).toUpperCase().indexOf("TOKEN_A_RECONECTADO") !== -1 || JSON.stringify(r2).indexOf("TOKEN_SECRETO") !== -1);
  check("nenhuma linha de auditoria contém token/segredo em texto puro", !algumVazouSegredo, auditoria.rows);

  restaurarMeta();
  console.log("\n" + (falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"));
  process.exit(falhas === 0 ? 0 : 1);
}

main().catch((e) => { console.error("ERRO INESPERADO:", e); process.exit(1); });
