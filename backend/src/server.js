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
app.use(express.json({ limit: "5mb" }));

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
app.use("/api/public", require("./routes/public"));

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
