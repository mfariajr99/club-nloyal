const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = { id: payload.sub, empresaId: payload.empresaId, papel: payload.papel };
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

module.exports = { hashSenha, verificarSenha, emitirToken, requireAuth };
