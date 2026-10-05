-- =====================================================================
-- SISTEMA DE GIFTBACK — SCHEMA DE PRODUÇÃO (multi-empresa / SaaS)
-- =====================================================================
-- Baseado no schema.sql da especificação original, com o acréscimo da
-- tabela de usuários (login por empresa/atendente) necessária para a
-- versão hospedada de verdade.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- EMPRESAS (tenants da plataforma)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            TEXT NOT NULL,
    segmento        TEXT,
    whatsapp_numero TEXT,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campos de identidade visual (tela Configurações → Aparência do painel):
-- cor principal dos botões/destaques nas páginas públicas de giftback e
-- indicação, logo da empresa (guardada como data URL) e Instagram exibido
-- no rodapé de confiança dessas páginas. Adicionados depois do lançamento
-- inicial — por isso via ALTER TABLE, e não direto na criação acima, para
-- que rodar esta migração num banco já existente (produção) só acrescente
-- as colunas novas sem apagar nada.
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cor_principal TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS instagram TEXT;

-- Status da empresa-cliente, controlado pelo Painel Master: 'ativa' (padrão),
-- 'bloqueada' (acesso suspenso — login da empresa passa a ser recusado, mas
-- nenhum dado é apagado ou alterado) ou 'desativada' (soft-delete — mesma
-- coisa, mas também some da lista padrão do Master). Nunca usar DELETE em
-- empresas por aqui. Via ALTER (não na criação da tabela) para não quebrar
-- bancos já em produção.
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativa';
ALTER TABLE empresas DROP CONSTRAINT IF EXISTS empresas_status_check;
ALTER TABLE empresas ADD CONSTRAINT empresas_status_check
    CHECK (status IN ('ativa', 'bloqueada', 'desativada'));

-- ---------------------------------------------------------------------
-- USUÁRIOS (login — cada usuário pertence a uma empresa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    senha_hash  TEXT NOT NULL,
    papel       TEXT NOT NULL DEFAULT 'atendente' CHECK (papel IN ('admin', 'atendente')),
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);

-- ---------------------------------------------------------------------
-- CLIENTES (por empresa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id        UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome              TEXT NOT NULL,
    telefone_whatsapp TEXT NOT NULL,
    email             TEXT,
    criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (empresa_id, telefone_whatsapp)
);
CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON clientes(empresa_id);

-- ---------------------------------------------------------------------
-- PRODUTOS (catálogo por empresa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id       UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome             TEXT NOT NULL,
    categoria        TEXT,
    valor_referencia NUMERIC(12,2),
    ativo            BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (empresa_id, nome)
);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos(empresa_id);

-- ---------------------------------------------------------------------
-- CAMPANHAS DE GIFTBACK
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campanhas_giftback (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id              UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo                  TEXT NOT NULL,
    produto_gatilho_id      UUID NOT NULL REFERENCES produtos(id),
    produto_alvo_id         UUID NOT NULL REFERENCES produtos(id),
    valor_giftback          NUMERIC(12,2) NOT NULL CHECK (valor_giftback >= 0),
    valor_minimo_compra     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (valor_minimo_compra >= 0),
    texto_mensagem          TEXT NOT NULL,
    regras_uso              TEXT NOT NULL DEFAULT '',
    mensagem_retorno        TEXT NOT NULL DEFAULT '',
    validade_dias           INTEGER NOT NULL CHECK (validade_dias > 0),
    permite_reenvio         BOOLEAN NOT NULL DEFAULT FALSE,
    intervalo_reenvio_dias  INTEGER,
    status                  TEXT NOT NULL DEFAULT 'ativa'
                                CHECK (status IN ('ativa', 'pausada', 'encerrada')),
    criado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (produto_gatilho_id <> produto_alvo_id),
    CHECK (
        (permite_reenvio = FALSE AND intervalo_reenvio_dias IS NULL)
        OR (permite_reenvio = TRUE AND intervalo_reenvio_dias > 0)
    )
);
CREATE INDEX IF NOT EXISTS idx_campanhas_empresa_gatilho
    ON campanhas_giftback(empresa_id, produto_gatilho_id)
    WHERE status = 'ativa';

-- ---------------------------------------------------------------------
-- COMPRAS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compras (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id  UUID NOT NULL REFERENCES clientes(id),
    produto_id  UUID NOT NULL REFERENCES produtos(id),
    valor       NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
    origem      TEXT NOT NULL DEFAULT 'compra_direta'
                    CHECK (origem IN ('compra_direta', 'conversao_giftback')),
    data        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_compras_cliente ON compras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_compras_cliente_produto ON compras(cliente_id, produto_id);

-- ---------------------------------------------------------------------
-- RELAÇÃO CLIENTE x PRODUTO (controle de conversão / não-canibalização)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente_produto (
    cliente_id         UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    produto_id         UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    origem             TEXT NOT NULL CHECK (origem IN ('compra_direta', 'conversao_giftback')),
    primeira_compra_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (cliente_id, produto_id)
);

-- ---------------------------------------------------------------------
-- ENVIOS DE GIFTBACK
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS envios_giftback (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id          UUID NOT NULL REFERENCES clientes(id),
    campanha_id         UUID NOT NULL REFERENCES campanhas_giftback(id),
    compra_origem_id    UUID NOT NULL REFERENCES compras(id),
    token_resgate       TEXT NOT NULL UNIQUE,
    link_whatsapp       TEXT NOT NULL,
    mensagem            TEXT NOT NULL DEFAULT '',
    status              TEXT NOT NULL DEFAULT 'enviado'
                            CHECK (status IN ('enviado', 'visualizado', 'confirmado', 'expirado', 'cancelado')),
    data_envio          TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_visualizacao   TIMESTAMPTZ,
    data_confirmacao    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_envios_cliente ON envios_giftback(cliente_id);
CREATE INDEX IF NOT EXISTS idx_envios_campanha_cliente ON envios_giftback(campanha_id, cliente_id);

-- ---------------------------------------------------------------------
-- VOUCHERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vouchers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    envio_id          UUID NOT NULL UNIQUE REFERENCES envios_giftback(id),
    codigo            TEXT NOT NULL UNIQUE,
    valor             NUMERIC(12,2) NOT NULL,
    produto_alvo_id   UUID NOT NULL REFERENCES produtos(id),
    emitido_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
    valido_ate        TIMESTAMPTZ NOT NULL,
    status            TEXT NOT NULL DEFAULT 'ativo'
                          CHECK (status IN ('ativo', 'utilizado', 'expirado')),
    data_utilizacao   TIMESTAMPTZ,
    compra_gerada_id  UUID REFERENCES compras(id)
);
CREATE INDEX IF NOT EXISTS idx_vouchers_status_validade ON vouchers(status, valido_ate);

-- =====================================================================
-- VIEW: campanhas elegíveis dado um cliente e um produto comprado
-- =====================================================================
-- Permite marcar produtos que o cliente já consumia antes de entrar no
-- sistema (importação de planilha), sem precisar de uma compra registrada.
-- Repetido a cada início do servidor (idempotente) para funcionar também em
-- bancos criados antes desta mudança.
ALTER TABLE cliente_produto DROP CONSTRAINT IF EXISTS cliente_produto_origem_check;
ALTER TABLE cliente_produto ADD CONSTRAINT cliente_produto_origem_check
    CHECK (origem IN ('compra_direta', 'conversao_giftback', 'importacao'));

-- ---------------------------------------------------------------------
-- PROGRAMA DE INDICAÇÕES
-- ---------------------------------------------------------------------
-- Campanha de indicação: define a meta de amigos indicados, o prêmio de
-- quem indica (texto livre) e o "mini-giftback" de boas-vindas de quem é
-- indicado (também texto livre), além das mensagens de convite e de
-- encaminhamento.
CREATE TABLE IF NOT EXISTS campanhas_indicacao (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo              TEXT NOT NULL,
    meta_indicacoes     INTEGER NOT NULL CHECK (meta_indicacoes > 0),
    premio_indicador    TEXT NOT NULL,
    premio_indicado     TEXT NOT NULL DEFAULT '',
    condicoes           TEXT NOT NULL DEFAULT '',
    texto_mensagem      TEXT NOT NULL,
    texto_encaminhar    TEXT NOT NULL,
    validade_dias       INTEGER NOT NULL CHECK (validade_dias > 0),
    status              TEXT NOT NULL DEFAULT 'ativa'
                            CHECK (status IN ('ativa', 'pausada', 'encerrada')),
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campind_empresa ON campanhas_indicacao(empresa_id);

-- Link pessoal de indicação: um por cliente-indicador dentro de cada
-- campanha (o mesmo link pode ser encaminhado por ele a vários amigos).
CREATE TABLE IF NOT EXISTS indicacoes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id              UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    campanha_id             UUID NOT NULL REFERENCES campanhas_indicacao(id),
    cliente_indicador_id    UUID NOT NULL REFERENCES clientes(id),
    token                   TEXT NOT NULL UNIQUE,
    link_whatsapp           TEXT NOT NULL,
    mensagem                TEXT NOT NULL DEFAULT '',
    status                  TEXT NOT NULL DEFAULT 'enviado'
                                CHECK (status IN ('enviado', 'visualizado', 'cancelado')),
    data_envio              TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_visualizacao       TIMESTAMPTZ,
    UNIQUE (campanha_id, cliente_indicador_id)
);
CREATE INDEX IF NOT EXISTS idx_indicacoes_campanha ON indicacoes(campanha_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_indicador ON indicacoes(cliente_indicador_id);

-- Marca quando o PRÓPRIO indicador confirmou participação (estágio A do link
-- público de indicação, distinto de "indicado confirmou" — tabela indicados
-- abaixo). Antes desse momento o link mostra as condições do indicador +
-- confirmação por últimos 4 dígitos do WhatsApp dele; depois de marcado, o
-- MESMO link passa a mostrar o formulário do amigo indicado (estágio B).
-- Coluna nova, adicionada via ALTER para não quebrar bancos já em produção.
ALTER TABLE indicacoes ADD COLUMN IF NOT EXISTS indicador_confirmado_em TIMESTAMPTZ;

-- Código curto de identificação do PRÓPRIO INDICADOR nesta campanha, gerado
-- no momento em que ele confirma participação (mesmo espírito do código de
-- voucher do amigo indicado, logo abaixo) — usado na tela "Resgate
-- Indicações" pra identificar rapidamente cada indicador. Nulo antes da
-- confirmação. Coluna nova, adicionada via ALTER pra não quebrar bancos já
-- em produção.
ALTER TABLE indicacoes ADD COLUMN IF NOT EXISTS codigo TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_indicacoes_codigo ON indicacoes(codigo) WHERE codigo IS NOT NULL;

-- Amigo indicado que confirmou pelo link — vira um cliente de verdade
-- (encontrado ou criado pelo WhatsApp) e fica ligado à indicação de origem.
CREATE TABLE IF NOT EXISTS indicados (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    indicacao_id        UUID NOT NULL REFERENCES indicacoes(id),
    cliente_id          UUID REFERENCES clientes(id),
    nome                TEXT NOT NULL,
    telefone_whatsapp   TEXT NOT NULL,
    data_confirmacao    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_indicados_indicacao ON indicados(indicacao_id);

-- Código do "voucher" do presente de boas-vindas do amigo indicado — igual
-- em espírito ao código dos vouchers de Giftback (tabela vouchers acima),
-- mas aqui é só um código de identificação (não tem valor/validade/status
-- próprios: o presente de boas-vindas é o texto livre premio_indicado da
-- campanha). Serve pro estabelecimento localizar o resgate quando o amigo
-- manda a mensagem de "Agendar agora" pelo WhatsApp. Coluna nova, adicionada
-- via ALTER pra não quebrar bancos já em produção; nula em confirmações
-- antigas, então a unicidade só vale quando preenchida.
ALTER TABLE indicados ADD COLUMN IF NOT EXISTS codigo TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_indicados_codigo ON indicados(codigo) WHERE codigo IS NOT NULL;

-- Resgate do prêmio do indicador ao bater a meta de indicações — mesma
-- lógica da "venda gerada" do Giftback (a atendente registra o valor real
-- da venda no momento em que o indicador vem buscar o prêmio).
CREATE TABLE IF NOT EXISTS resgates_indicacao (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    indicacao_id        UUID NOT NULL UNIQUE REFERENCES indicacoes(id),
    valor_venda_gerada  NUMERIC(12,2) NOT NULL CHECK (valor_venda_gerada >= 0),
    data_resgate        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW vw_campanhas_elegiveis AS
SELECT
    c.id            AS compra_id,
    c.cliente_id,
    c.produto_id    AS produto_gatilho_id,
    cg.id           AS campanha_id,
    cg.titulo,
    cg.produto_alvo_id,
    cg.valor_giftback,
    cg.valor_minimo_compra,
    cg.validade_dias
FROM compras c
JOIN campanhas_giftback cg
    ON cg.produto_gatilho_id = c.produto_id
   AND cg.empresa_id = c.empresa_id
   AND cg.status = 'ativa'
WHERE NOT EXISTS (
    SELECT 1 FROM cliente_produto cp
    WHERE cp.cliente_id = c.cliente_id
      AND cp.produto_id = cg.produto_alvo_id
)
AND NOT EXISTS (
    SELECT 1 FROM envios_giftback eg
    WHERE eg.cliente_id = c.cliente_id
      AND eg.campanha_id = cg.id
      AND eg.status <> 'cancelado'
      AND (
            cg.permite_reenvio = FALSE
            OR eg.data_envio > now() - (cg.intervalo_reenvio_dias || ' days')::interval
          )
);

-- =====================================================================
-- INTEGRAÇÃO OFICIAL WHATSAPP — Meta Cloud API / Embedded Signup
-- =====================================================================
-- Cada empresa (tenant) pode conectar seu próprio número do WhatsApp
-- Business Platform (Cloud API) à plataforma, via Embedded Signup oficial
-- da Meta. Isso é uma capacidade SEPARADA do envio manual por link wa.me já
-- existente (campanhas de Giftback/Indicação, coluna empresas.whatsapp_numero)
-- — aqui o envio é feito pelo backend diretamente via Graph API, com
-- credenciais próprias por empresa. v1 assume 1 conexão (1 WABA + 1 número)
-- por empresa — é o suficiente para o caso de uso atual; se algum dia for
-- preciso mais de um número por empresa, a UNIQUE(empresa_id) abaixo muda
-- para UNIQUE(empresa_id, phone_number_id).
--
-- Nunca guardamos token em texto puro: token_ciphertext guarda o resultado
-- cifrado (AES-256-GCM, ver backend/src/whatsapp/tokenCipher.js) no formato
-- "iv_hex:authTag_hex:ciphertext_hex", usando META_TOKEN_ENCRYPTION_KEY.
CREATE TABLE IF NOT EXISTS whatsapp_connections (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id                  UUID NOT NULL UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
    meta_business_id            TEXT,
    waba_id                     TEXT NOT NULL,
    phone_number_id             TEXT NOT NULL,
    display_phone_number        TEXT,
    verified_name               TEXT,
    -- nao_conectado (nunca existe linha nesse estado — é só o "vazio" do
    -- frontend) | conectado | conectado_com_pendencia | token_expirado |
    -- numero_restrito | erro | desconectado
    connection_status           TEXT NOT NULL DEFAULT 'conectado',
    number_status                TEXT,
    quality_rating              TEXT,
    code_verification_status    TEXT,
    token_ciphertext            TEXT,
    token_expires_at            TIMESTAMPTZ,
    scopes                      TEXT,
    webhook_status               TEXT NOT NULL DEFAULT 'pendente',
    connected_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_synced_at               TIMESTAMPTZ,
    disconnected_at              TIMESTAMPTZ,
    last_error_code              TEXT,
    last_error_message_sanitized TEXT,
    criado_em                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em                TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Impede duas empresas reivindicando o MESMO número real da Meta — o
-- phone_number_id é global (é o ID da Meta, não nosso). Índice parcial:
-- só vale enquanto a conexão está com status diferente de "desconectado",
-- porque depois de desconectar (soft — nunca apagamos a linha, ver
-- WhatsAppConnectionService.desconectar) o mesmo número pode ser
-- reconectado pela mesma empresa ou, futuramente, por outra.
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_connections_phone_ativo
    ON whatsapp_connections(phone_number_id) WHERE connection_status <> 'desconectado';
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_waba ON whatsapp_connections(waba_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_empresa ON whatsapp_connections(empresa_id);

-- Auditoria de conectar/reconectar/sincronizar/testar/desconectar — nunca
-- grava token ou segredo, só o resultado (detalhe_sanitizado já vem tratado
-- pelo service antes de chegar aqui).
CREATE TABLE IF NOT EXISTS whatsapp_connection_audit (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id          UUID REFERENCES usuarios(id),
    acao                TEXT NOT NULL,
    sucesso             BOOLEAN NOT NULL DEFAULT TRUE,
    detalhe_sanitizado  TEXT,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_audit_empresa ON whatsapp_connection_audit(empresa_id, criado_em DESC);

-- Mensagens enviadas via Cloud API (hoje: só a mensagem de teste da tela de
-- conexão; a estrutura já fica pronta para campanhas usarem no futuro —
-- ver comentário em backend/src/whatsapp/whatsappMessageService.js).
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id            UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    connection_id         UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
    wamid                 TEXT,
    destinatario          TEXT NOT NULL,
    tipo                  TEXT NOT NULL DEFAULT 'teste',
    template_nome         TEXT,
    template_idioma       TEXT,
    template_parametros   JSONB,
    origem                TEXT NOT NULL DEFAULT 'config-whatsapp-teste',
    origem_id             UUID,
    idempotency_key       TEXT,
    status                TEXT NOT NULL DEFAULT 'enviando',
    erro_codigo           TEXT,
    erro_mensagem         TEXT,
    criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_messages_wamid ON whatsapp_messages(wamid) WHERE wamid IS NOT NULL;
-- A idempotency_key é fornecida pelo chamador (querystring/idempotencyKey do
-- corpo da requisição) — precisa ser única só DENTRO de cada empresa, nunca
-- global entre tenants (duas empresas diferentes podem escolher, sem culpa,
-- a mesma chave "teste-1"; isso não pode virar um erro 500 cru pra uma delas
-- só porque a outra já usou aquele texto). Substitui o índice global antigo
-- por um composto (empresa_id, idempotency_key), coerente com o isolamento
-- multi-tenant usado no resto do projeto.
DROP INDEX IF EXISTS idx_whatsapp_messages_idempotency;
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_messages_idempotency_por_empresa ON whatsapp_messages(empresa_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_empresa ON whatsapp_messages(empresa_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_connection ON whatsapp_messages(connection_id);

-- Histórico de status por mensagem (sent/delivered/read/failed), um evento
-- por linha — vem do webhook. wamid é a chave de correlação com a Meta;
-- mensagem_id fica nulo quando o wamid ainda não corresponde a nenhuma
-- whatsapp_messages local (ex.: mensagem recebida do cliente, não enviada
-- por nós).
CREATE TABLE IF NOT EXISTS whatsapp_message_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensagem_id   UUID REFERENCES whatsapp_messages(id) ON DELETE CASCADE,
    wamid         TEXT NOT NULL,
    tipo_evento   TEXT NOT NULL,
    status        TEXT,
    de_telefone   TEXT,
    corpo_texto   TEXT,
    erro_codigo   TEXT,
    erro_mensagem TEXT,
    recebido_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_events_wamid ON whatsapp_message_events(wamid);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_events_mensagem ON whatsapp_message_events(mensagem_id);

-- Cache local dos templates aprovados de cada conexão — sincronizado sob
-- demanda (GET /{waba-id}/message_templates), usado para a campanha ou a
-- mensagem de teste escolherem um template válido sem perguntar direto pra
-- Meta a cada clique.
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id        UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    connection_id     UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
    meta_template_id  TEXT,
    nome              TEXT NOT NULL,
    idioma            TEXT NOT NULL,
    categoria         TEXT,
    status            TEXT,
    corpo             TEXT,
    sincronizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_templates_unico ON whatsapp_templates(connection_id, nome, idioma);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_empresa ON whatsapp_templates(empresa_id);

-- Log bruto de eventos de webhook recebidos — usado só para idempotência
-- (evento_hash é único: reprocessar o mesmo POST da Meta, comum em retries,
-- vira no-op) e diagnóstico de falha. Nunca guarda token/segredo — o corpo
-- do webhook da Meta não contém nenhum.
CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waba_id          TEXT,
    phone_number_id  TEXT,
    empresa_id       UUID REFERENCES empresas(id) ON DELETE SET NULL,
    campo            TEXT,
    evento_hash      TEXT NOT NULL,
    processado       BOOLEAN NOT NULL DEFAULT FALSE,
    erro_sanitizado  TEXT,
    recebido_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_hash ON whatsapp_webhook_events(evento_hash);
CREATE INDEX IF NOT EXISTS idx_whatsapp_webhook_events_waba ON whatsapp_webhook_events(waba_id);

-- ---------------------------------------------------------------------
-- INTEGRAÇÃO WAME (wame.api.br) — envio/recebimento de WhatsApp pelo número
-- da própria empresa, conectado por QR Code. Uma conexão por empresa.
-- A chave da instância fica cifrada (AES-256-GCM, mesma rotina do token da
-- Meta — ver backend/src/whatsapp/tokenCipher.js); chave_final guarda só os
-- 4 últimos caracteres, pra exibir na tela. segredo_webhook compõe o
-- endereço exclusivo que a WAME chama (/api/webhooks/wame/<segredo>).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wame_conexoes (
    empresa_id          UUID PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
    chave_cifrada       TEXT NOT NULL,
    chave_final         TEXT,
    segredo_webhook     TEXT NOT NULL UNIQUE,
    status              TEXT NOT NULL DEFAULT 'desconectado', -- conectado | desconectado | aguardando_qr | erro
    telefone            TEXT,
    nome_perfil         TEXT,
    webhook_configurado BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_erro         TEXT,
    ultimo_evento_em    TIMESTAMPTZ,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Toda mensagem enviada pela WAME (giftback, indicação, teste) e toda
-- mensagem recebida de clientes. wame_id é o id da mensagem no WhatsApp —
-- é por ele que os webhooks de status (enviada/entregue/lida/falhou) acham a
-- linha certa; o índice único também evita gravar duas vezes o mesmo
-- webhook reenviado.
CREATE TABLE IF NOT EXISTS wame_mensagens (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id         UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    direcao            TEXT NOT NULL,                 -- saida | entrada
    telefone           TEXT NOT NULL,
    nome_contato       TEXT,
    texto              TEXT,
    tipo               TEXT,
    wame_id            TEXT,
    status             TEXT NOT NULL,                 -- pendente | enviada | entregue | lida | falhou | recebida
    erro               TEXT,
    origem             TEXT,                          -- giftback | indicacao | teste | cliente
    envio_giftback_id  UUID REFERENCES envios_giftback(id) ON DELETE SET NULL,
    indicacao_id       UUID REFERENCES indicacoes(id) ON DELETE SET NULL,
    criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wame_mensagens_wame_id ON wame_mensagens(empresa_id, wame_id) WHERE wame_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wame_mensagens_empresa ON wame_mensagens(empresa_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_wame_mensagens_giftback ON wame_mensagens(envio_giftback_id);
