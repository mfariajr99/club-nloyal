const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido. Configure o .env (veja .env.example).");
}

function hashSenha(senha) {
  return bcrypt.hash(senha, 10);
}
function verificarSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}
function emitirToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, empresaId: usuario.empresa_id, papel: usuario.papel },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Um token do Painel Master (papel "master") nunca tem empresaId e não dá
    // acesso às rotas de uma empresa específica — falha explicitamente aqui
    // em vez de deixar as queries seguirem com empresaId undefined (o que
    // poderia devolver dados errados/vazios silenciosamente).
    if (payload.papel === "master") {
      return res.status(403).json({ erro: "Este login é do Painel Master e não dá acesso às rotas de uma empresa." });
    }
    // Confere o status atual da empresa a cada request (não só no login):
    // "Bloquear"/"Desativar" no Painel Master precisa suspender o acesso na
    // hora, mesmo para quem já estava logado com um token válido por até
    // 30 dias — não dá pra confiar só no que o JWT tinha no momento do login.
    const empresaRes = await db.query("SELECT status FROM empresas WHERE id = $1", [payload.empresaId]);
    const status = empresaRes.rows[0] ? empresaRes.rows[0].status : null;
    if (status === "bloqueada") {
      return res.status(403).json({ erro: "O acesso desta conta está suspenso. Fale com o suporte." });
    }
    if (status !== "ativa") {
      return res.status(403).json({ erro: "Esta conta não está mais ativa." });
    }
    req.usuario = { id: payload.sub, empresaId: payload.empresaId, papel: payload.papel };
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

// ---------------------------------------------------------------------
// Painel Master — super-admin único, sem empresa, usado só para o painel
// cross-tenant (ver routes/master.js). Login e senha são fixos, definidos
// pelo dono do produto; a senha em texto puro NUNCA fica no repositório —
// só o hash bcrypt abaixo, gerado uma vez com bcrypt.hashSync() (não digitado
// à mão) e colado aqui como constante.
// ---------------------------------------------------------------------
const MASTER_LOGIN = "mlf";
const MASTER_SENHA_HASH = "$2a$10$Ah805gyS6RMmRTxEkXGAHOX0ws/i8lYdTIgr1sqeOtTT6vr26pdTe";

async function verificarLoginMaster(login, senha) {
  if (String(login || "").trim() !== MASTER_LOGIN) return false;
  return bcrypt.compare(String(senha || ""), MASTER_SENHA_HASH);
}
function emitirTokenMaster() {
  return jwt.sign({ sub: "master", papel: "master" }, JWT_SECRET, { expiresIn: "30d" });
}
function requireMaster(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.papel !== "master") {
      return res.status(403).json({ erro: "Acesso restrito ao Painel Master." });
    }
    req.master = true;
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

module.exports = {
  hashSenha, verificarSenha, emitirToken, requireAuth,
  verificarLoginMaster, emitirTokenMaster, requireMaster,
};
