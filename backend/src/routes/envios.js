const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { mapEnvio } = require("../mappers");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { clienteId } = req.query;
  const params = [req.usuario.empresaId];
  let where = "empresa_id = $1";
  if (clienteId) {
    params.push(clienteId);
    where += ` AND cliente_id = $${params.length}`;
  }
  const result = await db.query(
    `SELECT * FROM envios_giftback WHERE ${where} ORDER BY data_envio DESC`,
    params
  );
  res.json(result.rows.map(mapEnvio));
});

module.exports = router;
