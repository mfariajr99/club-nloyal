const express = require("express");
const { requireAuth } = require("../auth");
const { calcularDashboard } = require("../dashboardStats");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(await calcularDashboard(req.usuario.empresaId));
});

module.exports = router;
