// Criptografia do token de sistema (business token) da integração WhatsApp
// antes de gravar em whatsapp_connections.token_ciphertext — nunca em texto
// puro no banco, e nunca nos logs (ver whatsappConnectionService.js, que
// sempre loga só um resumo sanitizado, nunca o valor do token).
//
// AES-256-GCM: cifra autenticada (detecta adulteração do ciphertext no banco,
// não só decodifica). A chave vem de META_TOKEN_ENCRYPTION_KEY — 32 bytes,
// em hex (64 caracteres) ou base64. Gere uma com:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const crypto = require("crypto");

const ALGORITMO = "aes-256-gcm";
const TAMANHO_IV = 12; // recomendado pelo próprio Node para GCM

function lerChave() {
  const raw = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (!raw || !raw.trim()) {
    const err = new Error(
      "META_TOKEN_ENCRYPTION_KEY não definida — necessária para cifrar/decifrar o token da integração WhatsApp. Veja .env.example."
    );
    err.status = 503;
    err.codigo = "meta_nao_configurada";
    throw err;
  }
  const v = raw.trim();
  let buf;
  if (/^[0-9a-fA-F]{64}$/.test(v)) buf = Buffer.from(v, "hex");
  else buf = Buffer.from(v, "base64");
  if (buf.length !== 32) {
    throw new Error(
      "META_TOKEN_ENCRYPTION_KEY precisa representar exatamente 32 bytes (64 caracteres hex, ou base64 equivalente)."
    );
  }
  return buf;
}

// Formato armazenado: "ivHex:authTagHex:ciphertextHex" — texto simples,
// fácil de guardar numa coluna TEXT e de inspecionar em caso de debug
// (sem nunca revelar o conteúdo, claro).
function cifrarToken(tokenPlano) {
  const chave = lerChave();
  const iv = crypto.randomBytes(TAMANHO_IV);
  const cipher = crypto.createCipheriv(ALGORITMO, chave, iv);
  const ciphertext = Buffer.concat([cipher.update(String(tokenPlano), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), ciphertext.toString("hex")].join(":");
}

function decifrarToken(armazenado) {
  if (!armazenado) return null;
  const partes = String(armazenado).split(":");
  if (partes.length !== 3) throw new Error("token_ciphertext em formato inesperado.");
  const [ivHex, authTagHex, ciphertextHex] = partes;
  const chave = lerChave();
  const decipher = crypto.createDecipheriv(ALGORITMO, chave, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const plano = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, "hex")), decipher.final()]);
  return plano.toString("utf8");
}

// Últimos 4 caracteres do token, só pra exibição/diagnóstico (nunca o valor
// completo) — mesmo espírito do "últimos 4 dígitos do WhatsApp" já usado em
// outras partes do sistema.
function mascarar(valor, deixarVisiveis) {
  const n = deixarVisiveis || 4;
  const s = String(valor || "");
  if (s.length <= n) return "•".repeat(Math.max(s.length, 3));
  return "•".repeat(Math.max(s.length - n, 3)) + s.slice(-n);
}

module.exports = { cifrarToken, decifrarToken, mascarar };
