// Teste manual do fluxo Master recém-implementado. Não é um teste automatizado
// formal (não há framework no projeto) — roda contra o servidor local e
// imprime PASS/FAIL de cada passo. Uso: node teste_master.js
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
  // 1) Login master
  let r = await req("/master/login", { method: "POST", body: { login: "mlf", senha: "008088" } });
  check("login master ok", r.status === 200 && r.data.token, r);
  const masterToken = r.data.token;
  const authMaster = { Authorization: "Bearer " + masterToken };

  // 2) Criar empresa cliente com cor/logo
  const email = "teste_" + Date.now() + "@exemplo.com";
  r = await req("/master/empresas", { method: "POST", headers: authMaster, body: {
    nomeEmpresa: "Empresa Teste Master", nomeAdmin: "Fulano Teste", email, senha: "senha123",
    corPrincipal: "#ff5500", logoUrl: "",
  }});
  check("criar empresa ok", r.status === 201 && r.data.id, r);
  const empresaId = r.data.id;

  // 3) Listar empresas (deve aparecer, status ativa, com adminNome/adminEmail)
  r = await req("/master/empresas", { headers: authMaster });
  const criada = (r.data || []).find(e => e.id === empresaId);
  check("empresa aparece na listagem com status ativa", !!criada && criada.status === "ativa", criada);
  check("listagem traz adminNome/adminEmail", criada && criada.adminNome === "Fulano Teste" && criada.adminEmail === email, criada);

  // 4) Detalhe da empresa: empresa/adminNome/adminEmail/analytics/evolucaoMensal
  r = await req("/master/empresas/" + empresaId, { headers: authMaster });
  check("detalhe status 200", r.status === 200, r);
  check("detalhe traz corPrincipal salva na criação", r.data.empresa && r.data.empresa.corPrincipal === "#ff5500", r.data.empresa);
  check("detalhe traz analytics com evolucaoMensal de 6 meses", r.data.analytics && Array.isArray(r.data.analytics.evolucaoMensal) && r.data.analytics.evolucaoMensal.length === 6, r.data.analytics);
  check("evolucaoMensal tem os 4 campos esperados", r.data.analytics.evolucaoMensal[0] &&
    "giftbackEnviados" in r.data.analytics.evolucaoMensal[0] && "giftbackConfirmados" in r.data.analytics.evolucaoMensal[0] &&
    "indicacaoEnviados" in r.data.analytics.evolucaoMensal[0] && "indicacaoConfirmados" in r.data.analytics.evolucaoMensal[0],
    r.data.analytics.evolucaoMensal[0]);
  check("totais zerados para empresa nova", r.data.analytics.giftbackEnviadosQtd === 0 && r.data.analytics.indicacaoEnviadosQtd === 0, r.data.analytics);

  // 5) Login da empresa recém-criada (deve funcionar)
  r = await req("/auth/login", { method: "POST", body: { email, senha: "senha123" } });
  check("login da empresa criada funciona", r.status === 200 && r.data.token, r);
  const tenantToken = r.data.token;

  // 6) Editar dados (nome, adminNome, adminEmail)
  const email2 = "editado_" + Date.now() + "@exemplo.com";
  r = await req("/master/empresas/" + empresaId, { method: "PUT", headers: authMaster, body: {
    nome: "Empresa Teste Master Editada", adminNome: "Fulano Editado", adminEmail: email2,
  }});
  check("editar dados ok", r.status === 200, r);
  r = await req("/master/empresas/" + empresaId, { headers: authMaster });
  check("nome/admin refletidos no detalhe", r.data.empresa.nome === "Empresa Teste Master Editada" && r.data.adminNome === "Fulano Editado" && r.data.adminEmail === email2, r.data);

  // 7) Login com e-mail antigo deve falhar, com e-mail novo deve funcionar
  r = await req("/auth/login", { method: "POST", body: { email, senha: "senha123" } });
  check("login com e-mail antigo falha após editar", r.status === 401, r);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "senha123" } });
  check("login com e-mail novo funciona após editar", r.status === 200 && r.data.token, r);

  // 8) Nova senha
  r = await req("/master/empresas/" + empresaId + "/senha", { method: "PUT", headers: authMaster, body: { senha: "novaSenha456" } });
  check("definir nova senha ok", r.status === 200, r);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "senha123" } });
  check("senha antiga falha depois de trocar", r.status === 401, r);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "novaSenha456" } });
  check("senha nova funciona", r.status === 200 && r.data.token, r);
  const tenantToken2 = r.data.token;

  // 9) Aparência
  r = await req("/master/empresas/" + empresaId + "/aparencia", { method: "PUT", headers: authMaster, body: { corPrincipal: "#00aa88", logoUrl: "data:image/png;base64,xyz" } });
  check("salvar aparência ok", r.status === 200 && r.data.corPrincipal === "#00aa88", r);

  // 10) Bloquear -> login deve falhar com 403, sessão já aberta também deve cair (403) numa rota autenticada
  r = await req("/master/empresas/" + empresaId + "/status", { method: "PUT", headers: authMaster, body: { status: "bloqueada" } });
  check("bloquear empresa ok", r.status === 200 && r.data.status === "bloqueada", r);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "novaSenha456" } });
  check("login recusado com empresa bloqueada (403)", r.status === 403, r);
  r = await req("/auth/me", { headers: { Authorization: "Bearer " + tenantToken2 } });
  check("sessão já aberta é derrubada quando empresa é bloqueada (403)", r.status === 403, r);

  // 11) Desbloquear -> volta a funcionar
  r = await req("/master/empresas/" + empresaId + "/status", { method: "PUT", headers: authMaster, body: { status: "ativa" } });
  check("desbloquear empresa ok", r.status === 200 && r.data.status === "ativa", r);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "novaSenha456" } });
  check("login funciona de novo após desbloquear", r.status === 200 && r.data.token, r);

  // 12) Desativar -> some da listagem padrão, aparece em ?desativadas=1, login falha
  r = await req("/master/empresas/" + empresaId + "/status", { method: "PUT", headers: authMaster, body: { status: "desativada" } });
  check("desativar empresa ok", r.status === 200 && r.data.status === "desativada", r);
  r = await req("/master/empresas", { headers: authMaster });
  check("empresa desativada some da listagem padrão", !(r.data || []).some(e => e.id === empresaId), r.data);
  r = await req("/master/empresas?desativadas=1", { headers: authMaster });
  check("empresa desativada aparece na listagem de desativadas", (r.data || []).some(e => e.id === empresaId), r.data);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "novaSenha456" } });
  check("login falha com empresa desativada (403)", r.status === 403, r);

  // 13) Reativar -> volta pra listagem padrão e login funciona
  r = await req("/master/empresas/" + empresaId + "/status", { method: "PUT", headers: authMaster, body: { status: "ativa" } });
  check("reativar empresa ok", r.status === 200 && r.data.status === "ativa", r);
  r = await req("/master/empresas", { headers: authMaster });
  check("empresa reativada volta pra listagem padrão", (r.data || []).some(e => e.id === empresaId), r.data);
  r = await req("/auth/login", { method: "POST", body: { email: email2, senha: "novaSenha456" } });
  check("login funciona de novo após reativar", r.status === 200 && r.data.token, r);

  console.log("\n" + (falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"));
  process.exit(falhas === 0 ? 0 : 1);
}

main().catch(e => { console.error("ERRO INESPERADO:", e); process.exit(1); });
