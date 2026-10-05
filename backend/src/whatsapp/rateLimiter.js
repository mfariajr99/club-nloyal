// Rate limiting simples em memória (janela deslizante), sem depender de
// pacote novo — mesmo raciocínio do whatsappNonceStore.js: só vale para uma
// instância; documentado no README de configuração.
// Usado nos endpoints sensíveis da integração WhatsApp (completar conexão,
// sincronizar, mensagem de teste, webhook) pra evitar abuso/looping.
const janelas = new Map(); // chave -> [timestamps]

function limitarPorChave(chave, { limite, janelaMs }) {
  const agora = Date.now();
  const lista = (janelas.get(chave) || []).filter((t) => agora - t < janelaMs);
  if (lista.length >= limite) return false;
  lista.push(agora);
  janelas.set(chave, lista);
  return true;
}

// Middleware Express: identifica o chamador por empresaId (rota autenticada)
// ou IP (rota pública, ex.: webhook) + um prefixo próprio do endpoint.
function rateLimitMiddleware({ prefixo, limite, janelaMs }) {
  return (req, res, next) => {
    const identidade = (req.usuario && req.usuario.empresaId) || req.ip || "anon";
    const chave = `${prefixo}:${identidade}`;
    if (!limitarPorChave(chave, { limite, janelaMs })) {
      return res.status(429).json({ erro: "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente." });
    }
    next();
  };
}

module.exports = { rateLimitMiddleware };
