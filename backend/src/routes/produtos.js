const express = require("express");
const multer = require("multer");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapProduto } = require("../mappers");
const { parsePlanilha, pegar } = require("../importacao");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM produtos WHERE empresa_id = $1 ORDER BY nome", [
    req.usuario.empresaId,
  ]);
  const produtos = result.rows.map(mapProduto);
  const usos = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM campanhas_giftback WHERE produto_gatilho_id = p.id) AS como_gatilho,
       (SELECT COUNT(*) FROM campanhas_giftback WHERE produto_alvo_id = p.id) AS como_alvo,
       p.id
     FROM produtos p WHERE p.empresa_id = $1`,
    [req.usuario.empresaId]
  );
  const usoPorId = {};
  usos.rows.forEach((r) => (usoPorId[r.id] = { comoGatilho: Number(r.como_gatilho), comoAlvo: Number(r.como_alvo) }));
  res.json(produtos.map((p) => ({ ...p, ...(usoPorId[p.id] || { comoGatilho: 0, comoAlvo: 0 }) })));
});

router.post("/", async (req, res) => {
  const { nome, categoria } = req.body || {};
  if (!nome) return res.status(400).json({ erro: "Nome do produto é obrigatório." });
  try {
    const result = await db.query(
      "INSERT INTO produtos (empresa_id, nome, categoria) VALUES ($1,$2,$3) RETURNING *",
      [req.usuario.empresaId, nome.trim(), (categoria || "").trim() || null]
    );
    res.status(201).json(mapProduto(result.rows[0]));
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ erro: "Já existe um produto com esse nome." });
    console.error(err);
    res.status(500).json({ erro: "Não foi possível adicionar o produto." });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, categoria } = req.body || {};
  const atual = await db.query("SELECT * FROM produtos WHERE id = $1 AND empresa_id = $2", [
    req.params.id,
    req.usuario.empresaId,
  ]);
  if (!atual.rows[0]) return res.status(404).json({ erro: "Produto não encontrado." });
  const novoNome = nome != null ? String(nome).trim() || atual.rows[0].nome : atual.rows[0].nome;
  const novaCategoria = categoria != null ? String(categoria).trim() || null : atual.rows[0].categoria;
  try {
    const result = await db.query(
      "UPDATE produtos SET nome = $1, categoria = $2 WHERE id = $3 RETURNING *",
      [novoNome, novaCategoria, req.params.id]
    );
    res.json(mapProduto(result.rows[0]));
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ erro: "Já existe um produto com esse nome." });
    console.error(err);
    res.status(500).json({ erro: "Não foi possível atualizar o produto." });
  }
});

// Importação em massa via planilha (.xlsx ou .csv). Colunas aceitas: "Nome"
// e, opcionalmente, "Categoria". Produtos já existentes (mesmo nome) só têm
// a categoria atualizada quando ela vier preenchida na planilha.
router.post("/importar", upload.single("arquivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: "Envie um arquivo (.xlsx ou .csv)." });

  let linhas;
  try {
    linhas = parsePlanilha(req.file.buffer);
  } catch (err) {
    return res.status(400).json({ erro: "Não consegui ler esse arquivo. Confira se é um .xlsx ou .csv válido." });
  }

  let criados = 0;
  let atualizados = 0;
  const erros = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const numeroLinha = i + 2;
    const nome = pegar(linha, ["nome"]);
    const categoria = pegar(linha, ["categoria"]);
    if (!nome) continue; // linha em branco — ignora silenciosamente

    try {
      const existente = await db.query("SELECT id FROM produtos WHERE empresa_id = $1 AND lower(nome) = lower($2)", [
        req.usuario.empresaId,
        nome,
      ]);
      if (existente.rows[0]) {
        if (categoria) {
          await db.query("UPDATE produtos SET categoria = $1 WHERE id = $2", [categoria, existente.rows[0].id]);
        }
        atualizados++;
      } else {
        await db.query("INSERT INTO produtos (empresa_id, nome, categoria) VALUES ($1,$2,$3)", [
          req.usuario.empresaId,
          nome,
          categoria || null,
        ]);
        criados++;
      }
    } catch (err) {
      console.error(err);
      erros.push({ linha: numeroLinha, motivo: "Não foi possível importar esta linha." });
    }
  }

  res.json({ criados, atualizados, erros });
});

module.exports = router;
