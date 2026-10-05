// State/nonce anti-CSRF do Embedded Signup: emitido por
// POST /connection/iniciar (vinculado à empresa da sessão atual) e exigido
// de volta em POST /connection/complete — garante que o "code" só é aceito
// dentro da MESMA sessão autenticada que abriu o popup, e nunca troca o
// tenant no meio do caminho (completarSignup sempre usa req.usuario.empresaId,
// nunca um valor do corpo — o nonce é uma camada extra, não a única).
//
// Guardado em memória do processo (o projeto não tem Redis/cache
// compartilhado — ver README). Isso funciona bem para uma única instância
// (o deploy atual no Render é de instância única); se o serviço algum dia
// escalar horizontalmente sem sticky sessions, este store precisa migrar
// para uma tabela no Postgres (mesmo padrão de outras tabelas do projeto)
// ou um cache compartilhado.
const crypto = require("crypto");

const TTL_MS = 5 * 60 * 1000;
const store = new Map(); // chave "empresaId:nonce" -> expiraEm (ms epoch)

function limparExpirados() {
  const agora = Date.now();
  for (const [chave, expiraEm] of store) {
    if (expiraEm < agora) store.delete(chave);
  }
}

function emitir(empresaId) {
  limparExpirados();
  const nonce = crypto.randomBytes(24).toString("base64url");
  store.set(`${empresaId}:${nonce}`, Date.now() + TTL_MS);
  return nonce;
}

// Consome (uso único) — retorna true só na primeira vez, dentro do prazo.
function validarEConsumir(empresaId, nonce) {
  limparExpirados();
  const chave = `${empresaId}:${nonce}`;
  if (!nonce || !store.has(chave)) return false;
  store.delete(chave);
  return true;
}

module.exports = { emitir, validarEConsumir };
