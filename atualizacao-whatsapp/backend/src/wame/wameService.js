// Regras de negócio da integração com a WAME (envio/recebimento de WhatsApp).
// Cada empresa cadastra a PRÓPRIA chave de instância da WAME e conecta o
// próprio número lendo o QR Code — as mensagens de giftback/indicação saem do
// número da empresa. Tudo aqui recebe `empresaId` já validado pela rota
// (vem do JWT, nunca do corpo da requisição).
//
// A chave fica cifrada no banco (mesma rotina AES-256-GCM já usada pelo token
// da Meta — ver whatsapp/tokenCipher.js, chave em META_TOKEN_ENCRYPTION_KEY) e
// nunca é devolvida inteira ao navegador nem escrita nos logs.
const crypto = require("crypto");
const db = require("../db");
const cliente = require("./wameClient");
const { cifrarToken, decifrarToken } = require("../whatsapp/tokenCipher");

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

// Formato exigido pela WAME: 55 + DDD + número, só dígitos (ex.:
// 5511999999999). Os telefones dos clientes são gravados como a atendente
// digitou — "(11) 99999-0000", "11999990000", "+55 11 ..." — então
// normalizamos aqui: tira tudo que não é dígito e, se vier sem o 55 (10 ou 11
// dígitos = DDD + número), acrescenta.
function normalizarTelefone(tel) {
  let d = String(tel || "").replace(/\D/g, "").replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d;
}

// "5511999999999@s.whatsapp.net" → "5511999999999"
function telefoneDoJid(jid) {
  if (!jid) return null;
  return String(jid).split("@")[0].split(":")[0] || null;
}

function finalDaChave(chave) {
  const s = String(chave || "");
  return s.length > 4 ? s.slice(-4) : s;
}

// Ordem dos status de uma mensagem enviada — um webhook atrasado de
// "entregue" nunca pode "rebaixar" uma mensagem que já está como "lida".
const RANK_STATUS = { pendente: 0, enviada: 1, entregue: 2, lida: 3, falhou: 4 };
const STATUS_WAME_PARA_LOCAL = {
  pending: "pendente",
  sent: "enviada",
  server_ack: "enviada",
  delivered: "entregue",
  delivery_ack: "entregue",
  read: "lida",
  played: "lida",
  failed: "falhou",
  error: "falhou",
};

function mapConexao(row) {
  if (!row) return { configurado: false, status: "nao_configurado" };
  return {
    configurado: true,
    status: row.status,
    telefone: row.telefone,
    nomePerfil: row.nome_perfil,
    chaveFinal: row.chave_final,
    webhookConfigurado: row.webhook_configurado,
    ultimoErro: row.ultimo_erro,
    ultimoEventoEm: row.ultimo_evento_em,
    atualizadoEm: row.atualizado_em,
  };
}

function mapMensagem(row) {
  return {
    id: row.id,
    direcao: row.direcao,
    telefone: row.telefone,
    nomeContato: row.nome_contato,
    texto: row.texto,
    tipo: row.tipo,
    status: row.status,
    erro: row.erro,
    origem: row.origem,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

async function buscarConexao(empresaId) {
  const r = await db.query("SELECT * FROM wame_conexoes WHERE empresa_id = $1", [empresaId]);
  return r.rows[0] || null;
}

function chaveDaConexao(row) {
  return row && row.chave_cifrada ? decifrarToken(row.chave_cifrada) : null;
}

// Lê os dados da instância na resposta de GET /{key}/instance — a WAME manda
// dentro de "instance", mas aceitamos também os campos no nível de cima.
function lerInstancia(resp) {
  const inst = (resp && resp.instance) || resp || {};
  const user = inst.user || resp.user || null;
  const conectado = inst.phoneConnected === true || resp.phoneConnected === true;
  return {
    conectado,
    telefone: user ? telefoneDoJid(user.id) : null,
    nome: user ? user.name || null : null,
  };
}

async function atualizarConexao(empresaId, campos) {
  const chaves = Object.keys(campos);
  if (!chaves.length) return buscarConexao(empresaId);
  const sets = chaves.map((k, i) => `${k} = $${i + 2}`);
  const r = await db.query(
    `UPDATE wame_conexoes SET ${sets.join(", ")}, atualizado_em = now() WHERE empresa_id = $1 RETURNING *`,
    [empresaId, ...chaves.map((k) => campos[k])]
  );
  return r.rows[0] || null;
}

// ---------------------------------------------------------------------------
// Conexão
// ---------------------------------------------------------------------------

// Status atual. Com `consultarWame`, pergunta à WAME antes (usado ao abrir a
// tela e no botão "Atualizar status") e grava o resultado.
async function obterStatus(empresaId, { consultarWame } = {}) {
  let row = await buscarConexao(empresaId);
  if (!row || !consultarWame) return mapConexao(row);
  try {
    const inst = lerInstancia(await cliente.obterInstancia(chaveDaConexao(row)));
    row = await atualizarConexao(empresaId, {
      status: inst.conectado ? "conectado" : row.status === "aguardando_qr" ? "aguardando_qr" : "desconectado",
      telefone: inst.telefone || row.telefone,
      nome_perfil: inst.nome || row.nome_perfil,
      ultimo_erro: null,
    });
  } catch (err) {
    row = await atualizarConexao(empresaId, { status: "erro", ultimo_erro: err.message });
  }
  return mapConexao(row);
}

// Salva (ou troca) a chave da WAME desta empresa: confere na WAME se a chave
// existe, aponta os webhooks da instância pro nosso servidor e grava a chave
// cifrada.
async function salvarChave({ empresaId, chave, baseUrl }) {
  chave = String(chave || "").trim();
  if (!chave) {
    const e = new Error("Informe a chave da sua instância WAME.");
    e.status = 400;
    throw e;
  }
  if (/\s|\//.test(chave)) {
    const e = new Error("A chave parece inválida (não pode ter espaços nem barras). Copie de novo no painel da WAME.");
    e.status = 400;
    throw e;
  }

  let inst;
  try {
    inst = lerInstancia(await cliente.obterInstancia(chave));
  } catch (err) {
    const e = new Error(
      err.status === 401 || err.status === 403 || err.status === 404
        ? "A WAME não reconheceu essa chave. Confira se copiou a chave completa no painel da WAME (dash.wame.api.br)."
        : "Não foi possível validar a chave na WAME: " + err.message
    );
    e.status = 400;
    throw e;
  }

  const existente = await buscarConexao(empresaId);
  const segredo = existente ? existente.segredo_webhook : crypto.randomBytes(24).toString("hex");
  const urlWebhook = `${String(baseUrl).replace(/\/+$/, "")}/api/webhooks/wame/${segredo}`;

  let webhookOk = true;
  let erroWebhook = null;
  try {
    await cliente.configurarWebhook(chave, urlWebhook);
  } catch (err) {
    webhookOk = false;
    erroWebhook = "Chave salva, mas não foi possível configurar o recebimento de mensagens na WAME: " + err.message;
    console.error("[wame] falha ao configurar webhook:", err.message);
  }

  const r = await db.query(
    `INSERT INTO wame_conexoes
       (empresa_id, chave_cifrada, chave_final, segredo_webhook, status, telefone, nome_perfil, webhook_configurado, ultimo_erro)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (empresa_id) DO UPDATE SET
       chave_cifrada = EXCLUDED.chave_cifrada,
       chave_final = EXCLUDED.chave_final,
       status = EXCLUDED.status,
       telefone = EXCLUDED.telefone,
       nome_perfil = EXCLUDED.nome_perfil,
       webhook_configurado = EXCLUDED.webhook_configurado,
       ultimo_erro = EXCLUDED.ultimo_erro,
       atualizado_em = now()
     RETURNING *`,
    [
      empresaId, cifrarToken(chave), finalDaChave(chave), segredo,
      inst.conectado ? "conectado" : "desconectado",
      inst.telefone, inst.nome, webhookOk, erroWebhook,
    ]
  );
  return mapConexao(r.rows[0]);
}

// Gera o QR Code pra ligar o número da empresa. Se o número já estiver
// conectado, a WAME avisa e não manda imagem.
async function gerarQrCode(empresaId) {
  const row = await buscarConexao(empresaId);
  if (!row) {
    const e = new Error("Cadastre a chave da WAME antes de gerar o QR Code.");
    e.status = 400;
    throw e;
  }
  const resp = await cliente.gerarQrCode(chaveDaConexao(row));
  const conectado = resp.phoneConnected === true;
  if (conectado) {
    const inst = lerInstancia(resp);
    await atualizarConexao(empresaId, {
      status: "conectado",
      telefone: inst.telefone || row.telefone,
      nome_perfil: inst.nome || row.nome_perfil,
      ultimo_erro: null,
    });
    return { conectado: true, imagem: null };
  }
  const imagem = resp.image || resp.qrcode_image || null;
  if (!imagem || !String(imagem).startsWith("data:image")) {
    const e = new Error("A WAME não devolveu a imagem do QR Code. Tente de novo em alguns segundos.");
    e.status = 502;
    throw e;
  }
  await atualizarConexao(empresaId, { status: "aguardando_qr", ultimo_erro: null });
  return { conectado: false, imagem };
}

// Remove a integração desta empresa: desliga os webhooks na WAME (melhor
// esforço) e apaga a chave do nosso banco. NÃO desconecta o número na WAME —
// o celular continua pareado na instância da empresa, que é dela.
async function remover(empresaId) {
  const row = await buscarConexao(empresaId);
  if (!row) return mapConexao(null);
  try {
    await cliente.desativarWebhook(chaveDaConexao(row));
  } catch (err) {
    console.error("[wame] falha ao desativar webhook (seguindo com a remoção):", err.message);
  }
  await db.query("DELETE FROM wame_conexoes WHERE empresa_id = $1", [empresaId]);
  return mapConexao(null);
}

// ---------------------------------------------------------------------------
// Envio
// ---------------------------------------------------------------------------

// Envia um texto pelo número da empresa e registra em wame_mensagens.
// Nunca lança erro por causa da WAME — devolve { enviado: false, erro } —
// porque é chamado no meio do fluxo de giftback/indicação, que não pode
// quebrar se o WhatsApp estiver fora. Retorna `null` quando a empresa não
// tem WAME configurada (aí o sistema segue com o link wa.me de sempre).
async function enviarTexto({ empresaId, telefone, texto, origem, envioGiftbackId, indicacaoId }) {
  const row = await buscarConexao(empresaId);
  if (!row) return null;
  if (row.status !== "conectado") {
    return { enviado: false, erro: "O WhatsApp da empresa não está conectado na WAME. Abra Configurações → WhatsApp (WAME) e leia o QR Code." };
  }
  const para = normalizarTelefone(telefone);
  if (para.length < 12) {
    return { enviado: false, erro: "Número de WhatsApp do cliente parece incompleto (precisa de DDD + número)." };
  }

  const ins = await db.query(
    `INSERT INTO wame_mensagens (empresa_id, direcao, telefone, texto, tipo, status, origem, envio_giftback_id, indicacao_id)
     VALUES ($1,'saida',$2,$3,'text','pendente',$4,$5,$6) RETURNING id`,
    [empresaId, para, texto, origem || null, envioGiftbackId || null, indicacaoId || null]
  );
  const mensagemId = ins.rows[0].id;

  try {
    const resp = await cliente.enviarTexto(chaveDaConexao(row), para, texto);
    const dados = resp.data || resp;
    const wameId = (dados.key && dados.key.id) || dados.id || null;
    await db.query(
      "UPDATE wame_mensagens SET status = 'enviada', wame_id = $2, atualizado_em = now() WHERE id = $1",
      [mensagemId, wameId]
    );
    return { enviado: true, mensagemId };
  } catch (err) {
    await db.query(
      "UPDATE wame_mensagens SET status = 'falhou', erro = $2, atualizado_em = now() WHERE id = $1",
      [mensagemId, err.message]
    );
    console.error("[wame] falha ao enviar mensagem:", err.contexto || "", err.message);
    return { enviado: false, erro: "A WAME não conseguiu enviar a mensagem: " + err.message };
  }
}

async function listarMensagens(empresaId, limite) {
  const n = Math.min(Math.max(parseInt(limite, 10) || 50, 1), 200);
  const r = await db.query(
    "SELECT * FROM wame_mensagens WHERE empresa_id = $1 ORDER BY criado_em DESC LIMIT $2",
    [empresaId, n]
  );
  return r.rows.map(mapMensagem);
}

// ---------------------------------------------------------------------------
// Webhook (a WAME chamando o nosso servidor)
// ---------------------------------------------------------------------------

function textoDaMensagem(m) {
  if (!m) return "";
  if (m.text && m.text.body) return m.text.body;
  const legenda = (m.image && m.image.caption) || (m.video && m.video.caption) || (m.document && m.document.caption);
  const rotulos = {
    image: "[imagem]", video: "[vídeo]", audio: "[áudio]", document: "[documento]", sticker: "[figurinha]",
    location: "[localização]", contacts: "[contato]", reaction: "[reação]",
  };
  if (m.type === "reaction" && m.reaction) return "[reação] " + (m.reaction.emoji || "");
  if (m.type === "button" && m.button) return m.button.text || "[botão]";
  if (m.type === "interactive" && m.interactive) {
    const i = m.interactive;
    return (i.button_reply && i.button_reply.title) || (i.list_reply && i.list_reply.title) || "[resposta interativa]";
  }
  const base = rotulos[m.type] || "[" + (m.type || "mensagem") + "]";
  return legenda ? base + " " + legenda : base;
}

async function processarStatus(empresaId, st) {
  const novo = STATUS_WAME_PARA_LOCAL[String(st.status || "").toLowerCase()];
  if (!novo || !st.id) return;
  const atual = await db.query(
    "SELECT id, status FROM wame_mensagens WHERE empresa_id = $1 AND wame_id = $2 AND direcao = 'saida'",
    [empresaId, st.id]
  );
  const linha = atual.rows[0];
  if (!linha) return;
  if (novo !== "falhou" && (RANK_STATUS[novo] || 0) <= (RANK_STATUS[linha.status] || 0)) return;
  const erro = novo === "falhou" && Array.isArray(st.errors) && st.errors[0]
    ? st.errors[0].message || st.errors[0].title || "Falha no envio"
    : null;
  await db.query(
    "UPDATE wame_mensagens SET status = $2, erro = COALESCE($3, erro), atualizado_em = now() WHERE id = $1",
    [linha.id, novo, erro]
  );
}

async function processarMensagemRecebida(empresaId, m, contatos) {
  if (!m || m.from_me === true) return; // eco das mensagens que a própria empresa mandou
  if (m.chat_type && m.chat_type !== "individual") return; // ignora grupos
  const telefone = normalizarTelefone(m.from);
  const contato = (contatos || []).find((c) => c.wa_id === m.from) || (contatos || [])[0] || null;
  const nome = contato && contato.profile ? contato.profile.name || null : null;
  await db.query(
    `INSERT INTO wame_mensagens (empresa_id, direcao, telefone, nome_contato, texto, tipo, wame_id, status, origem)
     VALUES ($1,'entrada',$2,$3,$4,$5,$6,'recebida','cliente')
     ON CONFLICT DO NOTHING`,
    [empresaId, telefone, nome, textoDaMensagem(m), m.type || null, m.id || null]
  );
}

async function processarConexao(empresaId, value) {
  const c = (value && value.connection) || {};
  const tel = value && value.metadata ? value.metadata.display_phone_number : null;
  const status = String(c.status || "").toLowerCase();
  if (status === "open") {
    await atualizarConexao(empresaId, Object.assign({ status: "conectado", ultimo_erro: null }, tel ? { telefone: tel } : {}));
  } else if (status === "close") {
    await atualizarConexao(empresaId, {
      status: "desconectado",
      ultimo_erro: c.reason ? "O WhatsApp desconectou da WAME (" + c.reason + "). Leia o QR Code de novo." : null,
    });
  }
}

// Ponto de entrada do webhook. `segredo` vem da URL que nós mesmos
// cadastramos na WAME (um valor aleatório por empresa) — é ele que diz de
// qual empresa é o evento e impede que alguém de fora injete eventos sem
// conhecer o endereço. Cada evento trata o próprio erro, pra um evento
// estranho não impedir o processamento dos outros.
async function processarWebhook(segredo, payload) {
  const r = await db.query("SELECT empresa_id FROM wame_conexoes WHERE segredo_webhook = $1", [segredo]);
  if (!r.rows[0]) return false;
  const empresaId = r.rows[0].empresa_id;
  if (!payload || !Array.isArray(payload.entry)) return true;
  if (payload.provider && payload.provider !== "whatsapp") return true;

  for (const entry of payload.entry) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      try {
        if (change.field === "messages") {
          for (const st of value.statuses || []) await processarStatus(empresaId, st);
          for (const m of value.messages || []) await processarMensagemRecebida(empresaId, m, value.contacts);
        } else if (change.field === "connection") {
          await processarConexao(empresaId, value);
        }
      } catch (err) {
        console.error("[wame webhook] erro ao processar evento", change.field, "-", err.message);
      }
    }
  }
  await db.query("UPDATE wame_conexoes SET ultimo_evento_em = now() WHERE empresa_id = $1", [empresaId]);
  return true;
}

module.exports = {
  obterStatus, salvarChave, gerarQrCode, remover, enviarTexto, listarMensagens, processarWebhook,
  normalizarTelefone,
};
