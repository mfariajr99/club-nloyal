// Envio de mensagens via Cloud API — hoje usado só pela "Enviar mensagem de
// teste" da tela de conexão. Também expõe `obterConexaoSaudavel`, pensado
// para as campanhas (Giftback/Indicação) usarem no futuro para resolver a
// conexão do tenant autenticado e bloquear o disparo se ela não estiver
// saudável — ainda NÃO plugado nos fluxos de envio existentes (que hoje
// mandam por link wa.me manual): trocar esse comportamento é uma decisão de
// produto à parte, já que mensagem iniciada pela empresa fora da janela de
// 24h exige template aprovado pela Meta, e as campanhas atuais usam texto
// livre. Ver PLANO-WHATSAPP.md.
const crypto = require("crypto");
const db = require("../db");
const cliente = require("./metaWhatsappClient");
const { decifrarToken } = require("./tokenCipher");
const { mensagemAmigavelMeta } = require("./errosAmigaveis");
const { mapWhatsappMessage } = require("./whatsappMappers");
const { buscarConexaoRaw } = require("./whatsappConnectionService");

const STATUS_SAUDAVEL = new Set(["conectado"]);

// Ponto único que qualquer disparo (hoje: mensagem de teste; amanhã:
// campanhas) deve chamar antes de mandar qualquer mensagem — nunca aceita
// tenantId vindo do chamador além do empresaId já autenticado.
async function obterConexaoSaudavel(empresaId) {
  const row = await buscarConexaoRaw(empresaId);
  if (!row) { const e = new Error("WhatsApp não conectado."); e.codigo = "nao_conectado"; e.status = 409; throw e; }
  if (!STATUS_SAUDAVEL.has(row.connection_status)) {
    const e = new Error("A conexão do WhatsApp está com pendência (" + row.connection_status + ") — resolva antes de enviar mensagens.");
    e.codigo = "conexao_nao_saudavel"; e.status = 409; throw e;
  }
  const accessToken = decifrarToken(row.token_ciphertext);
  if (!accessToken) { const e = new Error("Conexão sem token válido — reconecte o WhatsApp."); e.codigo = "sem_token"; e.status = 409; throw e; }
  return { row, accessToken };
}

function normalizarTelefone(tel) {
  const digitos = String(tel || "").replace(/\D/g, "");
  if (digitos.length < 8) { const e = new Error("Número de telefone inválido."); e.status = 400; throw e; }
  return "+" + digitos;
}

// Mensagem de teste — pedida explicitamente na tela "Conectado". Usa um
// template aprovado (a Meta não permite texto livre para mensagem iniciada
// pela empresa fora da janela de 24h de atendimento) e persiste o wamid
// retornado; o status (entregue/lido/falhou) chega depois pelo webhook.
async function enviarMensagemTeste({ empresaId, usuarioId, destinatario, templateNome, templateIdioma, parametrosCorpo, idempotencyKey }) {
  if (!templateNome) { const e = new Error("Informe o nome do template aprovado a usar no teste."); e.status = 400; throw e; }
  const idioma = templateIdioma || "pt_BR";
  const { row, accessToken } = await obterConexaoSaudavel(empresaId);
  const paraNormalizado = normalizarTelefone(destinatario);
  const chave = idempotencyKey || crypto.randomUUID();

  const existente = await db.query(
    "SELECT * FROM whatsapp_messages WHERE idempotency_key = $1 AND empresa_id = $2",
    [chave, empresaId]
  );
  if (existente.rows[0]) return mapWhatsappMessage(existente.rows[0]);

  let insercao;
  try {
    insercao = await db.query(
      `INSERT INTO whatsapp_messages
         (empresa_id, connection_id, destinatario, tipo, template_nome, template_idioma, template_parametros,
          origem, idempotency_key, status)
       VALUES ($1,$2,$3,'teste',$4,$5,$6,'config-whatsapp-teste',$7,'enviando')
       RETURNING *`,
      [empresaId, row.id, paraNormalizado, templateNome, idioma, JSON.stringify(parametrosCorpo || []), chave]
    );
  } catch (err) {
    // idx_whatsapp_messages_idempotency_por_empresa — corrida rara entre duas
    // requisições simultâneas com a MESMA idempotencyKey, dentro da mesma
    // empresa (a checagem SELECT acima não protege contra isso sozinha).
    // Nunca deixa vazar o erro cru do Postgres pro chamador.
    if (err.code === "23505" && String(err.constraint || "").includes("idempotency")) {
      const repetida = await db.query(
        "SELECT * FROM whatsapp_messages WHERE idempotency_key = $1 AND empresa_id = $2",
        [chave, empresaId]
      );
      if (repetida.rows[0]) return mapWhatsappMessage(repetida.rows[0]);
    }
    throw err;
  }
  let msgRow = insercao.rows[0];

  try {
    const resp = await cliente.enviarMensagemTemplate({
      phoneNumberId: row.phone_number_id, accessToken, para: paraNormalizado,
      templateNome, idioma, parametrosCorpo,
    });
    const wamid = resp && resp.messages && resp.messages[0] ? resp.messages[0].id : null;
    const r = await db.query(
      `UPDATE whatsapp_messages SET wamid = $2, status = 'aceito', atualizado_em = now() WHERE id = $1 RETURNING *`,
      [msgRow.id, wamid]
    );
    msgRow = r.rows[0];
    await require("./whatsappConnectionService").registrarAuditoria(
      empresaId, usuarioId, "teste_mensagem", true, `para=${paraNormalizado.slice(0, 4)}••• template=${templateNome}`
    );
  } catch (err) {
    const r = await db.query(
      `UPDATE whatsapp_messages SET status = 'falhou', erro_codigo = $2, erro_mensagem = $3, atualizado_em = now() WHERE id = $1 RETURNING *`,
      [msgRow.id, String(err.metaCodigo || err.status || "erro"), mensagemAmigavelMeta(err)]
    );
    msgRow = r.rows[0];
    await require("./whatsappConnectionService").registrarAuditoria(
      empresaId, usuarioId, "teste_mensagem", false, `erro=${err.metaCodigo || err.status}`
    );
    err.mensagemAmigavel = mensagemAmigavelMeta(err);
    err.mensagemPersistida = mapWhatsappMessage(msgRow);
    throw err;
  }
  return mapWhatsappMessage(msgRow);
}

async function buscarMensagem(empresaId, mensagemId) {
  const r = await db.query("SELECT * FROM whatsapp_messages WHERE id = $1 AND empresa_id = $2", [mensagemId, empresaId]);
  return r.rows[0] ? mapWhatsappMessage(r.rows[0]) : null;
}

module.exports = { obterConexaoSaudavel, normalizarTelefone, enviarMensagemTeste, buscarMensagem };
