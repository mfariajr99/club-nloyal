// Regras de negócio da conexão WhatsApp oficial (Embedded Signup / Cloud
// API) — completar o cadastro, sincronizar, desconectar. Tudo aqui recebe
// `empresaId` já validado pelo requireAuth da rota (nunca um valor cru vindo
// do corpo da requisição) — isolamento multi-tenant garantido neste único
// ponto, em vez de espalhado em cada query.
const db = require("../db");
const cliente = require("./metaWhatsappClient");
const { exigirConfig } = require("./metaConfig");
const { cifrarToken, decifrarToken, mascarar } = require("./tokenCipher");
const { mensagemAmigavelMeta } = require("./errosAmigaveis");
const { mapWhatsappConnection } = require("./whatsappMappers");

// Valores documentados do campo "status" de um número na Cloud API que
// indicam que a Meta restringiu/sinalizou o número (developers.facebook.com
// /docs/whatsapp/cloud-api/reference/phone-numbers, consultado em
// setembro/2026) — nesses casos a tela deve mostrar "Número restrito", não
// "Conectado com pendência" (que é reservado a coisas como webhook ainda não
// inscrito, algo que resolvemos sozinhos "Sincronizando"/reconectando).
const STATUS_NUMERO_RESTRITO = new Set(["RESTRICTED", "FLAGGED", "RATE_LIMITED"]);
function classificarStatusConexao(detalhesNumero, webhookInscrito) {
  if (detalhesNumero && STATUS_NUMERO_RESTRITO.has(String(detalhesNumero.status || "").toUpperCase())) {
    return "numero_restrito";
  }
  if (!detalhesNumero) return "conectado_com_pendencia";
  return webhookInscrito ? "conectado" : "conectado_com_pendencia";
}

async function registrarAuditoria(empresaId, usuarioId, acao, sucesso, detalheSanitizado) {
  try {
    await db.query(
      `INSERT INTO whatsapp_connection_audit (empresa_id, usuario_id, acao, sucesso, detalhe_sanitizado)
       VALUES ($1,$2,$3,$4,$5)`,
      [empresaId, usuarioId || null, acao, sucesso, detalheSanitizado || null]
    );
  } catch (e) {
    // Auditoria nunca deve derrubar a operação principal.
    console.error("[whatsapp] falha ao gravar auditoria:", e.message);
  }
}

async function buscarConexaoRaw(empresaId) {
  const r = await db.query("SELECT * FROM whatsapp_connections WHERE empresa_id = $1", [empresaId]);
  return r.rows[0] || null;
}

async function obterStatus(empresaId) {
  const row = await buscarConexaoRaw(empresaId);
  if (!row) return { status: "nao_conectado" };
  return mapWhatsappConnection(row);
}

// Confirma, direto na Graph API, que o token realmente autoriza a WABA e o
// número que o FRONTEND reportou — nunca confiamos só no postMessage do
// popup (é só um evento de UI, pode ser manipulado no navegador).
async function confirmarPosseDosAtivos({ accessToken, wabaId, phoneNumberId, businessId }) {
  const debug = await cliente.inspecionarToken(accessToken);
  const dados = debug && debug.data ? debug.data : null;
  if (!dados || dados.is_valid !== true) {
    const err = new Error("Token retornado pela Meta não é válido.");
    err.codigo = "token_invalido";
    throw err;
  }
  // granular_scopes traz, por permissão, a lista de target_ids (WABAs,
  // negócios etc.) que aquele token realmente autoriza — é a forma oficial
  // de confirmar posse além do que o evento do popup informou.
  const escopos = dados.granular_scopes || [];
  const autorizaWaba = escopos.some(
    (s) => s.scope === "whatsapp_business_management" && (s.target_ids || []).includes(wabaId)
  );
  if (!autorizaWaba) {
    const err = new Error("O token retornado pela Meta não autoriza esta WhatsApp Business Account.");
    err.codigo = "waba_nao_autorizada";
    throw err;
  }
  // Confirmação adicional: o número precisa realmente pertencer à WABA
  // (segunda fonte, além do granular_scopes) — também é o que detecta um
  // número já reivindicado por engano em outra WABA.
  const numeros = await cliente.listarNumerosDaWaba(wabaId, accessToken);
  const pertence = (numeros && numeros.data ? numeros.data : []).some((n) => n.id === phoneNumberId);
  if (!pertence) {
    const err = new Error("O número informado não pertence a esta WhatsApp Business Account.");
    err.codigo = "numero_nao_pertence_waba";
    throw err;
  }
  return { escopos: escopos.map((s) => s.scope), expiraEm: dados.expires_at || null };
}

// Passo final do Embedded Signup: troca o code, confirma posse dos ativos
// direto na Graph API, assina o app nos webhooks da WABA, busca os dados
// reais do número e persiste a conexão cifrada. Idempotente: reexecutar com
// um code novo para a mesma empresa apenas atualiza a conexão existente
// (reconexão usa este mesmo caminho).
async function completarSignup({ empresaId, usuarioId, code, wabaId, phoneNumberId, businessId }) {
  exigirConfig(["appId", "appSecret", "tokenEncryptionKey", "redirectUri"]);
  if (!code) { const e = new Error("Código de autorização ausente."); e.codigo = "code_ausente"; e.status = 400; throw e; }

  let tokenResp;
  try {
    tokenResp = await cliente.trocarCodePorToken(code);
  } catch (err) {
    await registrarAuditoria(empresaId, usuarioId, "conectar", false, `troca_code_falhou:${err.metaCodigo || err.status}`);
    // DEBUG TEMPORÁRIO — inclui o erro real da Meta na mensagem pra
    // conseguirmos ver, pelo toast/Network do navegador, qual é o motivo
    // verdadeiro (a mensagem genérica de "expirou" pode estar escondendo
    // outra causa, ex: código já usado, redirect_uri, etc). Remover depois
    // de descobrir a causa.
    err.mensagemAmigavel = err.status === 400
      ? `O código de autorização expirou (ele só vale por ~30 segundos). Tente conectar novamente. [debug: ${err.message} | metaCodigo=${err.metaCodigo} metaSubcodigo=${err.metaSubcodigo} metaTipo=${err.metaTipo}]`
      : mensagemAmigavelMeta(err);
    throw err;
  }
  const accessToken = tokenResp && tokenResp.access_token;
  if (!accessToken) {
    await registrarAuditoria(empresaId, usuarioId, "conectar", false, "sem_access_token_na_resposta");
    const e = new Error("A Meta não retornou um token de acesso.");
    e.codigo = "sem_token"; throw e;
  }

  // O popup da Meta deveria mandar (via postMessage) o waba_id/phone_number_id
  // escolhidos no Embedded Signup, mas em alguns fluxos/navegadores essa
  // mensagem simplesmente nunca chega ao frontend (observado em produção,
  // mesmo completando o fluxo até o fim do lado da Meta) — sem isso o
  // frontend não tem o que mandar. Nesse caso, descobrimos os mesmos
  // identificadores direto na Graph API usando o próprio token recebido: o
  // debug_token informa, em granular_scopes, exatamente quais WABAs esse
  // token autoriza (escopo whatsapp_business_management) — é uma fonte
  // oficial, não um palpite. Se houver só uma WABA autorizada e ela tiver só
  // um número, conectamos automaticamente; se houver mais de uma, paramos e
  // avisamos (não temos como adivinhar qual o cliente quis escolher).
  if (!wabaId || !phoneNumberId) {
    try {
      const debug = await cliente.inspecionarToken(accessToken);
      const dados = debug && debug.data ? debug.data : null;
      const escopos = (dados && dados.granular_scopes) || [];
      const wabaScope = escopos.find((s) => s.scope === "whatsapp_business_management");
      const wabaIdsAutorizados = (wabaScope && wabaScope.target_ids) || [];

      if (wabaIdsAutorizados.length > 1) {
        const e = new Error(
          "Foram encontradas mais de uma conta do WhatsApp Business autorizada para esta empresa na Meta; não foi possível escolher automaticamente qual conectar."
        );
        e.codigo = "multiplas_wabas_autorizadas"; e.status = 400; throw e;
      }
      if (wabaIdsAutorizados.length === 1) {
        wabaId = wabaIdsAutorizados[0];
        const numeros = await cliente.listarNumerosDaWaba(wabaId, accessToken);
        const listaNumeros = (numeros && numeros.data) || [];
        if (listaNumeros.length > 1) {
          const e = new Error(
            "Foi encontrado mais de um número de telefone nesta conta do WhatsApp Business; não foi possível escolher automaticamente qual conectar."
          );
          e.codigo = "multiplos_numeros_autorizados"; e.status = 400; throw e;
        }
        if (listaNumeros.length === 1) phoneNumberId = listaNumeros[0].id;
      }
    } catch (err) {
      if (err.codigo === "multiplas_wabas_autorizadas" || err.codigo === "multiplos_numeros_autorizados") {
        await registrarAuditoria(empresaId, usuarioId, "conectar", false, err.codigo);
        throw err;
      }
      // Falha ao tentar descobrir automaticamente (rede, Graph API fora do
      // ar etc.) — segue para o erro genérico "identificadores_ausentes"
      // abaixo, sem derrubar a operação com um erro diferente do esperado.
      console.error("[whatsapp] falha ao tentar descobrir waba/número automaticamente:", err.message);
    }
  }

  if (!wabaId || !phoneNumberId) {
    await registrarAuditoria(empresaId, usuarioId, "conectar", false, "identificadores_ausentes");
    const e = new Error("A Meta não retornou os identificadores da conta do WhatsApp.");
    e.codigo = "identificadores_ausentes"; e.status = 400; throw e;
  }

  let posse;
  try {
    posse = await confirmarPosseDosAtivos({ accessToken, wabaId, phoneNumberId, businessId });
  } catch (err) {
    await registrarAuditoria(empresaId, usuarioId, "conectar", false, `posse_nao_confirmada:${err.codigo}`);
    err.mensagemAmigavel = mensagemAmigavelMeta(err) !== "Algo deu errado ao falar com a Meta."
      ? mensagemAmigavelMeta(err)
      : "Não foi possível confirmar, junto à Meta, que esta conta autoriza o número selecionado.";
    throw err;
  }

  let detalhesNumero = null;
  try {
    const resp = await cliente.buscarDetalhesNumero(phoneNumberId, accessToken);
    detalhesNumero = resp || null;
  } catch (err) {
    // Segue mesmo sem os detalhes (fica "conectado_com_pendencia"); o botão
    // "Sincronizar status" tenta de novo depois.
    console.error("[whatsapp] falha ao buscar detalhes do número:", err.message);
  }

  let webhookStatus = "pendente";
  try {
    await cliente.assinarApp(wabaId, accessToken);
    webhookStatus = "inscrito";
  } catch (err) {
    console.error("[whatsapp] falha ao assinar app na WABA:", err.message);
    webhookStatus = "erro";
  }

  const statusConexao = classificarStatusConexao(detalhesNumero, webhookStatus === "inscrito");
  const tokenCifrado = cifrarToken(accessToken);

  let row;
  try {
    const r = await db.query(
      `INSERT INTO whatsapp_connections (
         empresa_id, meta_business_id, waba_id, phone_number_id, display_phone_number,
         verified_name, connection_status, number_status, quality_rating, code_verification_status,
         token_ciphertext, token_expires_at, scopes, webhook_status,
         connected_at, last_synced_at, disconnected_at, last_error_code, last_error_message_sanitized, atualizado_em
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now(), now(), NULL, NULL, NULL, now())
       ON CONFLICT (empresa_id) DO UPDATE SET
         meta_business_id = EXCLUDED.meta_business_id,
         waba_id = EXCLUDED.waba_id,
         phone_number_id = EXCLUDED.phone_number_id,
         display_phone_number = EXCLUDED.display_phone_number,
         verified_name = EXCLUDED.verified_name,
         connection_status = EXCLUDED.connection_status,
         number_status = EXCLUDED.number_status,
         quality_rating = EXCLUDED.quality_rating,
         code_verification_status = EXCLUDED.code_verification_status,
         token_ciphertext = EXCLUDED.token_ciphertext,
         token_expires_at = EXCLUDED.token_expires_at,
         scopes = EXCLUDED.scopes,
         webhook_status = EXCLUDED.webhook_status,
         connected_at = now(),
         last_synced_at = now(),
         disconnected_at = NULL,
         last_error_code = NULL,
         last_error_message_sanitized = NULL,
         atualizado_em = now()
       RETURNING *`,
      [
        empresaId, businessId || null, wabaId, phoneNumberId,
        detalhesNumero ? detalhesNumero.display_phone_number : null,
        detalhesNumero ? detalhesNumero.verified_name : null,
        statusConexao,
        detalhesNumero ? detalhesNumero.status : null,
        detalhesNumero ? detalhesNumero.quality_rating : null,
        detalhesNumero ? detalhesNumero.code_verification_status : null,
        tokenCifrado,
        posse.expiraEm ? new Date(posse.expiraEm * 1000).toISOString() : null,
        posse.escopos.join(","),
        webhookStatus,
      ]
    );
    row = r.rows[0];
  } catch (err) {
    // idx_whatsapp_connections_phone_ativo — este número já está conectado
    // (ativamente) em outra empresa.
    if (err.code === "23505" && String(err.constraint || "").includes("phone_ativo")) {
      await registrarAuditoria(empresaId, usuarioId, "conectar", false, "numero_ja_vinculado_outra_empresa");
      const e = new Error("Este número já está conectado a outra conta da plataforma.");
      e.codigo = "numero_ja_vinculado"; e.status = 409; throw e;
    }
    throw err;
  }

  await registrarAuditoria(
    empresaId, usuarioId, "conectar", true,
    `waba=${mascarar(wabaId)} numero=${mascarar(phoneNumberId)} status=${statusConexao}`
  );
  return mapWhatsappConnection(row);
}

// "Sincronizar status": relê os dados reais do número e a assinatura de
// webhook direto na Meta — usado tanto pelo botão manual quanto poderia ser
// usado por um job periódico no futuro (não implementado agora: o projeto
// não tem infraestrutura de fila/worker, ver README/PLANO-WHATSAPP.md).
async function sincronizar({ empresaId, usuarioId }) {
  const row = await buscarConexaoRaw(empresaId);
  if (!row) { const e = new Error("Nenhuma conexão WhatsApp encontrada."); e.status = 404; throw e; }
  exigirConfig(["tokenEncryptionKey"]);
  const accessToken = decifrarToken(row.token_ciphertext);
  if (!accessToken) {
    await registrarAuditoria(empresaId, usuarioId, "sincronizar", false, "sem_token_armazenado");
    return marcarErro(empresaId, "sem_token", "Conexão sem token armazenado — reconecte o WhatsApp.");
  }

  let detalhes, appsAssinados;
  try {
    detalhes = await cliente.buscarDetalhesNumero(row.phone_number_id, accessToken);
  } catch (err) {
    if (err.metaCodigo === 190) {
      await registrarAuditoria(empresaId, usuarioId, "sincronizar", false, "token_expirado");
      return marcarErro(empresaId, "token_expirado", mensagemAmigavelMeta(err), "token_expirado");
    }
    await registrarAuditoria(empresaId, usuarioId, "sincronizar", false, `erro:${err.metaCodigo || err.status}`);
    return marcarErro(empresaId, String(err.metaCodigo || err.status || "erro"), mensagemAmigavelMeta(err));
  }
  try {
    appsAssinados = await cliente.listarApsAssinados(row.waba_id, accessToken);
  } catch (err) {
    appsAssinados = null;
  }
  const inscrito = appsAssinados && Array.isArray(appsAssinados.data) && appsAssinados.data.length > 0;
  const statusConexao = classificarStatusConexao(detalhes, inscrito);

  const r = await db.query(
    `UPDATE whatsapp_connections SET
       display_phone_number = $2, verified_name = $3, number_status = $4, quality_rating = $5,
       code_verification_status = $6, webhook_status = $7, connection_status = $8,
       last_synced_at = now(), last_error_code = NULL, last_error_message_sanitized = NULL, atualizado_em = now()
     WHERE empresa_id = $1 RETURNING *`,
    [
      empresaId, detalhes.display_phone_number, detalhes.verified_name, detalhes.status,
      detalhes.quality_rating, detalhes.code_verification_status,
      inscrito ? "inscrito" : "erro", statusConexao,
    ]
  );
  await registrarAuditoria(empresaId, usuarioId, "sincronizar", true, `status=${statusConexao}`);
  return mapWhatsappConnection(r.rows[0]);
}

async function marcarErro(empresaId, codigo, mensagemSanitizada, statusConexao) {
  const r = await db.query(
    `UPDATE whatsapp_connections SET
       connection_status = $2, last_error_code = $3, last_error_message_sanitized = $4, atualizado_em = now()
     WHERE empresa_id = $1 RETURNING *`,
    [empresaId, statusConexao || "erro", codigo, mensagemSanitizada]
  );
  return mapWhatsappConnection(r.rows[0]);
}

// Desconecta a INTEGRAÇÃO — nunca apaga o Business Portfolio, a WABA ou o
// número na conta Meta do cliente. Só remove a assinatura do nosso app
// (best-effort: se o token já estiver inválido, não há o que desassinar do
// lado da Meta, e seguimos com a limpeza local mesmo assim) e limpa o token
// localmente. Nunca chama /register com deregister — isso não faz parte
// desta ação.
async function desconectar({ empresaId, usuarioId }) {
  const row = await buscarConexaoRaw(empresaId);
  if (!row) { const e = new Error("Nenhuma conexão WhatsApp encontrada."); e.status = 404; throw e; }

  const accessToken = row.token_ciphertext ? decifrarToken(row.token_ciphertext) : null;
  if (accessToken) {
    try { await cliente.desassinarApp(row.waba_id, accessToken); }
    catch (err) { console.error("[whatsapp] falha ao desassinar app (seguindo com a desconexão local):", err.message); }
  }

  const r = await db.query(
    `UPDATE whatsapp_connections SET
       connection_status = 'desconectado', disconnected_at = now(), token_ciphertext = NULL,
       webhook_status = 'pendente', atualizado_em = now()
     WHERE empresa_id = $1 RETURNING *`,
    [empresaId]
  );
  await registrarAuditoria(empresaId, usuarioId, "desconectar", true, null);
  return mapWhatsappConnection(r.rows[0]);
}

module.exports = { obterStatus, completarSignup, sincronizar, desconectar, buscarConexaoRaw, registrarAuditoria };
