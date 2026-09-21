const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { clientesElegiveisParaCampanha } = require("../elegibilidade");

const router = express.Router();
router.use(requireAuth);

// Lista consolidada de "quem pode receber um giftback agora", juntando todas
// as campanhas ativas — usada na tela "Giftbacks elegíveis" do menu Giftback.
router.get("/elegiveis", async (req, res) => {
  const campanhasRes = await db.query("SELECT * FROM campanhas_giftback WHERE empresa_id = $1 AND status = 'ativa' ORDER BY titulo", [
    req.usuario.empresaId,
  ]);

  const linhas = [];
  for (const camp of campanhasRes.rows) {
    const elegiveis = await clientesElegiveisParaCampanha(req.usuario.empresaId, camp.id);
    elegiveis.forEach((cli) => {
      linhas.push({
        campanhaId: camp.id,
        campanhaTitulo: camp.titulo,
        valor: Number(camp.valor_giftback),
        valorMinimoCompra: Number(camp.valor_minimo_compra || 0),
        clienteId: cli.clienteId,
        clienteNome: cli.nome,
        clienteTelefone: cli.telefone,
        compraId: cli.compraId,
        dataCompra: cli.dataCompra,
      });
    });
  }
  linhas.sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra));
  res.json(linhas);
});

module.exports = router;
