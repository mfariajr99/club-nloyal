require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
// Necessário em produção (Render, e qualquer host atrás de proxy/load balancer):
// sem isso, req.protocol sempre retorna "http" mesmo quando o acesso real foi
// via HTTPS, o que geraria links de resgate errados nas mensagens de WhatsApp.
app.set("trust proxy", 1);
app.use(cors());
// Limite maior que o padrão (100kb): a tela Aparência manda a logo como uma
// data URL (base64) dentro do corpo JSON do PUT /api/config/empresa.
// `verify` guarda os bytes originais do corpo em req.rawBody — necessário
// pro webhook da Meta (routes/webhooksMeta.js), cuja assinatura
// X-Hub-Signature-256 é calculada sobre o corpo bruto, não sobre o objeto
// já reserializado depois do JSON.parse. Barato o suficiente pra deixar
// ligado globalmente em vez de duplicar o parser só pra essa rota.
app.use(express.json({ limit: "5mb", verify: (req, res, buf) => { req.rawBody = buf; } }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/produtos", require("./routes/produtos"));
app.use("/api/campanhas", require("./routes/campanhas"));
app.use("/api/compras", require("./routes/compras"));
app.use("/api/envios", require("./routes/envios"));
app.use("/api/vouchers", require("./routes/vouchers"));
app.use("/api/config", require("./routes/config"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/giftback", require("./routes/giftback"));
app.use("/api/indicacoes", require("./routes/indicacoes"));
app.use("/api/master", require("./routes/master"));
app.use("/api/public", require("./routes/public"));
app.use("/api/config/whatsapp", require("./routes/whatsapp"));
// Webhook oficial da Meta — fora de /api/config (não é autenticado, não é
// "configuração da empresa logada": é a Meta chamando o servidor).
app.use("/api/webhooks/meta/whatsapp", require("./routes/webhooksMeta"));
// Integração WAME (wame.api.br): tela de configuração (autenticada) e o
// webhook público que a WAME chama com mensagens recebidas e status.
app.use("/api/config/wame", require("./routes/wame"));
app.use("/api/webhooks/wame", require("./routes/webhooksWame"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve o frontend estático (SPA) e devolve index.html para qualquer rota
// que não seja da API — o roteamento de página (dashboard, histórico, resgate
// etc.) é feito no cliente via hash (#/...), então uma única página serve tudo.
const frontendDir = path.join(__dirname, "..", "..", "frontend");
app.use(express.static(frontendDir));
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Giftback backend rodando na porta ${PORT}`);
});
