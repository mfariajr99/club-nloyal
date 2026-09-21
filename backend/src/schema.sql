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
