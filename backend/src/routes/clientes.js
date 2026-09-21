const express = require("express");
const multer = require("multer");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapCliente } = require("../mappers");
const { parsePlanilha, pegar } = require("../importacao");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM clientes WHERE empresa_id = $1 ORDER BY nome",
    [req.usuario.empresaId]
  );
  const clientes = result.rows.map(mapCliente);
  // Para cada cliente, lista os produtos que ele já consome (usado na tela de Clientes).
  const cp = await db.query(
    `SELECT cp.cliente_id, p.nome FROM cliente_produto cp
     JOIN produtos p ON p.id = cp.produto_id
     JOIN clientes c ON c.id = cp.cliente_id
     WHERE c.empresa_id = $1`,
    [req.usuario.empresaId]
  );
  const produtosPorCliente = {};
  cp.rows.forEach((r) => {
    (produtosPorCliente[r.cliente_id] = produtosPorCliente[r.cliente_id] || []).push(r.nome);
  });
  res.json(clientes.map((c) => ({ ...c, produtosConsumidos: produtosPorCliente[c.id] || [] })));
});

router.post("/", async (req, res) => {
  const { nome, telefone } = req.body || {};
  if (!nome || !telefone) return res.status(400).json({ erro: "Nome e WhatsApp são obrigatórios." });
  try {
    const result = await db.query(
      "INSERT INTO clientes (empresa_id, nome, telefone_whatsapp) VALUES ($1,$2,$3) RETURNING *",
      [req.usuario.empresaId, nome.trim(), telefone.trim()]
    );
    res.status(201).json(mapCliente(result.rows[0]));
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ erro: "Já existe um cliente com esse WhatsApp." });
    console.error(err);
    res.status(500).json({ erro: "Não foi possível adicionar o cliente." });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, telefone } = req.body || {};
  const atual = await db.query("SELECT * FROM clientes WHERE id = $1 AND empresa_id = $2", [
    req.params.id,
    req.usuario.empresaId,
  ]);
  if (!atual.rows[0]) return res.status(404).json({ erro: "Cliente não encontrado." });
  const novoNome = nome != null ? String(nome).trim() || atual.rows[0].nome : atual.rows[0].nome;
  const novoTelefone = telefone != null ? String(telefone).trim() || atual.rows[0].telefone_whatsapp : atual.rows[0].telefone_whatsapp;
  try {
    const result = await db.query(
      "UPDATE clientes SET nome = $1, telefone_whatsapp = $2 WHERE id = $3 RETURNING *",
      [novoNome, novoTelefone, req.params.id]
    );
    res.json(mapCliente(result.rows[0]));
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ erro: "Já existe um cliente com esse WhatsApp." });
    console.error(err);
    res.status(500).json({ erro: "Não foi possível atualizar o cliente." });
  }
});

// Importação em massa via planilha (.xlsx ou .csv). Colunas aceitas (com ou
// sem acento, maiúsculas/minúsculas): "Nome", "WhatsApp" (ou "Telefone") e,
// opcionalmente, "Produtos que já consome" (nomes separados por vírgula ou
// ponto e vírgula). Clientes já existentes (mesmo WhatsApp) são atualizados
// em vez de duplicados; produtos citados que ainda não existem são criados
// automaticamente.
router.post("/importar", upload.single("arquivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ erro: "Envie um arquivo (.xlsx ou .csv)." });

  let linhas;
  try {
    linhas = parsePlanilha(req.file.buffer);
  } catch (err) {
    return res.status(400).json({ erro: "Não consegui ler esse arquivo. Confira se é um .xlsx ou .csv válido." });
  }

  let clientesCriados = 0;
  let clientesAtualizados = 0;
  let produtosCriados = 0;
  const erros = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const numeroLinha = i + 2; // +1 pelo cabeçalho, +1 porque a planilha começa em 1
    const nome = pegar(linha, ["nome"]);
    const telefone = pegar(linha, ["whatsapp", "telefone", "telefonewhatsapp", "celular", "numero"]);
    const produtosStr = pegar(linha, [
      "produtosquejaconsome", "produtosjaconsome", "produtos", "produtosconsumidos", "produtoquejaconsome",
    ]);

    if (!nome && !telefone) continue; // linha em branco — ignora silenciosamente
    if (!nome || !telefone) {
      erros.push({ linha: numeroLinha, motivo: "Nome e WhatsApp são obrigatórios." });
      continue;
    }

    try {
      const existente = await db.query(
        `SELECT id FROM clientes
         WHERE empresa_id = $1 AND regexp_replace(telefone_whatsapp, '\\D', '', 'g') = regexp_replace($2, '\\D', '', 'g')`,
        [req.usuario.empresaId, telefone]
      );

      let clienteId;
      if (existente.rows[0]) {
        clienteId = existente.rows[0].id;
        await db.query("UPDATE clientes SET nome = $1 WHERE id = $2", [nome, clienteId]);
        clientesAtualizados++;
      } else {
        const ins = await db.query(
          "INSERT INTO clientes (empresa_id, nome, telefone_whatsapp) VALUES ($1,$2,$3) RETURNING id",
          [req.usuario.empresaId, nome, telefone]
        );
        clienteId = ins.rows[0].id;
        clientesCriados++;
      }

      const nomesProdutos = produtosStr.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      for (const nomeProduto of nomesProdutos) {
        const prodRes = await db.query("SELECT id FROM produtos WHERE empresa_id = $1 AND lower(nome) = lower($2)", [
          req.usuario.empresaId,
          nomeProduto,
        ]);
        let produtoId;
        if (prodRes.rows[0]) {
          produtoId = prodRes.rows[0].id;
        } else {
          const insP = await db.query("INSERT INTO produtos (empresa_id, nome) VALUES ($1,$2) RETURNING id", [
            req.usuario.empresaId,
            nomeProduto,
          ]);
          produtoId = insP.rows[0].id;
          produtosCriados++;
        }
        await db.query(
          `INSERT INTO cliente_produto (cliente_id, produto_id, origem) VALUES ($1,$2,'importacao')
           ON CONFLICT (cliente_id, produto_id) DO NOTHING`,
          [clienteId, produtoId]
        );
      }
    } catch (err) {
      console.error(err);
      erros.push({ linha: numeroLinha, motivo: "Não foi possível importar esta linha." });
    }
  }

  res.json({ clientesCriados, clientesAtualizados, produtosCriados, erros });
});

module.exports = router;
