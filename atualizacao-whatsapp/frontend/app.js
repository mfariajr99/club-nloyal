(function(){
  "use strict";

  // Reaproveita a mesma imagem do logo já embutida na barra lateral (evita
  // duplicar o base64 do logo aqui) para exibir também nas páginas públicas.
  var LOGO_SRC = (document.querySelector(".brand-logo")||{}).src || "";
  var LOGO_TAG = LOGO_SRC ? '<img class="redeem-logo" src="'+LOGO_SRC+'" alt="Club’n Loyal">' : "";
  // Logo em branco — usada só na tela de login (fundo sempre escuro ali).
  // O estilo inline tem mais prioridade que o filtro definido em .redeem-logo.
  var LOGO_TAG_LOGIN = LOGO_SRC ? '<img class="redeem-logo" style="filter:brightness(0) invert(1);" src="'+LOGO_SRC+'" alt="Club’n Loyal">' : "";

  // ---------------------------------------------------------------------
  // Ícones (SVG inline, sem dependências)
  // ---------------------------------------------------------------------
  const ICONS = {
    dashboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    clientes: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    produtos: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    campanhas: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z"/></svg>',
    compra: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    whatsapp: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.19c-.24.68-1.4 1.3-1.93 1.37-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.6-.14.24.09 1.53.72 1.79.86.26.13.43.19.5.3.07.11.07.62-.17 1.3Z"/></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    gift: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2V7Zm10 0V4a2.5 2.5 0 0 0-5 0c0 1.5 2.5 3 2.5 3Zm0 0V4a2.5 2.5 0 0 1 5 0c0 1.5-2.5 3-2.5 3"/></svg>',
    giftnav: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2V7Zm10 0V4a2.5 2.5 0 0 0-5 0c0 1.5 2.5 3 2.5 3Zm0 0V4a2.5 2.5 0 0 1 5 0c0 1.5-2.5 3-2.5 3"/></svg>',
    upload: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    indicacoes: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    controleIndicacoes: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    logout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    search: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    config: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
    empresa: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>',
    aparencia: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-5.5-4.5-10-9-10Z"/></svg>',
    // Selo de "empresa verificada" — sempre azul fixo (não segue a cor da
    // marca), para transmitir confiança nas telas públicas de resgate/indicação.
    verificado: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#2b6fb0" stroke="#2b6fb0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4" stroke="#fff" stroke-width="2" fill="none"/></svg>',
    instagram: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c0396b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="0.6" fill="#c0396b" stroke="none"/></svg>',
    relogio: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    // Ícones da tela Configurações → Conexão WhatsApp.
    sync: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M3 21v-5h5"/><path d="M21 3v5h-5"/></svg>',
    alerta: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    plugue: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9.5 14.5 2l-2.12 2.12 1.06 1.06-3.54 3.54-1.06-1.06L6.72 9.78l1.06 1.06L4.24 14.38a3 3 0 0 0 0 4.24l.71.71 6-6 .71.71-6 6 .71.71a3 3 0 0 0 4.24 0l3.54-3.54 1.06 1.06 2.12-2.12-1.06-1.06 3.54-3.54 1.06 1.06L22 9.5Z"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  };

  // NAV mistura itens diretos (com "id") e categorias com sub-itens (com
  // "group" + "items") — renderNav() sabe desenhar os dois.
  const NAV = [
    { id: "dashboard", label: "Painel", icon: "dashboard" },
    { id: "clientes", label: "Clientes", icon: "clientes" },
    { id: "produtos", label: "Produtos", icon: "produtos" },
    { group: "Vendas", icon: "compra", items: [
      { id: "vendas-nova", label: "Nova Venda", icon: "plus" },
      { id: "vendas-consultar", label: "Consultar Vendas", icon: "search" },
    ] },
    { group: "Campanhas", icon: "campanhas", items: [
      { id: "campanhas-criar", label: "Campanha Giftback", icon: "plus" },
      { id: "campanhas-consultar", label: "Consultar Giftback", icon: "search" },
      { id: "indicacoes-criar", label: "Criar Indicação", icon: "plus" },
      { id: "indicacoes-consultar", label: "Consultar Indicação", icon: "search" },
    ] },
    { group: "Giftback", icon: "giftnav", items: [
      { id: "giftback-elegiveis", label: "Giftbacks Elegíveis", icon: "search" },
      { id: "giftback-controle", label: "Controle Giftback", icon: "search" },
    ] },
    { group: "Indicações", icon: "controleIndicacoes", items: [
      { id: "indicacoes-lista", label: "Lista de Indicados", icon: "search" },
      { id: "indicacoes-resgate", label: "Resgate Indicações", icon: "search" },
    ] },
    { group: "Configurações", icon: "config", items: [
      { id: "config-empresa", label: "Dados da empresa", icon: "empresa" },
      { id: "config-aparencia", label: "Aparência", icon: "aparencia" },
      // "Conexão WhatsApp" agora abre a integração pela WAME (config-wame).
      // A tela da integração oficial da Meta (config-whatsapp) continua no
      // código e acessível pelo endereço #/config-whatsapp, mas saiu do menu
      // enquanto a Meta não libera o app para conectar clientes.
      { id: "config-wame", label: "Conexão WhatsApp", icon: "whatsapp" },
    ] },
  ];

  // ---------------------------------------------------------------------
  // Estado local — agora um espelho do que a API REST devolve (sem nenhuma
  // gravação/leitura direta em banco; toda mutação passa por api()/apiUpload()
  // e o estado é atualizado com um refetch via carregarTudo()).
  // ---------------------------------------------------------------------
  const state = {
    clientes: {}, produtos: {}, campanhas: {}, compras: {},
    envios: {}, vouchers: {}, config: {},
    campanhasIndicacao: {},
    usuario: null,
    ready: false,
  };
  function configEmpresa(){ return state.config.empresa || {}; }
  function corPrincipalAtual(){ return (configEmpresa().corPrincipal || "#7c3aed").trim(); }
  function logoUrlAtual(){ return configEmpresa().logoUrl || ""; }
  // Mostra a logo cadastrada (Configurações → Aparência) como foto de perfil
  // no chip do usuário, no canto superior direito do painel interno. Sem
  // logo cadastrada, mostra as iniciais do usuário logado.
  function iniciaisUsuario(){
    const nome = (state.usuario && state.usuario.nome) || "";
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "MC";
    return (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
  }
  function atualizarAvatarUsuario(){
    const el = document.getElementById("user-avatar");
    if (!el) return;
    const logo = logoUrlAtual();
    if (logo) el.innerHTML = '<img src="'+esc(logo)+'" alt="Logo">';
    else el.textContent = iniciaisUsuario();
  }
  // redeemWrapAttr()/rodapeConfiancaHtml() aceitam um `empresa` explícito —
  // usado nas páginas públicas de resgate/indicação, que não têm (nem devem
  // ter) acesso ao estado do painel administrativo logado. Sem argumento,
  // caem no estado global (usado só na pré-visualização de Aparência).
  function redeemWrapAttr(empresa){
    const cfg = empresa || configEmpresa();
    return ' style="--navy:'+esc(((cfg.corPrincipal||"#7c3aed")).trim())+';"';
  }
  // Aceita link completo ou @handle e sempre devolve uma URL utilizável.
  function normalizarLinkInstagram(v){
    v = (v||"").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return "https://instagram.com/" + v.replace(/^@/, "");
  }
  // Rodapé de confiança (selo "empresa verificada" + nome/logo, e o convite
  // para seguir no Instagram quando cadastrado) — aparece em toda tela
  // pública de interação com o cliente (resgate de giftback e indicação),
  // para reforçar que aquele link/mensagem é legítimo e não um golpe.
  function construirRodapeConfianca(nome, logoUrl, instagram){
    const nomeSeguro = nome || "Estabelecimento";
    const instaUrl = normalizarLinkInstagram(instagram);
    return (
      '<div class="trust-badge">' +
        (logoUrl
          ? '<img class="trust-badge-logo" src="'+esc(logoUrl)+'" alt="Logo">'
          : '<span class="trust-badge-avatar">'+esc(nomeSeguro.slice(0,1).toUpperCase())+'</span>') +
        '<div class="trust-badge-info">' +
          '<div class="trust-badge-nome">' + esc(nomeSeguro) + ' ' + ICONS.verificado + '</div>' +
          '<div class="trust-badge-selo">Empresa verificada</div>' +
        '</div>' +
      '</div>' +
      (instaUrl
        ? '<a class="instagram-cta" href="'+esc(instaUrl)+'" target="_blank" rel="noopener">' + ICONS.instagram +
            '<span>Já segue nosso perfil no Instagram? Siga e fique por dentro</span>' +
          '</a>'
        : '')
    );
  }
  function rodapeConfiancaHtml(empresa){
    const cfg = empresa || configEmpresa();
    return construirRodapeConfianca(cfg.nomeEmpresa || cfg.nome, cfg.logoUrl, cfg.instagram);
  }
  let toastTimer = null;

  // ---------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------
  function reais(v){
    return (Number(v)||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  }
  function dataBR(iso){
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'});
  }
  function dataHoraBR(iso){
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  }
  function addDias(iso, dias){
    const d = new Date(iso);
    d.setDate(d.getDate() + Number(dias));
    return d.toISOString();
  }
  function isoDiasAtras(n){
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  // ---------------------------------------------------------------------
  // Cronômetro regressivo (usado nas páginas públicas de resgate/indicação)
  // ---------------------------------------------------------------------
  function cronometroBlocoHtml(rotulo){
    return '<div class="cronometro-bloco"><span class="cronometro-valor" data-unidade="'+rotulo[0]+'">--</span><span class="cronometro-rotulo">'+rotulo+'</span></div>';
  }
  function cronometroHtml(targetIso, texto){
    return '<div class="cronometro" id="cronometro-timer" data-target="'+esc(targetIso||"")+'">' +
      '<div class="cronometro-topo">' + ICONS.relogio + '<span>' + esc(texto||"Tempo restante") + '</span></div>' +
      '<div class="cronometro-blocos">' +
        cronometroBlocoHtml("dias") + cronometroBlocoHtml("horas") + cronometroBlocoHtml("min") + cronometroBlocoHtml("seg") +
      '</div>' +
    '</div>';
  }
  function ligarCronometro(){
    const el = document.getElementById("cronometro-timer");
    if (!el) return;
    const alvo = new Date(el.getAttribute("data-target")).getTime();
    if (!alvo || isNaN(alvo)) return;
    (function tick(){
      const elAtual = document.getElementById("cronometro-timer");
      if (!elAtual) return; // usuário navegou para outra tela — encerra o loop
      const restante = alvo - Date.now();
      if (restante <= 0){
        elAtual.innerHTML = '<div class="cronometro-topo cronometro-expirado">' + ICONS.relogio + '<span>Prazo encerrado</span></div>';
        return;
      }
      const totalSeg = Math.floor(restante/1000);
      const dias = Math.floor(totalSeg/86400);
      const horas = Math.floor((totalSeg%86400)/3600);
      const minutos = Math.floor((totalSeg%3600)/60);
      const segundos = totalSeg%60;
      const pad = n => String(n).padStart(2,'0');
      const vD = elAtual.querySelector('[data-unidade="d"]');
      const vH = elAtual.querySelector('[data-unidade="h"]');
      const vM = elAtual.querySelector('[data-unidade="m"]');
      const vS = elAtual.querySelector('[data-unidade="s"]');
      if (vD) vD.textContent = pad(dias);
      if (vH) vH.textContent = pad(horas);
      if (vM) vM.textContent = pad(minutos);
      if (vS) vS.textContent = pad(segundos);
      setTimeout(tick, 1000);
    })();
  }
  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function primeiroNome(nome){
    return String(nome||"").trim().split(/\s+/)[0] || nome;
  }
  function telefoneWa(tel){
    return String(tel||"").replace(/\D/g, "");
  }
  function last4(tel){
    return telefoneWa(tel).slice(-4);
  }
  function toast(msg, tipo){
    let el = document.getElementById("toast");
    if (!el){
      el = document.createElement("div");
      el.id = "toast";
      el.style.cssText = "position:fixed; bottom:22px; left:50%; transform:translateX(-50%); z-index:999; padding:11px 18px; border-radius:10px; font-size:13px; font-weight:700; box-shadow:var(--shadow); transition:opacity .2s;";
      document.body.appendChild(el);
    }
    el.style.background = tipo === 'erro' ? 'var(--danger)' : 'var(--accent-dark)';
    el.style.color = '#fff';
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ el.style.opacity = '0'; }, 2800);
  }
  // ---------------------------------------------------------------------
  // Modal genérico (popup de confirmação) — usado no envio de Giftback
  // ---------------------------------------------------------------------
  function abrirModal(innerHtml){
    fecharModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modal-overlay-ativo";
    overlay.innerHTML = '<div class="modal-card">' + innerHtml + '</div>';
    overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) fecharModal(); });
    document.addEventListener("keydown", fecharModalNoEsc);
    document.body.appendChild(overlay);
    return overlay;
  }
  function fecharModalNoEsc(e){ if (e.key === "Escape") fecharModal(); }
  function fecharModal(){
    const existente = document.getElementById("modal-overlay-ativo");
    if (existente) existente.remove();
    document.removeEventListener("keydown", fecharModalNoEsc);
  }
  function copiar(texto){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(texto).then(()=>toast("Copiado para a área de transferência.")).catch(()=>toast("Não foi possível copiar.", 'erro'));
    } else {
      toast("Copie manualmente: " + texto);
    }
  }
  function mensagemErro(err, fallback){
    return (err && err.message) || fallback || "Algo deu errado.";
  }
  function linkPublico(rota){
    return location.origin + location.pathname + "#/" + rota;
  }

  // Preview local (sem tocar a API) da mensagem de giftback, usado só para
  // alimentar a bolha de preview estilo WhatsApp enquanto a atendente digita
  // o template — o envio de verdade é feito pelo backend (POST /campanhas/:id/enviar),
  // que gera o token, monta a mensagem definitiva e grava o envio.
  function previewMensagemGiftback(campanha, cliente){
    const vars = {
      nome_cliente: primeiroNome(cliente.nome),
      produto_gatilho: (state.produtos[campanha.produtoGatilhoId]||{}).nome || "",
      produto_alvo: (state.produtos[campanha.produtoAlvoId]||{}).nome || "",
      valor_giftback: reais(campanha.valor),
      validade_dias: String(campanha.validadeDias),
      link_resgate: linkPublico("resgate/pendente"),
    };
    let msg = campanha.mensagem || "";
    Object.keys(vars).forEach(k => { msg = msg.split("{{"+k+"}}").join(vars[k]); });
    return msg;
  }

  // ---------------------------------------------------------------------
  // Cliente HTTP da API (anexa o token, trata 401 caindo para o login) —
  // toda leitura/gravação do painel passa por aqui, nunca por um "state"
  // fake local: substitui salvar()/atualizar()/assinar() do protótipo.
  // ---------------------------------------------------------------------
  async function api(path, opts){
    opts = opts || {};
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const tokenSalvo = localStorage.getItem("gb_token");
    if (tokenSalvo) headers.Authorization = "Bearer " + tokenSalvo;
    const resp = await fetch("/api" + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await resp.json(); } catch(e){ data = null; }
    if (resp.status === 401){
      localStorage.removeItem("gb_token");
      localStorage.removeItem("gb_role");
      state.ready = false;
      renderLogin("Sua sessão expirou. Faça login novamente.");
      const err = new Error("Não autenticado");
      err.status = 401;
      throw err;
    }
    // Conta bloqueada/desativada pelo Painel Master enquanto a empresa já
    // estava logada: requireAuth passa a recusar toda rota autenticada com
    // 403 — derruba a sessão na hora, igual ao 401 acima (o próprio Master
    // nunca recebe este 403, só o login de uma empresa normal).
    if (resp.status === 403 && localStorage.getItem("gb_role") !== "master"){
      localStorage.removeItem("gb_token");
      localStorage.removeItem("gb_role");
      state.ready = false;
      renderLogin((data && data.erro) || "Acesso não autorizado.");
      const err = new Error((data && data.erro) || "Acesso não autorizado.");
      err.status = 403;
      throw err;
    }
    if (!resp.ok){
      const err = new Error((data && data.erro) || "Erro inesperado.");
      err.status = resp.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  // Igual à api(), mas para enviar um arquivo (multipart/form-data) — usado
  // na importação de planilhas de clientes e produtos (o parsing acontece no
  // servidor, não mais no navegador).
  async function apiUpload(path, arquivo){
    const headers = {};
    const tokenSalvo = localStorage.getItem("gb_token");
    if (tokenSalvo) headers.Authorization = "Bearer " + tokenSalvo;
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    const resp = await fetch("/api" + path, { method: "POST", headers, body: fd });
    let data = null;
    try { data = await resp.json(); } catch(e){ data = null; }
    if (resp.status === 401){
      localStorage.removeItem("gb_token");
      localStorage.removeItem("gb_role");
      state.ready = false;
      renderLogin("Sua sessão expirou. Faça login novamente.");
      const err = new Error("Não autenticado");
      err.status = 401;
      throw err;
    }
    if (!resp.ok){
      const err = new Error((data && data.erro) || "Erro inesperado.");
      err.status = resp.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  function porId(lista){
    const obj = {};
    lista.forEach(item => { obj[item.id] = item; });
    return obj;
  }

  // Recarrega todo o estado do painel a partir da API — chamado no boot e
  // depois de qualquer ação que grave no banco (substitui o onSnapshot em
  // tempo real do protótipo por um refetch explícito, igual ao restante da
  // integração real com este backend).
  async function carregarTudo(){
    const [clientes, produtos, campanhas, compras, envios, vouchers, empresa, campanhasIndicacao] = await Promise.all([
      api("/clientes"), api("/produtos"), api("/campanhas"), api("/compras"),
      api("/envios"), api("/vouchers"), api("/config/empresa"), api("/indicacoes/campanhas"),
    ]);
    state.clientes = porId(clientes);
    state.produtos = porId(produtos);
    state.campanhas = porId(campanhas);
    state.compras = porId(compras);
    state.envios = porId(envios);
    state.vouchers = {};
    vouchers.forEach(v => { state.vouchers[v.id] = v; }); // v.id == envioId (ver mapVoucher no backend)
    state.config = { empresa };
    state.campanhasIndicacao = porId(campanhasIndicacao);
    // Status da integração WAME — decide se os botões de envio mandam a
    // mensagem sozinhos pelo servidor ou abrem o link wa.me. Fica fora do
    // Promise.all de propósito: se esta consulta falhar, o resto do painel
    // carrega normalmente (só volta ao envio manual).
    state.wame = await api("/config/wame").catch(() => null);
    state.ready = true;
  }

  // ---------------------------------------------------------------------
  // Roteamento
  // ---------------------------------------------------------------------
  function rotaAtual(){
    const h = location.hash.replace(/^#\/?/, "");
    const partes = h.split("/").filter(Boolean);
    return { nome: partes[0] || "dashboard", params: partes.slice(1) };
  }
  window.addEventListener("hashchange", render);
  // Navegar pra rota em que já se está não dispara "hashchange" (o hash não
  // muda), então o painel ficava com dado velho — ex.: sair de "Resgate
  // Indicações", um amigo confirmar em outra aba, e voltar clicando de novo
  // no mesmo item do menu não atualizava nada. Força o re-render manualmente
  // nesse caso, pra sempre refletir o estado mais recente do servidor.
  function ir(rota){
    const novoHash = "#/" + rota;
    if (location.hash === novoHash) render();
    else location.hash = novoHash;
  }

  // ---------------------------------------------------------------------
  // Render — shell (sidebar + cabeçalho + roteador de página)
  // ---------------------------------------------------------------------
  // Menu lateral em modo gaveta (mobile): abre/fecha via hambúrguer no
  // cabeçalho, via clique no fundo escurecido, ou ao navegar para uma rota.
  function abrirMenuMobile(){
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    // Trava o scroll do conteúdo por trás enquanto a gaveta do menu está
    // aberta no mobile — sem isso, um arraste sobre o fundo escurecido
    // rolava a página por baixo do menu, o que é confuso no toque.
    document.body.classList.add("menu-mobile-aberto");
  }
  function fecharMenuMobile(){
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    document.body.classList.remove("menu-mobile-aberto");
  }

  let navGruposAbertos = new Set();
  function grupoDaRota(rotaNome){
    const entrada = NAV.find(e => e.items && e.items.some(i => i.id === rotaNome));
    return entrada ? entrada.group : null;
  }
  function renderNav(rotaNome){
    const grupoAtivo = grupoDaRota(rotaNome);
    if (grupoAtivo) navGruposAbertos.add(grupoAtivo);
    const nav = document.getElementById("nav");
    nav.innerHTML = NAV.map(entrada => {
      if (entrada.items){
        const aberto = navGruposAbertos.has(entrada.group);
        return '<div class="nav-group">' +
          '<button class="navitem" data-toggle-grupo="' + entrada.group + '">' +
            ICONS[entrada.icon] + '<span class="navlabel">' + entrada.group + '</span>' +
            '<svg class="chev' + (aberto?' open':'') + '" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="nav-subitems' + (aberto?' open':'') + '">' +
            entrada.items.map(item => (
              '<button class="nav-subitem ' + (item.id===rotaNome?'active':'') + '" data-go="' + item.id + '">' +
                (item.icon ? ICONS[item.icon] : '') + '<span class="navlabel">' + item.label + '</span>' +
              '</button>'
            )).join("") +
          '</div>' +
        '</div>';
      }
      return '<button class="navitem ' + (entrada.id===rotaNome?'active':'') + '" data-go="' + entrada.id + '">' +
        ICONS[entrada.icon] + '<span class="navlabel">' + entrada.label + '</span>' +
      '</button>';
    }).join("");
    nav.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", () => { ir(btn.getAttribute("data-go")); fecharMenuMobile(); });
    });
    nav.querySelectorAll("[data-toggle-grupo]").forEach(btn => {
      btn.addEventListener("click", () => {
        const g = btn.getAttribute("data-toggle-grupo");
        if (navGruposAbertos.has(g)) navGruposAbertos.delete(g); else navGruposAbertos.add(g);
        renderNav(rotaAtual().nome);
      });
    });
  }

  // Título/descrição do cabeçalho de topo (navy) + slot opcional para o botão
  // de ação da página — chamado no início de cada função renderXxx(main).
  function setHeader(title, desc, actionsHtml){
    const t = document.getElementById("header-title");
    const d = document.getElementById("header-desc");
    const a = document.getElementById("header-actions");
    if (t) t.textContent = title || "";
    if (d) d.textContent = desc || "";
    if (a) a.innerHTML = actionsHtml || "";
  }

  // ---------------------------------------------------------------------
  // Autenticação — login/cadastro de empresa (tenant) no visual escuro do
  // painel (reaproveita .redeem-wrap/.redeem-card das telas públicas em vez
  // de importar o layout claro do frontend antigo).
  // ---------------------------------------------------------------------
  function esconderShellInterno(){
    const sidebar = document.querySelector(".sidebar");
    const topheader = document.querySelector(".topheader");
    if (sidebar) sidebar.style.display = "none";
    if (topheader) topheader.style.display = "none";
  }
  function mostrarShellInterno(){
    const sidebar = document.querySelector(".sidebar");
    const topheader = document.querySelector(".topheader");
    if (sidebar) sidebar.style.display = "";
    if (topheader) topheader.style.display = "";
  }
  function telaAuthShell(innerHtml){
    return '<div class="redeem-wrap"><div class="redeem-card" style="text-align:left;">' + innerHtml + '</div></div>';
  }
  function renderLogin(avisoInicial){
    esconderShellInterno();
    const main = document.getElementById("main");
    main.style.padding = "0";
    main.innerHTML = telaAuthShell(
      (LOGO_TAG_LOGIN
        ? '<div style="text-align:center; margin:0 0 18px;">' + LOGO_TAG_LOGIN + '</div>'
        : '<div class="redeem-badge" style="margin:0 0 16px;">' + ICONS.gift + '</div>') +
      '<div class="redeem-title" style="text-align:left;">Plataforma Club\'n Loyal</div>' +
      '<p class="muted" style="font-size:13px; margin:0 0 16px;">Acesse com o e-mail e senha da sua empresa.</p>' +
      (avisoInicial ? '<div class="auth-error">'+esc(avisoInicial)+'</div>' : '') +
      '<form id="form-login" class="form-grid" style="grid-template-columns:1fr;">' +
        // type="text" (não "email") de propósito: o login do Painel Master
        // ("mlf") não é um e-mail válido e um <input type="email" required>
        // bloquearia o envio do formulário pela validação nativa do
        // navegador antes mesmo do submit disparar.
        '<div class="field"><label>E-mail</label><input type="text" inputmode="email" autocomplete="username" name="email" required placeholder="voce@empresa.com"></div>' +
        '<div class="field"><label>Senha</label><input type="password" name="senha" required placeholder="••••••••"></div>' +
        '<div id="erro-login" class="auth-error" style="display:none;"></div>' +
        '<button class="btn btn-primary" type="submit" style="justify-content:center; padding:11px;">Entrar</button>' +
      '</form>'
    );
    document.getElementById("form-login").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const email = String(fd.get("email")||"").trim();
      const senha = fd.get("senha");
      const erroEl = document.getElementById("erro-login");
      erroEl.style.display = "none";
      // Não existe uma tela de login separada para o Painel Master — o dono
      // do produto simplesmente digita o login master ("mlf") no mesmo campo
      // de e-mail. Detectado isso, tentamos o login master em vez do login
      // normal por empresa (endpoints e formatos de token são diferentes).
      if (email === "mlf"){
        try {
          const resp = await apiPublica("/master/login", { method:"POST", body:{ login: email, senha } });
          localStorage.setItem("gb_token", resp.token);
          localStorage.setItem("gb_role", "master");
          await iniciarAppMaster();
        } catch(err){
          erroEl.textContent = mensagemErro(err, "Não foi possível entrar.");
          erroEl.style.display = "block";
        }
        return;
      }
      try {
        const resp = await api("/auth/login", { method:"POST", body:{ email, senha } });
        localStorage.setItem("gb_token", resp.token);
        localStorage.removeItem("gb_role");
        state.usuario = resp.usuario;
        await iniciarApp();
      } catch(err){
        erroEl.textContent = mensagemErro(err, "Não foi possível entrar.");
        erroEl.style.display = "block";
      }
    });
  }
  // Cadastro de empresa (tenant) — não é mais alcançável publicamente pela
  // tela de login (decisão do produto: sem auto-cadastro). A função fica
  // guardada aqui só como referência do formulário; o Painel Master usa seu
  // próprio modal (abrirModalMasterAddEmpresa), porque o contrato da criação
  // pelo Master é diferente (não loga como a empresa nova) — ver routes/master.js.
  function renderSignup(){
    esconderShellInterno();
    const main = document.getElementById("main");
    main.style.padding = "0";
    main.innerHTML = telaAuthShell(
      '<div class="redeem-badge" style="margin:0 0 16px;">' + ICONS.gift + '</div>' +
      '<div class="redeem-title" style="text-align:left;">Cadastrar sua empresa</div>' +
      '<p class="muted" style="font-size:13px; margin:0 0 16px;">Cria a conta da sua empresa e o seu login de administrador.</p>' +
      '<form id="form-signup" class="form-grid" style="grid-template-columns:1fr;">' +
        '<div class="field"><label>Nome da empresa</label><input type="text" name="nomeEmpresa" required placeholder="Ex.: Clínica Bella Estética"></div>' +
        '<div class="field"><label>Seu nome</label><input type="text" name="nomeAdmin" required placeholder="Seu nome"></div>' +
        '<div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="voce@empresa.com"></div>' +
        '<div class="field"><label>Senha (mín. 6 caracteres)</label><input type="password" name="senha" required minlength="6" placeholder="••••••••"></div>' +
        '<div id="erro-signup" class="auth-error" style="display:none;"></div>' +
        '<button class="btn btn-primary" type="submit" style="justify-content:center; padding:11px;">Criar conta</button>' +
      '</form>' +
      '<div class="auth-switch" style="margin-top:14px; font-size:12.5px; color:var(--text-muted);">Já tem uma conta? <button id="ir-login" type="button" style="background:none; border:none; color:var(--navy); font-weight:700; cursor:pointer; padding:0;">Entrar</button></div>'
    );
    document.getElementById("ir-login").addEventListener("click", ()=>renderLogin());
    document.getElementById("form-signup").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const erroEl = document.getElementById("erro-signup");
      erroEl.style.display = "none";
      try {
        const resp = await api("/auth/registrar-empresa", { method:"POST", body:{
          nomeEmpresa: fd.get("nomeEmpresa"), nomeAdmin: fd.get("nomeAdmin"),
          email: fd.get("email"), senha: fd.get("senha"),
        }});
        localStorage.setItem("gb_token", resp.token);
        state.usuario = resp.usuario;
        toast("Empresa criada! Cadastre seus produtos e clientes para começar.");
        await iniciarApp();
      } catch(err){
        erroEl.textContent = mensagemErro(err, "Não foi possível criar a conta.");
        erroEl.style.display = "block";
      }
    });
  }
  // Um único listener estável no botão de sair, que decide em tempo de
  // clique se a sessão atual é de uma empresa normal ou do Painel Master —
  // evita ter que reamarrar o listener toda vez que troca de modo.
  function logoutQualquer(){
    if (localStorage.getItem("gb_role") === "master") logoutMaster();
    else logout();
  }
  function logout(){
    localStorage.removeItem("gb_token");
    localStorage.removeItem("gb_role");
    state.ready = false;
    state.usuario = null;
    state.config = {};
    location.hash = "#/dashboard";
    renderLogin();
  }
  function logoutMaster(){
    localStorage.removeItem("gb_token");
    localStorage.removeItem("gb_role");
    masterEmpresas = [];
    location.hash = "#/dashboard";
    renderLogin();
  }
  function ligarBotaoLogout(){
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout && !btnLogout.dataset.ligado){
      btnLogout.dataset.ligado = "1";
      btnLogout.addEventListener("click", logoutQualquer);
    }
  }
  async function iniciarApp(){
    mostrarShellInterno();
    document.getElementById("main").style.padding = "";
    try {
      await carregarTudo();
    } catch(err){
      if (err.status === 401) return; // já tratado pelo api()
      toast(mensagemErro(err, "Não foi possível carregar os dados."), "erro");
      return;
    }
    const rodape = document.getElementById("sidebar-foot");
    if (rodape){
      rodape.innerHTML =
        '<div style="margin-bottom:2px;">Logado como <strong style="color:#fff;">' + esc(state.usuario.nome) + '</strong></div>' +
        '<div>' + esc((state.config.empresa||{}).nomeEmpresa || "") + '</div>';
    }
    const nomeEl = document.getElementById("user-name");
    const papelEl = document.getElementById("user-role");
    if (nomeEl) nomeEl.textContent = state.usuario.nome;
    if (papelEl) papelEl.textContent = state.usuario.papel === "admin" ? "Administrador" : (state.usuario.papel || "");
    ligarBotaoLogout();
    if (!location.hash || rotaAtual().nome === "resgate" || rotaAtual().nome === "indicacao") location.hash = "#/dashboard";
    render();
  }

  // ---------------------------------------------------------------------
  // Painel Master — super-admin cross-tenant (ver routes/master.js). Login
  // é feito pelo MESMO formulário de login normal (submit acima detecta
  // login==="mlf"); daqui pra frente o modo master é sinalizado por
  // localStorage["gb_role"]==="master" e usa sua própria navegação/telas,
  // mas reaproveita o mesmo shell (sidebar/topheader) e classes de CSS.
  // ---------------------------------------------------------------------
  let masterEmpresas = [];
  let masterEmpresaAtual = null; // último detalhe carregado por renderMasterEmpresaDetalhe
  let masterMostrarDesativadas = false;
  function empresaMasterPorId(id){
    if (masterEmpresaAtual && masterEmpresaAtual.id === id) return masterEmpresaAtual;
    return masterEmpresas.find(e => e.id === id) || null;
  }
  // Status da empresa-cliente, controlado pelo Painel Master: 'ativa'
  // (padrão, inclusive para empresas antigas sem o campo), 'bloqueada'
  // (acesso suspenso na hora — ver requireAuth/api() — dados intactos) ou
  // 'desativada' (soft-delete: nunca apaga nada, só some da lista padrão).
  function statusEmpresa(e){ return (e && e.status) || 'ativa'; }
  function badgeStatusEmpresa(status){
    const labels = { ativa:"Ativa", bloqueada:"Bloqueada", desativada:"Desativada" };
    const classe = status === 'bloqueada' ? 'b-expirado' : status === 'desativada' ? 'b-cancelado' : 'b-ativo';
    return '<span class="badge '+classe+'">'+(labels[status]||status)+'</span>';
  }
  async function iniciarAppMaster(){
    mostrarShellInterno();
    document.getElementById("main").style.padding = "";
    const rodape = document.getElementById("sidebar-foot");
    if (rodape) rodape.innerHTML = '<div style="margin-bottom:2px;">Logado como <strong style="color:#fff;">Master</strong></div><div>Painel administrativo Club\'n Loyal</div>';
    const nomeEl = document.getElementById("user-name");
    const papelEl = document.getElementById("user-role");
    const avatarEl = document.getElementById("user-avatar");
    if (nomeEl) nomeEl.textContent = "Master";
    if (papelEl) papelEl.textContent = "Super-admin";
    if (avatarEl) avatarEl.innerHTML = "MX";
    ligarBotaoLogout();
    if (!location.hash || rotaAtual().nome !== "master") location.hash = "#/master";
    render();
  }
  // Itens do menu lateral quando o Master está "dentro" de uma empresa
  // (rota master/empresa/:id[/secao]) — cada um é uma tela de consulta
  // somente-leitura dos dados que aquela empresa cadastrou/gerou. id vazio
  // ("") é a Visão geral (KPIs, dados da conta, analytics, ações de conta).
  const MASTER_EMPRESA_NAV = [
    { id: "", label: "Visão geral", icon: "dashboard" },
    { id: "clientes", label: "Clientes", icon: "clientes" },
    { id: "produtos", label: "Produtos", icon: "produtos" },
    { id: "campanhas", label: "Campanhas Giftback", icon: "campanhas" },
    { id: "envios", label: "Envios Giftback", icon: "giftnav" },
    { id: "campanhas-indicacao", label: "Campanhas Indicação", icon: "indicacoes" },
    { id: "indicacoes", label: "Indicações", icon: "controleIndicacoes" },
    { id: "vouchers", label: "Vouchers", icon: "check" },
    { id: "vendas", label: "Vendas", icon: "compra" },
  ];
  function renderNavMaster(){
    const nav = document.getElementById("nav");
    if (!nav) return;
    const { params } = rotaAtual();
    if (params[0] === "empresa" && params[1]){
      const id = params[1];
      const secaoAtual = params[2] || "";
      let empresa = empresaMasterPorId(id);
      if (!empresa){
        // Acesso direto (refresh) numa subpágina, antes de a empresa entrar
        // no cache local — busca uma vez só pra mostrar o nome no menu, sem
        // travar a página, e redesenha a nav quando chegar.
        api("/master/empresas/"+id).then(det => {
          if (det && det.empresa){
            masterEmpresaAtual = Object.assign({}, det.empresa, { adminNome: det.adminNome, adminEmail: det.adminEmail });
            if (rotaAtual().params[1] === id) renderNavMaster();
          }
        }).catch(()=>{});
      }
      nav.innerHTML =
        '<button class="navitem" data-go="master"><span class="navlabel">← Empresas</span></button>' +
        '<div style="padding:14px 14px 4px; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,255,255,.5); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' +
          esc(empresa ? empresa.nome : "Empresa") +
        '</div>' +
        MASTER_EMPRESA_NAV.map(item => (
          '<button class="navitem ' + (item.id===secaoAtual?'active':'') + '" data-go-empresa="' + item.id + '">' +
            ICONS[item.icon] + '<span class="navlabel">' + item.label + '</span>' +
          '</button>'
        )).join("");
      nav.querySelectorAll("[data-go]").forEach(btn => {
        btn.addEventListener("click", ()=>{ ir(btn.getAttribute("data-go")); fecharMenuMobile(); });
      });
      nav.querySelectorAll("[data-go-empresa]").forEach(btn => {
        btn.addEventListener("click", ()=>{
          const s = btn.getAttribute("data-go-empresa");
          ir("master/empresa/" + id + (s ? "/" + s : ""));
          fecharMenuMobile();
        });
      });
      return;
    }
    nav.innerHTML =
      '<button class="navitem active" data-go="master">' + ICONS.empresa + '<span class="navlabel">Empresas clientes</span></button>';
    const btn = nav.querySelector("[data-go]");
    if (btn) btn.addEventListener("click", ()=>{ ir("master"); fecharMenuMobile(); });
  }
  function renderMasterView(){
    const { params } = rotaAtual();
    const main = document.getElementById("main");
    main.style.padding = "";
    if (params[0] === "empresa" && params[1]) return renderMasterEmpresaSecao(main, params[1], params[2] || "");
    return renderMasterEmpresas(main);
  }
  // Roteador das subpáginas de uma empresa dentro do Master — cada entrada
  // aponta pro endpoint de consulta (GET /master/empresas/:id<path>) e pra
  // função que desenha a tabela com o resultado. "" cai na Visão geral, que
  // tem sua própria função (renderMasterEmpresaDetalhe) por ser bem mais
  // rica que uma tabela simples (KPIs, ações de conta, analytics).
  const MASTER_EMPRESA_SECOES = {
    "clientes": { titulo: "Clientes", desc: "Todos os clientes cadastrados por esta empresa.", path: "/clientes", tabela: (l)=>tabelaMasterEmpresaClientes(l) },
    "produtos": { titulo: "Produtos", desc: "Catálogo de produtos cadastrado por esta empresa.", path: "/produtos", tabela: (l)=>tabelaMasterEmpresaProdutos(l) },
    "campanhas": { titulo: "Campanhas de Giftback", desc: "Todas as campanhas de giftback criadas por esta empresa.", path: "/campanhas", tabela: (l)=>tabelaMasterEmpresaCampanhas(l) },
    "envios": { titulo: "Envios de Giftback", desc: "Histórico de giftbacks enviados aos clientes desta empresa.", path: "/envios", tabela: (l)=>tabelaMasterEmpresaEnvios(l) },
    "campanhas-indicacao": { titulo: "Campanhas de Indicação", desc: "Todas as campanhas de indicação criadas por esta empresa.", path: "/campanhas-indicacao", tabela: (l)=>tabelaMasterEmpresaCampanhasIndicacao(l) },
    "indicacoes": { titulo: "Indicações", desc: "Indicações enviadas e confirmadas nesta empresa.", path: "/indicacoes", tabela: (l)=>tabelaMasterEmpresaIndicacoes(l) },
    "vouchers": { titulo: "Vouchers", desc: "Vouchers emitidos para os clientes desta empresa.", path: "/vouchers", tabela: (l)=>tabelaMasterEmpresaVouchers(l) },
    "vendas": { titulo: "Vendas", desc: "Histórico de vendas registradas por esta empresa.", path: "/vendas", tabela: (l)=>tabelaMasterEmpresaVendas(l) },
  };
  async function renderMasterEmpresaSecao(main, id, secao){
    if (!secao) return renderMasterEmpresaDetalhe(main, id);
    const conf = MASTER_EMPRESA_SECOES[secao];
    if (!conf) return renderMasterEmpresaDetalhe(main, id);
    const empresa = empresaMasterPorId(id);
    setHeader(conf.titulo + (empresa ? " — " + empresa.nome : ""), conf.desc,
      '<button class="btn header-btn btn-sm" id="btn-master-voltar-empresa">← Visão geral</button>');
    // O botão acima já entra no DOM aqui (setHeader mexe direto no
    // #header-actions, que não é limpo pelo "Carregando…" abaixo), então o
    // listener é ligado JÁ NESTE PONTO — antes do await — pra não deixar uma
    // janela em que o botão existe e responde a waitForSelector, mas um
    // clique nele ainda não faz nada (foi exatamente essa corrida que
    // causava falha intermitente nos testes e2e).
    const btnVoltarEmpresa = document.getElementById("btn-master-voltar-empresa");
    if (btnVoltarEmpresa) btnVoltarEmpresa.addEventListener("click", ()=> ir("master/empresa/"+id));
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    let lista;
    try { lista = await api("/master/empresas/"+id+conf.path); }
    catch(err){
      if (err.status === 401 || err.status === 403) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar estes dados.</div>';
      return;
    }
    main.innerHTML = '<div class="card table-wrap">' + conf.tabela(lista) + '</div>';
  }
  function tabelaMasterEmpresaClientes(lista){
    if (!lista.length) return '<div class="empty">Nenhum cliente cadastrado.</div>';
    const rows = lista.map(c => (
      '<tr><td><strong>'+esc(c.nome)+'</strong></td>' +
      '<td class="muted">'+esc(c.telefone||"—")+'</td>' +
      '<td class="muted">'+esc(c.email||"—")+'</td>' +
      '<td class="faint">'+dataBR(c.criadoEm)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Nome</th><th>WhatsApp</th><th>E-mail</th><th>Cadastrado em</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function tabelaMasterEmpresaProdutos(lista){
    if (!lista.length) return '<div class="empty">Nenhum produto cadastrado.</div>';
    const rows = lista.map(p => (
      '<tr><td><strong>'+esc(p.nome)+'</strong></td>' +
      '<td class="muted">'+esc(p.categoria||"—")+'</td>' +
      '<td class="muted">'+(p.valorReferencia!=null?reais(p.valorReferencia):"—")+'</td>' +
      '<td>'+(p.ativo?'<span class="badge b-ativo">Ativo</span>':'<span class="badge b-cancelado">Inativo</span>')+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Produto</th><th>Categoria</th><th>Valor de referência</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function tabelaMasterEmpresaCampanhas(lista){
    if (!lista.length) return '<div class="empty">Nenhuma campanha de giftback cadastrada.</div>';
    const rows = lista.map(c => (
      '<tr><td><strong>'+esc(c.titulo)+'</strong></td>' +
      '<td class="muted">'+esc(c.produtoGatilhoNome||"—")+' → '+esc(c.produtoAlvoNome||"—")+'</td>' +
      '<td class="muted">'+reais(c.valor)+'</td>' +
      '<td class="muted">'+reais(c.valorMinimoCompra||0)+'</td>' +
      '<td class="muted">'+esc(c.status)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Título</th><th>Gatilho → Alvo</th><th>Valor giftback</th><th>Compra mínima</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function tabelaMasterEmpresaCampanhasIndicacao(lista){
    if (!lista.length) return '<div class="empty">Nenhuma campanha de indicação cadastrada.</div>';
    const rows = lista.map(c => (
      '<tr><td><strong>'+esc(c.titulo)+'</strong></td>' +
      '<td class="muted">'+esc(c.premioIndicador||"—")+'</td>' +
      '<td class="muted">'+esc(c.premioIndicado||"—")+'</td>' +
      '<td class="muted">'+(c.metaIndicacoes||0)+'</td>' +
      '<td class="muted">'+esc(c.status)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Título</th><th>Prêmio do indicador</th><th>Prêmio do indicado</th><th>Meta</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function tabelaMasterEmpresaEnvios(lista){
    if (!lista.length) return '<div class="empty">Nenhum giftback enviado ainda.</div>';
    const rows = lista.map(e => (
      '<tr><td><strong>'+esc(e.clienteNome||"—")+'</strong></td>' +
      '<td class="muted">'+esc(e.campanhaTitulo||"—")+'</td>' +
      '<td>'+badgeStatus(e.status)+'</td>' +
      '<td class="faint">'+dataBR(e.dataEnvio)+'</td>' +
      '<td class="faint">'+(e.dataConfirmacao?dataBR(e.dataConfirmacao):"—")+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Cliente</th><th>Campanha</th><th>Status</th><th>Enviado em</th><th>Confirmado em</th></tr></thead><tbody>'+rows+'</tbody></table>' +
      (lista.length >= 300 ? '<div class="faint" style="padding:10px 4px 2px; font-size:11.5px;">Mostrando os 300 mais recentes.</div>' : '');
  }
  function tabelaMasterEmpresaVouchers(lista){
    if (!lista.length) return '<div class="empty">Nenhum voucher emitido ainda.</div>';
    const rows = lista.map(v => (
      '<tr><td><strong>'+esc(v.clienteNome||"—")+'</strong></td>' +
      '<td>'+badgeVoucher(v)+'</td>' +
      '<td class="muted">'+reais(v.valor)+'</td>' +
      '<td class="faint">'+dataBR(v.emitidoEm)+'</td>' +
      '<td class="faint">'+dataBR(v.validoAte)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Cliente</th><th>Voucher</th><th>Valor</th><th>Emitido em</th><th>Válido até</th></tr></thead><tbody>'+rows+'</tbody></table>' +
      (lista.length >= 300 ? '<div class="faint" style="padding:10px 4px 2px; font-size:11.5px;">Mostrando os 300 mais recentes.</div>' : '');
  }
  function tabelaMasterEmpresaIndicacoes(lista){
    if (!lista.length) return '<div class="empty">Nenhuma indicação enviada ainda.</div>';
    const rows = lista.map(i => (
      '<tr><td><strong>'+esc(i.indicadorNome||"—")+'</strong></td>' +
      '<td class="muted">'+esc(i.campanhaTitulo||"—")+'</td>' +
      '<td>'+badgeStatus(i.status)+'</td>' +
      '<td class="muted">'+(i.indicados&&i.indicados.length ? i.indicados.map(a=>esc(a.nome)).join(", ") : '<span class="faint">nenhum amigo confirmado</span>')+'</td>' +
      '<td class="faint">'+dataBR(i.dataEnvio)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Indicador</th><th>Campanha</th><th>Status</th><th>Amigos confirmados</th><th>Enviada em</th></tr></thead><tbody>'+rows+'</tbody></table>' +
      (lista.length >= 300 ? '<div class="faint" style="padding:10px 4px 2px; font-size:11.5px;">Mostrando as 300 mais recentes.</div>' : '');
  }
  function tabelaMasterEmpresaVendas(lista){
    if (!lista.length) return '<div class="empty">Nenhuma venda registrada ainda.</div>';
    const labelsOrigem = { compra_direta:"Compra direta", conversao_giftback:"Conversão de giftback", importacao:"Importação" };
    const rows = lista.map(v => (
      '<tr><td><strong>'+esc(v.clienteNome||"—")+'</strong></td>' +
      '<td class="muted">'+esc(v.produtoNome||"—")+'</td>' +
      '<td class="muted">'+reais(v.valor)+'</td>' +
      '<td class="muted">'+(labelsOrigem[v.origem]||v.origem)+'</td>' +
      '<td class="faint">'+dataBR(v.data)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Cliente</th><th>Produto</th><th>Valor</th><th>Origem</th><th>Data</th></tr></thead><tbody>'+rows+'</tbody></table>' +
      (lista.length >= 300 ? '<div class="faint" style="padding:10px 4px 2px; font-size:11.5px;">Mostrando as 300 mais recentes.</div>' : '');
  }

  async function renderMasterEmpresas(main){
    setHeader("Painel Master", "Todas as empresas clientes da plataforma Club'n Loyal, com o desempenho de cada uma.",
      '<button class="btn header-btn btn-sm" id="btn-master-add">' + ICONS.plus + ' Adicionar cliente</button>');
    // Liga o clique JÁ AQUI, antes do "await api(...)" abaixo: o botão entra
    // no DOM na hora (setHeader escreve direto em #header-actions, que fica
    // fora do #main e não é apagado pelo "Carregando…"), então se o listener
    // só fosse ligado depois do await existiria uma janela em que o botão
    // está visível e clicável mas ainda sem ação nenhuma — corrida que já
    // causou falha intermitente no clique de "Adicionar cliente" em testes
    // e2e (o quanto mais devagar a consulta /master/empresas, ex. com muitas
    // empresas cadastradas, maior a chance de o clique cair nessa janela).
    const btnAdd = document.getElementById("btn-master-add");
    if (btnAdd) btnAdd.addEventListener("click", abrirModalMasterAddEmpresa);
    main.innerHTML = '<div class="card empty">Carregando empresas…</div>';
    masterEmpresaAtual = null;
    try { masterEmpresas = await api("/master/empresas"); }
    catch(err){
      if (err.status === 401 || err.status === 403) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar as empresas.</div>';
      return;
    }
    const totalClientes = masterEmpresas.reduce((s,e)=>s+(e.clientesTotal||0),0);
    const totalEnvios = masterEmpresas.reduce((s,e)=>s+(e.enviosTotal||0),0);
    const totalFaturamento = masterEmpresas.reduce((s,e)=>s+(e.faturamentoEfetivo||0),0);
    main.innerHTML =
      '<div class="grid kpis">' +
        kpi("empresa", "Empresas clientes", masterEmpresas.length, "") +
        kpi("clientes", "Clientes (todas as empresas)", totalClientes, "") +
        kpi("giftnav", "Giftbacks enviados (total)", totalEnvios, "") +
        kpi("check", "Faturamento realizado (total)", reais(totalFaturamento), "") +
      '</div>' +
      '<div class="section">' +
        '<div class="section-head"><div class="section-title">Empresas cadastradas</div></div>' +
        '<div class="card table-wrap">' +
          (masterEmpresas.length ? tabelaMasterEmpresas(masterEmpresas) : '<div class="empty">Nenhuma empresa cadastrada ainda.</div>') +
        '</div>' +
      '</div>' +
      '<div style="margin-top:14px;">' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btn-master-toggle-desativadas">' +
          (masterMostrarDesativadas ? 'Ocultar empresas desativadas' : 'Ver empresas desativadas') +
        '</button>' +
      '</div>' +
      '<div id="master-desativadas-wrap" style="margin-top:12px;"></div>';
    main.querySelectorAll("[data-master-ver]").forEach(btn => {
      btn.addEventListener("click", ()=> ir("master/empresa/" + btn.getAttribute("data-master-ver")));
    });
    ligarAcoesEmpresaEmMain(main);
    document.getElementById("btn-master-toggle-desativadas").addEventListener("click", async ()=>{
      masterMostrarDesativadas = !masterMostrarDesativadas;
      renderMasterEmpresas(main);
    });
    if (masterMostrarDesativadas) await renderMasterEmpresasDesativadas(main);
  }
  async function renderMasterEmpresasDesativadas(main){
    const wrap = document.getElementById("master-desativadas-wrap");
    if (!wrap) return;
    wrap.innerHTML = '<div class="card empty">Carregando…</div>';
    let lista;
    try { lista = await api("/master/empresas?desativadas=1"); }
    catch(err){
      if (err.status === 401 || err.status === 403) return;
      wrap.innerHTML = '<div class="card empty">Não foi possível carregar as empresas desativadas.</div>';
      return;
    }
    wrap.innerHTML =
      '<div class="card table-wrap">' +
        (lista.length ? (
          '<table><thead><tr><th>Empresa</th><th>Status</th><th>Criada em</th><th></th></tr></thead><tbody>' +
          lista.map(e => (
            '<tr><td><strong>'+esc(e.nome)+'</strong></td>' +
            '<td>'+badgeStatusEmpresa('desativada')+'</td>' +
            '<td class="faint">'+dataBR(e.criadoEm)+'</td>' +
            '<td><button class="btn btn-primary btn-sm" data-reativar-empresa="'+e.id+'">Reativar</button></td></tr>'
          )).join("") + '</tbody></table>'
        ) : '<div class="empty">Nenhuma empresa desativada.</div>') +
      '</div>';
    masterEmpresas = masterEmpresas.concat(lista);
    ligarAcoesEmpresaEmMain(wrap);
  }
  function tabelaMasterEmpresas(lista){
    const rows = lista.map(e => (
      '<tr>' +
        '<td><strong>'+esc(e.nome)+'</strong><div class="faint" style="font-size:11px; margin-top:2px;">'+esc(e.adminNome||"")+(e.adminEmail?' · '+esc(e.adminEmail):'')+'</div></td>' +
        '<td>'+badgeStatusEmpresa(statusEmpresa(e))+'</td>' +
        '<td class="faint">'+dataBR(e.criadoEm)+'</td>' +
        '<td class="muted">'+(e.clientesTotal||0)+'</td>' +
        '<td class="muted">'+(e.campanhasAtivas||0)+'</td>' +
        '<td class="muted">'+(e.enviosTotal||0)+' <span class="faint">('+(e.taxaConfirmados||0)+'% conf.)</span></td>' +
        '<td class="muted">'+reais(e.faturamentoEfetivo||0)+'</td>' +
        '<td class="btn-row"><button class="btn btn-sm" data-master-ver="'+e.id+'">Ver detalhes</button>' + acoesEmpresaHtml(e) + '</td>' +
      '</tr>'
    )).join("");
    return '<table><thead><tr><th>Empresa</th><th>Status</th><th>Criada em</th><th>Clientes</th><th>Campanhas ativas</th><th>Giftbacks enviados</th><th>Faturamento realizado</th><th>Ações</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  // Linha de botões de ação de conta (Editar, Nova senha, Aparência,
  // Bloquear/Desbloquear, Desativar) — reaproveitada na lista (célula
  // "Ações" de cada linha) e no topo do detalhe de cada empresa.
  function acoesEmpresaHtml(empresa){
    const status = statusEmpresa(empresa);
    return (
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-editar-empresa="'+empresa.id+'">Editar dados</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-senha-empresa="'+empresa.id+'">Nova senha</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-aparencia-empresa="'+empresa.id+'">Aparência</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-bloquear-empresa="'+empresa.id+'">'+(status==='bloqueada'?'Desbloquear':'Bloquear')+'</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-desativar-empresa="'+empresa.id+'">Desativar</button>' +
      '</div>'
    );
  }
  // Liga todos os botões de ação de conta presentes dentro de `main` (ou de
  // um trecho dele) — chamado depois de renderizar tanto a lista quanto o
  // detalhe, já que os dois usam os mesmos atributos data-*.
  function ligarAcoesEmpresaEmMain(main){
    main.querySelectorAll("[data-editar-empresa]").forEach(btn => {
      btn.addEventListener("click", ()=> abrirModalMasterEditarEmpresa(btn.getAttribute("data-editar-empresa")));
    });
    main.querySelectorAll("[data-senha-empresa]").forEach(btn => {
      btn.addEventListener("click", ()=> abrirModalMasterNovaSenha(btn.getAttribute("data-senha-empresa")));
    });
    main.querySelectorAll("[data-aparencia-empresa]").forEach(btn => {
      btn.addEventListener("click", ()=> abrirModalMasterAparencia(btn.getAttribute("data-aparencia-empresa")));
    });
    main.querySelectorAll("[data-bloquear-empresa]").forEach(btn => {
      btn.addEventListener("click", ()=> alternarBloqueioEmpresaMaster(btn.getAttribute("data-bloquear-empresa")));
    });
    main.querySelectorAll("[data-desativar-empresa]").forEach(btn => {
      btn.addEventListener("click", ()=> abrirModalMasterConfirmarDesativacao(btn.getAttribute("data-desativar-empresa")));
    });
    main.querySelectorAll("[data-reativar-empresa]").forEach(btn => {
      btn.addEventListener("click", ()=> reativarEmpresaMaster(btn.getAttribute("data-reativar-empresa")));
    });
  }

  async function renderMasterEmpresaDetalhe(main, id){
    setHeader("Empresa", "Carregando…", '<button class="btn header-btn btn-sm" id="btn-master-voltar">← Voltar</button>');
    // Mesmo motivo do comentário em renderMasterEmpresas: liga o clique já
    // no estado de "Carregando…", antes do await, pra não ter janela sem
    // ação nenhuma nesse botão.
    ligarBtnMasterVoltar();
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    let det;
    try { det = await api("/master/empresas/"+id); }
    catch(err){
      if (err.status === 401 || err.status === 403) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar esta empresa.</div>';
      return;
    }
    const emp = det.empresa || {};
    const s = det.stats || {};
    const analytics = det.analytics || {};
    masterEmpresaAtual = Object.assign({}, emp, {
      adminNome: det.adminNome, adminEmail: det.adminEmail,
    });
    setHeader("Empresa: " + (emp.nomeEmpresa || emp.nome || ""), "Cliente desde " + dataBR(det.criadoEm) + ".",
      '<button class="btn header-btn btn-sm" id="btn-master-voltar">← Voltar</button>');
    ligarBtnMasterVoltar();
    main.innerHTML =
      '<div class="card" style="margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;">' +
        '<div>' + badgeStatusEmpresa(statusEmpresa(emp)) + '</div>' +
        acoesEmpresaHtml(masterEmpresaAtual) +
      '</div>' +
      '<div class="grid kpis">' +
        kpi("clientes", "Clientes cadastrados", s.clientesTotal||0, "") +
        kpi("campanhas", "Campanhas ativas", s.campanhasAtivas||0, "") +
        kpi("giftnav", "Giftbacks enviados", s.enviosTotal||0, (s.taxaConfirmados||0) + "% confirmados") +
        kpi("check", "Vouchers ativos", s.vouchersAtivos||0, (s.vouchersUtilizados||0) + " já utilizados") +
        kpi("compra", "Faturamento realizado", reais(s.faturamentoEfetivo||0), "") +
      '</div>' +
      '<div class="card" style="margin:18px 0;">' +
        '<div class="section-title" style="margin-bottom:12px;">Dados da conta</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label>Empresa</label><div style="font-size:13.5px;">'+esc(emp.nome)+'</div></div>' +
          '<div class="field"><label>Criada em</label><div style="font-size:13.5px;">'+dataBR(det.criadoEm)+'</div></div>' +
          '<div class="field"><label>Administrador</label><div style="font-size:13.5px;">'+esc(det.adminNome||"—")+'</div></div>' +
          '<div class="field"><label>E-mail de acesso</label><div style="font-size:13.5px;">'+esc(det.adminEmail||"—")+'</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-split" style="margin-bottom:18px;">' +
        cardAnaliticsGiftbackMaster(analytics) +
        cardAnaliticsIndicacaoMaster(analytics) +
      '</div>' +
      '<div class="section">' +
        '<div class="section-head"><div class="section-title">Campanhas de Giftback</div></div>' +
        '<div class="card table-wrap">' +
          (det.campanhas && det.campanhas.length ? tabelaMasterCampanhas(det.campanhas) : '<div class="empty">Nenhuma campanha de giftback cadastrada.</div>') +
        '</div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="section-head"><div class="section-title">Campanhas de Indicação</div></div>' +
        '<div class="card table-wrap">' +
          (det.campanhasIndicacao && det.campanhasIndicacao.length ? tabelaMasterCampanhasIndicacao(det.campanhasIndicacao) : '<div class="empty">Nenhuma campanha de indicação cadastrada.</div>') +
        '</div>' +
      '</div>';
    ligarAcoesEmpresaEmMain(main);
  }
  // Liga o clique do botão "← Voltar" do cabeçalho da Visão geral de uma
  // empresa no Master. setHeader() troca o innerHTML de #header-actions toda
  // vez que é chamado, então o elemento é recriado a cada render (estado de
  // "Carregando…" e depois com os dados) — por isso este helper é chamado
  // logo depois de CADA setHeader(...) que inclui esse botão, nunca só uma
  // vez no fim, pra nunca deixar o botão visível sem o listener ligado.
  function ligarBtnMasterVoltar(){
    const btn = document.getElementById("btn-master-voltar");
    if (btn) btn.addEventListener("click", ()=> ir("master"));
  }
  // Métricas derivadas (enviado/confirmado/% e efetivação em vendas) para um
  // dos dois programas, a partir dos números brutos vindos do backend
  // (calcularAnalyticsMaster em dashboardStats.js).
  function metricasProgramaEmpresaMaster(analytics, tipo){
    if (tipo === 'giftback'){
      const enviadosQtd = Number(analytics.giftbackEnviadosQtd)||0;
      const enviadosValor = Number(analytics.giftbackEnviadosValor)||0;
      const confirmadosQtd = Number(analytics.giftbackConfirmadosQtd)||0;
      const vendasValor = Number(analytics.giftbackVendasGeradasValor)||0;
      return {
        enviadosQtd, enviadosValor, confirmadosQtd, vendasValor,
        pctConfirmado: enviadosQtd ? (confirmadosQtd/enviadosQtd*100) : 0,
        pctEfetivacao: enviadosValor ? (vendasValor/enviadosValor*100) : 0,
      };
    }
    const enviadosQtd = Number(analytics.indicacaoEnviadosQtd)||0;
    const confirmadosQtd = Number(analytics.indicacaoConfirmadosQtd)||0;
    const vendasValor = Number(analytics.indicacaoVendasGeradasValor)||0;
    return {
      enviadosQtd, confirmadosQtd, vendasValor,
      pctConfirmado: enviadosQtd ? (confirmadosQtd/enviadosQtd*100) : 0,
      ticketMedio: confirmadosQtd ? (vendasValor/confirmadosQtd) : 0,
    };
  }
  function cardAnaliticsGiftbackMaster(analytics){
    const m = metricasProgramaEmpresaMaster(analytics, 'giftback');
    const evo = analytics.evolucaoMensal || [];
    return (
      '<div class="card">' +
        '<div class="section-title" style="margin-bottom:14px; display:flex; align-items:center; gap:8px;">' + ICONS.giftnav + ' Giftback</div>' +
        '<div class="grid kpis" style="margin-bottom:18px;">' +
          kpi("giftnav", "Enviado", m.enviadosQtd, reais(m.enviadosValor)+" ofertados") +
          kpi("check", "Confirmado", m.confirmadosQtd, m.pctConfirmado.toFixed(0)+"% de conversão") +
          kpi("compra", "Efetivou em vendas", reais(m.vendasValor), m.pctEfetivacao.toFixed(0)+"% do valor ofertado") +
        '</div>' +
        '<div class="eyebrow" style="margin-bottom:6px;">Evolução (últimos 6 meses)</div>' +
        graficoEvolucaoSvg(evo.map(x=>x.mes), evo.map(x=>x.giftbackEnviados||0), evo.map(x=>x.giftbackConfirmados||0), "Enviados", "Confirmados") +
      '</div>'
    );
  }
  function cardAnaliticsIndicacaoMaster(analytics){
    const m = metricasProgramaEmpresaMaster(analytics, 'indicacao');
    const evo = analytics.evolucaoMensal || [];
    return (
      '<div class="card">' +
        '<div class="section-title" style="margin-bottom:14px; display:flex; align-items:center; gap:8px;">' + ICONS.indicacoes + ' Indicações</div>' +
        '<div class="grid kpis" style="margin-bottom:18px;">' +
          kpi("indicacoes", "Enviado", m.enviadosQtd, "indicações enviadas") +
          kpi("check", "Confirmado", m.confirmadosQtd, m.pctConfirmado.toFixed(0)+"% de conversão") +
          kpi("compra", "Efetivou em vendas", reais(m.vendasValor), "ticket médio "+reais(m.ticketMedio)) +
        '</div>' +
        '<div class="eyebrow" style="margin-bottom:6px;">Evolução (últimos 6 meses)</div>' +
        graficoEvolucaoSvg(evo.map(x=>x.mes), evo.map(x=>x.indicacaoEnviados||0), evo.map(x=>x.indicacaoConfirmados||0), "Enviadas", "Confirmadas") +
      '</div>'
    );
  }
  // ---------------------------------------------------------------------
  // Mini-gráfico de evolução (SVG inline, sem dependências) — usado nos
  // cartões de análise de Giftback/Indicações do Painel Master. Sempre duas
  // séries de mesma unidade (contagens), um único eixo Y (nunca eixo duplo).
  // Cores fixas: azul = "Enviados", laranja = "Confirmados" — mesma
  // identidade em todo o painel.
  // ---------------------------------------------------------------------
  function proximoTetoLimpo(v){
    if (v <= 5) return 5;
    const pot = Math.pow(10, Math.floor(Math.log10(v)));
    const norm = v / pot;
    let passo;
    if (norm <= 1) passo = 1;
    else if (norm <= 2) passo = 2;
    else if (norm <= 5) passo = 5;
    else passo = 10;
    return passo * pot;
  }
  function graficoEvolucaoSvg(meses, serieA, serieB, labelA, labelB){
    if (!meses || !meses.length){
      return '<div class="empty" style="padding:22px 12px;">Sem histórico suficiente ainda.</div>';
    }
    const corA = "#2a78d6"; // categórico slot 1 (azul)
    const corB = "#eb6834"; // categórico slot 2 (laranja)
    const W = 480, H = 168, padL = 32, padR = 12, padT = 12, padB = 22;
    const maiorValor = Math.max(1, Math.max.apply(null, serieA), Math.max.apply(null, serieB));
    const maxTick = proximoTetoLimpo(maiorValor);
    const midTick = maxTick / 2;
    const n = meses.length;
    const xStep = n > 1 ? (W - padL - padR) / (n - 1) : 0;
    const xAt = i => padL + i * xStep;
    const yAt = v => (H - padB) - (Math.max(0,v) / maxTick) * (H - padT - padB);

    function caminho(serie){
      return serie.map((v,i) => (i===0?'M':'L') + xAt(i).toFixed(1) + ',' + yAt(v).toFixed(1)).join(' ');
    }
    function marcadores(serie, cor, label){
      return serie.map((v,i) => (
        '<circle cx="'+xAt(i).toFixed(1)+'" cy="'+yAt(v).toFixed(1)+'" r="4" fill="'+cor+'" stroke="var(--surface)" stroke-width="2">' +
          '<title>' + esc(meses[i]) + ' · ' + esc(label) + ': ' + Math.round(v).toLocaleString('pt-BR') + '</title>' +
        '</circle>'
      )).join('');
    }
    const linhasGrade = [0, midTick, maxTick].map(v => {
      const y = yAt(v).toFixed(1);
      return '<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" stroke="var(--border)" stroke-width="1"/>' +
        '<text x="'+(padL-6)+'" y="'+y+'" text-anchor="end" dominant-baseline="middle" font-size="9.5" fill="var(--text-faint)">'+Math.round(v).toLocaleString('pt-BR')+'</text>';
    }).join('');
    const rotulosX = meses.map((m,i) => (
      '<text x="'+xAt(i).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">'+esc(String(m).replace(/\/\d+$/,''))+'</text>'
    )).join('');
    const ultimoA = serieA[serieA.length-1] || 0;
    const ultimoB = serieB[serieB.length-1] || 0;
    const rotuloFimA = '<text x="'+(xAt(n-1)+7).toFixed(1)+'" y="'+(yAt(ultimoA)-5).toFixed(1)+'" font-size="10.5" font-weight="700" fill="var(--text)">'+Math.round(ultimoA).toLocaleString('pt-BR')+'</text>';
    const rotuloFimB = '<text x="'+(xAt(n-1)+7).toFixed(1)+'" y="'+(yAt(ultimoB)+13).toFixed(1)+'" font-size="10.5" font-weight="700" fill="var(--text)">'+Math.round(ultimoB).toLocaleString('pt-BR')+'</text>';

    return (
      '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Evolução mensal de '+esc(labelA)+' e '+esc(labelB)+'" style="overflow:visible; display:block;">' +
        linhasGrade +
        '<path d="'+caminho(serieA)+'" fill="none" stroke="'+corA+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="'+caminho(serieB)+'" fill="none" stroke="'+corB+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        marcadores(serieA, corA, labelA) +
        marcadores(serieB, corB, labelB) +
        rotuloFimA + rotuloFimB +
        rotulosX +
      '</svg>' +
      '<div class="btn-row" style="margin-top:6px; gap:14px;">' +
        '<span class="faint" style="display:flex; align-items:center; gap:5px; font-size:11px;"><span style="width:9px; height:9px; border-radius:50%; background:'+corA+'; display:inline-block;"></span>'+esc(labelA)+'</span>' +
        '<span class="faint" style="display:flex; align-items:center; gap:5px; font-size:11px;"><span style="width:9px; height:9px; border-radius:50%; background:'+corB+'; display:inline-block;"></span>'+esc(labelB)+'</span>' +
      '</div>'
    );
  }
  function tabelaMasterCampanhas(lista){
    const rows = lista.map(c => (
      '<tr><td><strong>'+esc(c.titulo)+'</strong></td><td class="muted">'+reais(c.valor)+'</td><td class="muted">'+esc(c.status)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Título</th><th>Valor giftback</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function tabelaMasterCampanhasIndicacao(lista){
    const rows = lista.map(c => (
      '<tr><td><strong>'+esc(c.titulo)+'</strong></td><td class="muted">'+esc(c.premioIndicador)+'</td><td class="muted">'+esc(c.status)+'</td></tr>'
    )).join("");
    return '<table><thead><tr><th>Título</th><th>Prêmio do indicador</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  // Seletor de cor principal + logo usado nos modais "Adicionar cliente" e
  // "Editar aparência" do Painel Master — mesmos PALETA_CORES/roda de
  // cores/upload de logo/preview em "tela de celular" já usados na tela
  // Configurações → Aparência de cada empresa (renderConfigAparencia acima),
  // só que num modal compacto em vez da tela cheia.
  function corLogoPickerHtml(prefix, corAtual, logoAtual){
    return (
      '<div class="field full">' +
        '<label>Cor principal</label>' +
        '<div class="cor-swatches" data-picker-swatches="'+prefix+'">' +
          PALETA_CORES.map(c => '<button type="button" class="cor-swatch'+(c.toLowerCase()===corAtual.toLowerCase()?' is-selected':'')+'" style="background:'+c+';" data-cor="'+c+'" title="'+c+'" aria-label="'+c+'"></button>').join("") +
        '</div>' +
        '<div class="cor-manual-row" style="margin-bottom:4px;">' +
          '<label class="cor-picker-label" title="Roda de cores">' +
            '<input type="color" data-picker-color="'+prefix+'" value="'+(/^#([0-9a-f]{6})$/i.test(corAtual)?corAtual:'#7c3aed')+'">' +
          '</label>' +
          '<input type="text" class="cor-hex-input" data-picker-hex="'+prefix+'" value="'+esc(corAtual)+'" placeholder="#1A264B" maxlength="7">' +
        '</div>' +
      '</div>' +
      '<div class="field full">' +
        '<label>Logo</label>' +
        '<div class="logo-upload-row">' +
          '<div class="logo-preview" data-picker-logo-preview="'+prefix+'">' + (logoAtual ? '<img src="'+esc(logoAtual)+'" alt="Logo">' : '<span class="logo-preview-vazio">Sem logo</span>') + '</div>' +
          '<div class="logo-upload-actions">' +
            '<label class="btn btn-sm" for="input-logo-'+prefix+'">' + ICONS.upload + ' Enviar logo</label>' +
            '<input type="file" id="input-logo-'+prefix+'" data-picker-logo-input="'+prefix+'" accept="image/*" hidden>' +
            '<button type="button" class="btn btn-sm btn-ghost" data-picker-logo-remover="'+prefix+'"'+(logoAtual?'':' disabled')+'>Remover logo</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="field full">' +
        '<span class="muted" style="font-size:12px;">Como o cliente vai ver:</span>' +
        '<div class="phone-frame" style="margin-top:8px;">' +
          '<div class="phone-notch"></div>' +
          '<div class="phone-screen" data-picker-preview="'+prefix+'"></div>' +
        '</div>' +
      '</div>'
    );
  }
  // Liga os eventos do bloco acima dentro de `container` (o modal onde ele
  // foi injetado). `estado` é um objeto mutável {cor, logo} que o chamador lê
  // no submit. `getNome` (opcional) alimenta o preview com o nome da empresa
  // sendo editada/criada. Retorna {atualizarPreview} para o chamador poder
  // atualizar o preview quando o nome mudar (ex.: digitando no campo "Nome
  // da empresa" do modal de criação).
  function ligarCorLogoPicker(container, prefix, estado, getNome){
    const swatchesWrap = container.querySelector('[data-picker-swatches="'+prefix+'"]');
    const colorPicker = container.querySelector('[data-picker-color="'+prefix+'"]');
    const hexInput = container.querySelector('[data-picker-hex="'+prefix+'"]');
    const logoPreview = container.querySelector('[data-picker-logo-preview="'+prefix+'"]');
    const logoInput = container.querySelector('[data-picker-logo-input="'+prefix+'"]');
    const btnRemoverLogo = container.querySelector('[data-picker-logo-remover="'+prefix+'"]');
    const previewMount = container.querySelector('[data-picker-preview="'+prefix+'"]');

    function atualizarPreview(){
      if (!previewMount) return;
      const nome = getNome ? (getNome() || "Sua empresa") : "Sua empresa";
      previewMount.innerHTML = previewAparenciaHtml(estado.cor, estado.logo, nome, "");
    }
    atualizarPreview();
    ligarCronometro();

    function aplicarCor(cor, origem){
      estado.cor = cor;
      if (swatchesWrap) swatchesWrap.querySelectorAll(".cor-swatch").forEach(sw => {
        sw.classList.toggle("is-selected", sw.getAttribute("data-cor").toLowerCase() === cor.toLowerCase());
      });
      if (origem !== "hex" && hexInput) hexInput.value = cor;
      if (origem !== "picker" && colorPicker && /^#([0-9a-f]{6})$/i.test(cor)) colorPicker.value = cor;
      atualizarPreview();
    }
    if (swatchesWrap) swatchesWrap.querySelectorAll(".cor-swatch").forEach(sw => {
      sw.addEventListener("click", () => aplicarCor(sw.getAttribute("data-cor")));
    });
    if (colorPicker) colorPicker.addEventListener("input", () => aplicarCor(colorPicker.value, "picker"));
    if (hexInput) hexInput.addEventListener("input", () => {
      const v = hexInput.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) aplicarCor(v, "hex");
    });
    if (logoInput) logoInput.addEventListener("change", async () => {
      const file = logoInput.files && logoInput.files[0];
      if (!file) return;
      try {
        const dataUrl = await redimensionarImagemQuadrada(file, 800);
        estado.logo = dataUrl;
        if (logoPreview) logoPreview.innerHTML = '<img src="'+esc(dataUrl)+'" alt="Logo">';
        if (btnRemoverLogo) btnRemoverLogo.disabled = false;
        atualizarPreview();
      } catch(err){
        toast(mensagemErro(err, "Não foi possível processar essa imagem."), 'erro');
      }
    });
    if (btnRemoverLogo) btnRemoverLogo.addEventListener("click", () => {
      estado.logo = "";
      if (logoPreview) logoPreview.innerHTML = '<span class="logo-preview-vazio">Sem logo</span>';
      btnRemoverLogo.disabled = true;
      if (logoInput) logoInput.value = "";
      atualizarPreview();
    });
    return { atualizarPreview };
  }

  function abrirModalMasterAddEmpresa(){
    const overlay = abrirModal(
      '<div class="section-title" style="margin-bottom:12px;">Adicionar empresa cliente</div>' +
      '<form id="form-master-add" class="form-grid" style="grid-template-columns:1fr;">' +
        '<div class="field"><label>Nome da empresa</label><input type="text" name="nomeEmpresa" required placeholder="Ex.: Clínica Bella Estética"></div>' +
        '<div class="field"><label>Nome do administrador</label><input type="text" name="nomeAdmin" required placeholder="Nome completo"></div>' +
        '<div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="admin@empresa.com"></div>' +
        '<div class="field"><label>Senha (mín. 6 caracteres)</label><input type="password" name="senha" required minlength="6" placeholder="••••••••"></div>' +
        corLogoPickerHtml("master-novo", "#7c3aed", "") +
        '<div id="erro-master-add" class="auth-error" style="display:none;"></div>' +
        '<div class="btn-row" style="justify-content:flex-end;">' +
          '<button type="button" class="btn btn-sm" id="btn-master-add-cancelar">Cancelar</button>' +
          '<button class="btn btn-primary btn-sm" type="submit">' + ICONS.plus + ' Criar empresa</button>' +
        '</div>' +
      '</form>'
    );
    const btnCancelar = document.getElementById("btn-master-add-cancelar");
    if (btnCancelar) btnCancelar.addEventListener("click", fecharModal);
    const form = document.getElementById("form-master-add");
    const nomeInput = form.querySelector('[name="nomeEmpresa"]');
    const estadoAparencia = { cor: "#7c3aed", logo: "" };
    const picker = ligarCorLogoPicker(overlay, "master-novo", estadoAparencia, ()=> nomeInput.value);
    nomeInput.addEventListener("input", picker.atualizarPreview);
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const erroEl = document.getElementById("erro-master-add");
      erroEl.style.display = "none";
      const botao = e.target.querySelector('button[type="submit"]');
      botao.disabled = true;
      try {
        await api("/master/empresas", { method:"POST", body:{
          nomeEmpresa: fd.get("nomeEmpresa"), nomeAdmin: fd.get("nomeAdmin"),
          email: fd.get("email"), senha: fd.get("senha"),
          corPrincipal: estadoAparencia.cor || "#7c3aed", logoUrl: estadoAparencia.logo || "",
        }});
        fecharModal();
        toast("Empresa cliente criada.");
        renderMasterEmpresas(document.getElementById("main"));
      } catch(err){
        botao.disabled = false;
        if (err.status !== 401){
          erroEl.textContent = mensagemErro(err, "Não foi possível criar a empresa.");
          erroEl.style.display = "block";
        }
      }
    });
  }

  function abrirModalMasterEditarEmpresa(id){
    const empresa = empresaMasterPorId(id);
    if (!empresa) return;
    abrirModal(
      '<div class="section-title" style="margin-bottom:12px;">Editar dados</div>' +
      '<form id="form-master-editar" class="form-grid" style="grid-template-columns:1fr;">' +
        campoComValor("nome","Nome da empresa","text",empresa.nome, true) +
        campoComValor("adminNome","Nome do admin","text",empresa.adminNome, true) +
        campoComValor("adminEmail","E-mail","email",empresa.adminEmail, true) +
        '<div id="erro-master-editar" class="auth-error" style="display:none;"></div>' +
        '<div class="btn-row" style="justify-content:flex-end;">' +
          '<button type="button" class="btn btn-sm" id="btn-master-editar-cancelar">Cancelar</button>' +
          '<button class="btn btn-primary btn-sm" type="submit">Salvar</button>' +
        '</div>' +
      '</form>'
    );
    const btnCancelar = document.getElementById("btn-master-editar-cancelar");
    if (btnCancelar) btnCancelar.addEventListener("click", fecharModal);
    const form = document.getElementById("form-master-editar");
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const erroEl = document.getElementById("erro-master-editar");
      erroEl.style.display = "none";
      const botao = e.target.querySelector('button[type="submit"]');
      botao.disabled = true;
      try {
        await api("/master/empresas/"+id, { method:"PUT", body:{
          nome: fd.get("nome"), adminNome: fd.get("adminNome"), adminEmail: fd.get("adminEmail"),
        }});
        fecharModal();
        toast("Dados atualizados.");
        renderMasterView();
      } catch(err){
        botao.disabled = false;
        if (err.status !== 401){
          erroEl.textContent = mensagemErro(err, "Não foi possível salvar os dados.");
          erroEl.style.display = "block";
        }
      }
    });
  }

  function abrirModalMasterNovaSenha(id){
    const empresa = empresaMasterPorId(id);
    if (!empresa) return;
    abrirModal(
      '<div class="section-title" style="margin-bottom:4px;">Definir nova senha</div>' +
      '<p class="muted" style="font-size:12.5px; margin:0 0 12px; line-height:1.5;">Define a senha de acesso de <strong>'+esc(empresa.nome)+'</strong>.</p>' +
      '<form id="form-master-senha" class="form-grid" style="grid-template-columns:1fr;">' +
        campo("senha","Nova senha","password","Mínimo de 6 caracteres", true) +
        campo("confirmarSenha","Confirmar senha","password","Repita a senha", true) +
        '<div id="erro-master-senha" class="auth-error" style="display:none;"></div>' +
        '<div class="btn-row" style="justify-content:flex-end;">' +
          '<button type="button" class="btn btn-sm" id="btn-master-senha-cancelar">Cancelar</button>' +
          '<button class="btn btn-primary btn-sm" type="submit">Salvar senha</button>' +
        '</div>' +
      '</form>'
    );
    const btnCancelar = document.getElementById("btn-master-senha-cancelar");
    if (btnCancelar) btnCancelar.addEventListener("click", fecharModal);
    const form = document.getElementById("form-master-senha");
    const erroEl = document.getElementById("erro-master-senha");
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const senha = fd.get("senha")||"";
      const confirmarSenha = fd.get("confirmarSenha")||"";
      erroEl.style.display = "none";
      if (senha.length < 6){
        erroEl.textContent = "A senha deve ter pelo menos 6 caracteres.";
        erroEl.style.display = "block";
        return;
      }
      if (senha !== confirmarSenha){
        erroEl.textContent = "As senhas não coincidem.";
        erroEl.style.display = "block";
        return;
      }
      const botao = e.target.querySelector('button[type="submit"]');
      botao.disabled = true;
      try {
        await api("/master/empresas/"+id+"/senha", { method:"PUT", body:{ senha } });
        fecharModal();
        toast("Senha atualizada.");
      } catch(err){
        botao.disabled = false;
        if (err.status !== 401){
          erroEl.textContent = mensagemErro(err, "Não foi possível salvar a senha.");
          erroEl.style.display = "block";
        }
      }
    });
  }

  function alternarBloqueioEmpresaMaster(id){
    const empresa = empresaMasterPorId(id);
    if (!empresa) return;
    const novoStatus = statusEmpresa(empresa) === 'bloqueada' ? 'ativa' : 'bloqueada';
    api("/master/empresas/"+id+"/status", { method:"PUT", body:{ status: novoStatus } }).then(()=>{
      toast(novoStatus === 'bloqueada' ? "Empresa bloqueada." : "Empresa desbloqueada.");
      renderMasterView();
    }).catch(err=>{
      if (err.status !== 401 && err.status !== 403) toast(mensagemErro(err, "Não foi possível atualizar."), 'erro');
    });
  }

  function abrirModalMasterConfirmarDesativacao(id){
    const empresa = empresaMasterPorId(id);
    if (!empresa) return;
    abrirModal(
      '<div class="section-title" style="margin-bottom:12px;">Desativar empresa</div>' +
      '<p class="muted" style="font-size:13.5px; line-height:1.55;">Tem certeza que deseja desativar <strong>'+esc(empresa.nome)+'</strong>? Os dados da empresa são mantidos — nada é apagado — e ela some da lista padrão de clientes. Você pode reativá-la a qualquer momento em "Ver empresas desativadas".</p>' +
      '<div class="btn-row" style="justify-content:flex-end; margin-top:14px;">' +
        '<button type="button" class="btn btn-sm" id="btn-master-desativar-cancelar">Cancelar</button>' +
        '<button type="button" class="btn btn-primary btn-sm" id="btn-master-desativar-confirmar">Desativar</button>' +
      '</div>'
    );
    const btnCancelar = document.getElementById("btn-master-desativar-cancelar");
    if (btnCancelar) btnCancelar.addEventListener("click", fecharModal);
    document.getElementById("btn-master-desativar-confirmar").addEventListener("click", async ()=>{
      try {
        await api("/master/empresas/"+id+"/status", { method:"PUT", body:{ status:'desativada' } });
        fecharModal();
        toast("Empresa desativada.");
        ir("master");
      } catch(err){
        if (err.status !== 401 && err.status !== 403) toast(mensagemErro(err, "Não foi possível desativar."), 'erro');
      }
    });
  }

  function reativarEmpresaMaster(id){
    api("/master/empresas/"+id+"/status", { method:"PUT", body:{ status:'ativa' } }).then(()=>{
      toast("Empresa reativada.");
      renderMasterView();
    }).catch(err=>{
      if (err.status !== 401 && err.status !== 403) toast(mensagemErro(err, "Não foi possível reativar."), 'erro');
    });
  }

  function abrirModalMasterAparencia(id){
    const empresa = empresaMasterPorId(id);
    if (!empresa) return;
    const cor = empresa.corPrincipal || "#7c3aed";
    const logo = empresa.logoUrl || "";
    const overlay = abrirModal(
      '<div class="section-title" style="margin-bottom:4px;">Editar aparência</div>' +
      '<p class="muted" style="font-size:12.5px; margin:0 0 12px;">Cor e logo de <strong>'+esc(empresa.nome)+'</strong>, usadas nas páginas de giftback e indicação exibidas aos clientes dela.</p>' +
      '<form id="form-master-aparencia" class="form-grid" style="grid-template-columns:1fr;">' +
        corLogoPickerHtml("master-editar", cor, logo) +
        '<div class="btn-row" style="justify-content:flex-end;">' +
          '<button type="button" class="btn btn-sm" id="btn-master-aparencia-cancelar">Cancelar</button>' +
          '<button class="btn btn-primary btn-sm" type="submit">Salvar aparência</button>' +
        '</div>' +
      '</form>'
    );
    const btnCancelar = document.getElementById("btn-master-aparencia-cancelar");
    if (btnCancelar) btnCancelar.addEventListener("click", fecharModal);
    const estado = { cor, logo };
    ligarCorLogoPicker(overlay, "master-editar", estado, ()=> empresa.nome);
    const form = document.getElementById("form-master-aparencia");
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const botao = e.target.querySelector('button[type="submit"]');
      botao.disabled = true;
      try {
        await api("/master/empresas/"+id+"/aparencia", { method:"PUT", body:{
          corPrincipal: estado.cor || "#7c3aed", logoUrl: estado.logo || "",
        }});
        fecharModal();
        toast("Aparência atualizada.");
        renderMasterView();
      } catch(err){
        botao.disabled = false;
        if (err.status !== 401 && err.status !== 403) toast(mensagemErro(err, "Não foi possível salvar a aparência."), 'erro');
      }
    });
  }

  let rotaAnterior = null;
  function render(){
    const { nome, params } = rotaAtual();

    if (nome === "vendas-nova" && rotaAnterior !== "vendas-nova"){
      novaCompraResultado = null;
    }
    rotaAnterior = nome;

    if (nome === "resgate"){
      esconderShellInterno();
      renderResgate(params[0]);
      return;
    }
    if (nome === "indicacao"){
      esconderShellInterno();
      renderIndicacaoPublica(params[0], params[1] === "amigo");
      return;
    }
    if (!localStorage.getItem("gb_token")){ renderLogin(); return; }

    if (localStorage.getItem("gb_role") === "master"){
      mostrarShellInterno();
      renderNavMaster();
      renderMasterView();
      return;
    }

    mostrarShellInterno();
    renderNav(nome);
    atualizarAvatarUsuario();

    const main = document.getElementById("main");
    main.style.padding = "";
    if (!state.ready){
      main.innerHTML = '<div class="empty">Carregando dados…</div>';
      return;
    }
    if (nome === "clientes") return renderClientes(main);
    if (nome === "produtos") return renderProdutos(main);
    if (nome === "campanhas-criar") return renderCampanhasCriar(main);
    if (nome === "campanhas-consultar") return renderCampanhasConsultar(main);
    if (nome === "indicacoes-criar") return renderIndicacoesCriar(main);
    if (nome === "indicacoes-consultar") return renderIndicacoesConsultar(main);
    if (nome === "indicacoes-enviar") return renderIndicacoesEnviar(main, params[0]);
    if (nome === "vendas-nova") return renderNovaCompra(main);
    if (nome === "vendas-consultar") return renderVendasConsultar(main);
    if (nome === "giftback-elegiveis") return renderGiftbackElegiveis(main);
    if (nome === "giftback-controle") return renderControleGiftback(main, params[0]);
    if (nome === "indicacoes-lista") return renderIndicacoesLista(main);
    if (nome === "indicacoes-resgate") return renderIndicacoesResgate(main);
    if (nome === "config-empresa") return renderConfigEmpresa(main);
    if (nome === "config-aparencia") return renderConfigAparencia(main);
    if (nome === "config-whatsapp") return renderConfigWhatsapp(main);
    if (nome === "config-wame") return renderConfigWame(main);
    return renderDashboard(main);
  }

  // ---------------------------------------------------------------------
  // Página: Dashboard
  // ---------------------------------------------------------------------
  // Estatísticas do topo vêm de GET /dashboard (calculadas no servidor —
  // mesma fonte de verdade usada em produção); os totais de indicação, que
  // o backend só expõe por campanha, são agregados aqui somando as listas
  // de "enviadas" de cada campanha de indicação cadastrada.
  async function carregarIndicadoresIndicacao(){
    const campanhaIds = Object.keys(state.campanhasIndicacao);
    const listas = await Promise.all(campanhaIds.map(id => api("/indicacoes/campanhas/"+id+"/enviadas").catch(()=>[])));
    const todasIndicacoes = [].concat(...listas);
    return {
      totalIndicacoesGeradas: todasIndicacoes.length,
      clientesQueIndicaram: new Set(todasIndicacoes.map(i=>i.clienteIndicadorId)).size,
    };
  }

  async function renderDashboard(main){
    setHeader("Painel", "Acompanhe toda a operação de Giftback e Indicações em um só lugar.");
    main.innerHTML = '<div class="empty">Carregando painel…</div>';
    let stats, indicados, indicIndicadores;
    try {
      [stats, indicados, indicIndicadores] = await Promise.all([
        api("/dashboard"), api("/indicacoes/indicados"), carregarIndicadoresIndicacao(),
      ]);
    } catch(err){
      if (err.status === 401) return;
      main.innerHTML = '<div class="empty">Não foi possível carregar o painel.</div>';
      return;
    }
    const envios = Object.values(state.envios);
    const vouchersEntries = Object.entries(state.vouchers);
    const agora = new Date();
    const vouchersAtivosEntries = vouchersEntries.filter(([,v]) => v.status === 'ativo' && new Date(v.validoAte) >= agora);
    const vouchersUtilizadosEntries = vouchersEntries.filter(([,v]) => v.status === 'utilizado');

    const totalIndicados = indicados.length;
    const clientesQueIndicaram = indicIndicadores.clientesQueIndicaram;
    const totalIndicacoesGeradas = indicIndicadores.totalIndicacoesGeradas;

    const ultimos = envios.sort((a,b)=> new Date(b.dataEnvio)-new Date(a.dataEnvio)).slice(0,5);
    const ultimosResgates = vouchersUtilizadosEntries
      .sort((a,b)=> new Date(b[1].dataUtilizacao)-new Date(a[1].dataUtilizacao))
      .slice(0,5);

    main.innerHTML =
      '<div class="navy-banner">' +
        bannerGroup("giftnav", "Giftback", [
          { icon: "giftnav", label: "Distribuído em Giftback", valor: reais(stats.giftbackEnviadoAcumulado) },
          { icon: "compra", label: "Estimado em vendas", valor: reais(stats.faturamentoEstimadoTotal) },
          { icon: "check", label: "Faturamento realizado", valor: reais(stats.faturamentoEfetivo) },
        ]) +
        bannerGroup("indicacoes", "Indicações", [
          { icon: "clientes", label: "Clientes que indicaram", valor: clientesQueIndicaram },
          { icon: "indicacoes", label: "Indicações geradas", valor: totalIndicacoesGeradas },
          { icon: "check", label: "Indicados confirmados", valor: totalIndicados },
        ]) +
      '</div>' +
      '<div class="eyebrow">Acompanhamento</div>' +
      '<div class="section-heading">Indicadores da rede</div>' +
      '<div class="grid kpis">' +
        kpi("clientes", "Clientes cadastrados", stats.clientesTotal, "") +
        kpi("campanhas", "Campanhas ativas", stats.campanhasAtivas, "") +
        kpi("giftnav", "Giftbacks enviados", stats.enviosTotal, stats.taxaConfirmados + "% confirmados") +
        kpi("check", "Vouchers ativos", stats.vouchersAtivos, stats.vouchersUtilizados + " já utilizados") +
        kpi("indicacoes", "Amigos indicados", totalIndicados, "") +
      '</div>' +
      '<div class="eyebrow" style="margin-top:8px;">Atalhos</div>' +
      '<div class="grid atalhos-grid">' +
        atalhoCard("campanhas", "Criar Campanha Giftback", "campanhas-criar") +
        atalhoCard("whatsapp", "Enviar Giftback", "giftback-elegiveis") +
        atalhoCard("indicacoes", "Criar Programa de Indicações", "indicacoes-criar") +
        atalhoCard("controleIndicacoes", "Solicitar Indicações", "indicacoes-consultar") +
      '</div>' +
      '<div class="section">' +
        '<div class="eyebrow">Movimentação</div>' +
        '<div class="section-head"><div class="section-title">Atividade recente</div><button class="btn btn-primary btn-sm" id="btn-nova-compra">' + ICONS.plus + ' Registrar venda</button></div>' +
        '<div class="card table-wrap">' + tabelaEnvios(ultimos, {compacta:true}) + '</div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="eyebrow">Resgates</div>' +
        '<div class="section-head"><div class="section-title">Últimas utilizações de voucher</div></div>' +
        '<div class="card table-wrap">' + tabelaResgatesRecentes(ultimosResgates) + '</div>' +
      '</div>';

    document.getElementById("btn-nova-compra").addEventListener("click", ()=>ir("vendas-nova"));
    main.querySelectorAll("[data-atalho]").forEach(btn => {
      btn.addEventListener("click", () => ir(btn.getAttribute("data-atalho")));
    });
    ligarAcoesEnvio(main);
  }
  // Card-botão de acesso rápido (seção "Atalhos" do Painel).
  function atalhoCard(icon, label, rota){
    return '<button type="button" class="atalho-card" data-atalho="'+rota+'">' +
      '<span class="atalho-icon">' + (ICONS[icon]||"") + '</span>' +
      '<span class="atalho-label">' + esc(label) + '</span>' +
    '</button>';
  }
  // Um "quadro" do banner de topo do Painel — compara as duas estratégias
  // (Giftback e Indicações) lado a lado, cada uma com 3 métricas-chave.
  function bannerGroup(icon, titulo, itens){
    return '<div class="banner-group">' +
      '<div class="banner-group-title">' + (ICONS[icon]||"") + '<span>' + esc(titulo) + '</span></div>' +
      '<div class="banner-group-stats">' +
        itens.map(it => (
          '<div class="banner-mini"><div class="banner-mini-label">' + (ICONS[it.icon]||"") + '<span>' + esc(it.label) + '</span></div>' +
          '<div class="banner-mini-value">' + it.valor + '</div></div>'
        )).join("") +
      '</div>' +
    '</div>';
  }
  function kpi(icon, label, valor, sub){
    return '<div class="stat-card"><div class="stat-card-top"><div class="stat-icon-box">' + (ICONS[icon]||"") + '</div>' +
      (sub ? '<div class="stat-trend">' + esc(sub) + '</div>' : '') + '</div>' +
      '<div><div class="stat-value">' + valor + '</div><div class="stat-label">' + esc(label) + '</div></div></div>';
  }
  function tabelaResgatesRecentes(lista){
    if (!lista.length) return '<div class="empty">Nenhum voucher utilizado ainda.</div>';
    const rows = lista.map(([envioId, v]) => {
      const envio = state.envios[envioId] || {};
      const cli = state.clientes[envio.clienteId] || {nome:"—"};
      const compra = state.compras[v.compraGeradaId];
      return '<tr>' +
        '<td><strong>'+esc(cli.nome)+'</strong></td>' +
        '<td class="mono faint">'+esc(v.codigo)+'</td>' +
        '<td><strong style="color:var(--success);">'+ (compra?reais(compra.valor):'—') +'</strong></td>' +
        '<td class="faint">'+dataHoraBR(v.dataUtilizacao)+'</td>' +
      '</tr>';
    }).join("");
    return '<table><thead><tr><th>Cliente</th><th>Voucher</th><th>Venda gerada</th><th>Utilizado em</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function campo(name, label, type, placeholder, required){
    return '<div class="field"><label>'+esc(label)+(required?' *':'')+'</label>' +
      '<input type="'+type+'" name="'+name+'" placeholder="'+esc(placeholder||"")+'" '+(required?'required':'')+'></div>';
  }
  // Igual a campo(), mas pré-preenchido com um valor atual — usado nos
  // formulários de edição (ex.: editar dados de empresa no Painel Master).
  function campoComValor(name, label, type, valor, required){
    return '<div class="field"><label>'+esc(label)+(required?' *':'')+'</label>' +
      '<input type="'+type+'" name="'+name+'" value="'+esc(valor||"")+'" '+(required?'required':'')+'></div>';
  }

  // ---------------------------------------------------------------------
  // Campo de cliente com busca (autocomplete) — substitui o <select> simples
  // quando a base de clientes pode crescer: digita o nome para filtrar, e ao
  // focar sem digitar nada já mostra os primeiros cadastrados.
  // ---------------------------------------------------------------------
  function campoAutocompleteCliente(name, label, required){
    return '<div class="field">' +
      '<label>'+esc(label)+(required?' *':'')+'</label>' +
      '<div class="autocomplete-wrap">' +
        '<input type="text" class="autocomplete-input" data-autocomplete-busca="'+name+'" placeholder="Digite o nome do cliente…" autocomplete="off">' +
        '<input type="hidden" name="'+name+'" data-autocomplete-valor="'+name+'">' +
        '<div class="autocomplete-list" data-autocomplete-lista="'+name+'" hidden></div>' +
      '</div>' +
    '</div>';
  }
  function ligarAutocompleteCliente(main, name, clientesList){
    const input = main.querySelector('[data-autocomplete-busca="'+name+'"]');
    const hidden = main.querySelector('[data-autocomplete-valor="'+name+'"]');
    const lista = main.querySelector('[data-autocomplete-lista="'+name+'"]');
    if (!input || !hidden || !lista) return;

    function renderResultados(filtro){
      const termo = (filtro||"").trim().toLowerCase();
      const resultados = termo
        ? clientesList.filter(c => c.nome.toLowerCase().includes(termo)).slice(0, 8)
        : clientesList.slice(0, 5);
      lista.innerHTML = resultados.length
        ? resultados.map(c =>
            '<button type="button" class="autocomplete-item" data-id="'+c.id+'" data-nome="'+esc(c.nome)+'">' +
              '<span class="autocomplete-item-nome">'+esc(c.nome)+'</span>' +
              '<span class="autocomplete-item-tel">'+esc(c.telefone||"")+'</span>' +
            '</button>'
          ).join("")
        : '<div class="autocomplete-empty">Nenhum cliente encontrado.</div>';
      lista.hidden = false;
      lista.querySelectorAll("[data-id]").forEach(btn => {
        // mousedown (não click) para rodar antes do blur do input, senão a
        // lista já teria sumido antes do clique ser processado.
        btn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          hidden.value = btn.getAttribute("data-id");
          input.value = btn.getAttribute("data-nome");
          lista.hidden = true;
        });
      });
    }

    input.addEventListener("focus", () => renderResultados(input.value));
    input.addEventListener("input", () => {
      hidden.value = ""; // texto mudou sem confirmar — obriga escolher de novo na lista
      renderResultados(input.value);
    });
    input.addEventListener("blur", () => {
      setTimeout(() => { lista.hidden = true; }, 120);
    });
  }

  // ---------------------------------------------------------------------
  // Seletor de emoji (busca por nome) — usado nos campos de texto de WhatsApp
  // ---------------------------------------------------------------------
  const EMOJIS = [
    {e:"😀",n:"sorriso feliz"}, {e:"😊",n:"sorriso timido"}, {e:"😄",n:"riso alegre"}, {e:"😍",n:"apaixonado encantado"},
    {e:"🥰",n:"amor carinho"}, {e:"😘",n:"beijo"}, {e:"🤩",n:"estrelado impressionado"}, {e:"😉",n:"piscada"},
    {e:"🙌",n:"comemorar maos levantadas"}, {e:"👏",n:"palmas parabens"}, {e:"👍",n:"joinha positivo ok"}, {e:"🙏",n:"obrigado gratidao por favor"},
    {e:"💪",n:"forca"}, {e:"✨",n:"brilho especial"}, {e:"🎉",n:"festa confete comemoracao"}, {e:"🎁",n:"presente giftback"},
    {e:"🎈",n:"balao festa"}, {e:"⭐",n:"estrela"}, {e:"🌟",n:"estrela brilhante"}, {e:"💖",n:"coracao brilho"},
    {e:"❤️",n:"coracao amor"}, {e:"💕",n:"coracoes"}, {e:"💗",n:"coracao crescendo"}, {e:"💯",n:"cem pontos completo"},
    {e:"🔥",n:"fogo top"}, {e:"✅",n:"confirmado check verde"}, {e:"✔️",n:"check certo"}, {e:"📌",n:"fixado importante"},
    {e:"📍",n:"localizacao endereco"}, {e:"📅",n:"calendario data"}, {e:"🗓️",n:"agenda"}, {e:"⏰",n:"despertador horario"},
    {e:"⏳",n:"tempo contando validade"}, {e:"💰",n:"dinheiro saco valor"}, {e:"💵",n:"dinheiro nota real"}, {e:"🛍️",n:"sacola compras"},
    {e:"🛒",n:"carrinho compras"}, {e:"💳",n:"cartao pagamento"}, {e:"📲",n:"celular whatsapp"}, {e:"📱",n:"celular telefone"},
    {e:"💬",n:"balao mensagem chat"}, {e:"📩",n:"mensagem recebida"}, {e:"✉️",n:"envelope carta"}, {e:"🔗",n:"link"},
    {e:"💅",n:"unha manicure"}, {e:"💄",n:"batom maquiagem"}, {e:"💇‍♀️",n:"cabelo corte salao"}, {e:"💆‍♀️",n:"massagem spa relaxar"},
    {e:"🧴",n:"produto cosmetico creme"}, {e:"🌸",n:"flor"}, {e:"🌺",n:"flor tropical"}, {e:"🥂",n:"brinde taca"},
    {e:"😎",n:"legal oculos"}, {e:"🤝",n:"aperto de mao parceria"}, {e:"👀",n:"olhos atencao"}, {e:"📈",n:"crescimento grafico"},
    {e:"🏆",n:"trofeu premio"}, {e:"🥇",n:"medalha ouro"}, {e:"💎",n:"diamante vip"}, {e:"🚀",n:"foguete rapido"},
  ];
  function botaoEmojiHtml(target){
    return '<button type="button" class="btn btn-sm btn-emoji" data-emoji-target="'+target+'">😊 Emoji</button>';
  }
  function pickerEmojiHtml(target){
    return '<div class="emoji-picker" data-emoji-picker="'+target+'" hidden>' +
      '<input type="text" class="emoji-search" placeholder="Buscar emoji por nome…" data-emoji-search="'+target+'">' +
      '<div class="emoji-grid" data-emoji-grid="'+target+'"></div>' +
    '</div>';
  }
  function ligarEmojiPicker(main, target, aposInserir){
    const btn = main.querySelector('[data-emoji-target="'+target+'"]');
    const painel = main.querySelector('[data-emoji-picker="'+target+'"]');
    const busca = main.querySelector('[data-emoji-search="'+target+'"]');
    const grid = main.querySelector('[data-emoji-grid="'+target+'"]');
    const ta = main.querySelector('textarea[name="'+target+'"]');
    if (!btn || !painel || !busca || !grid || !ta) return;

    function renderGrid(filtro){
      const termo = (filtro||"").trim().toLowerCase();
      const lista = termo ? EMOJIS.filter(x => x.n.includes(termo)) : EMOJIS;
      grid.innerHTML = lista.length
        ? lista.map(x => '<button type="button" class="emoji-opt" title="'+esc(x.n)+'" data-emoji-char="'+x.e+'">'+x.e+'</button>').join("")
        : '<div class="autocomplete-empty">Nenhum emoji encontrado.</div>';
      grid.querySelectorAll("[data-emoji-char]").forEach(op => {
        op.addEventListener("mousedown", (e) => {
          e.preventDefault();
          const pos = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
          const fim = ta.selectionEnd != null ? ta.selectionEnd : pos;
          const ch = op.getAttribute("data-emoji-char");
          ta.value = ta.value.slice(0,pos) + ch + ta.value.slice(fim);
          ta.focus();
          ta.selectionStart = ta.selectionEnd = pos + ch.length;
          if (aposInserir) aposInserir();
        });
      });
    }
    btn.addEventListener("click", () => {
      const abrir = painel.hidden;
      main.querySelectorAll(".emoji-picker").forEach(p => { p.hidden = true; });
      if (abrir){ painel.hidden = false; renderGrid(""); busca.value=""; busca.focus(); }
    });
    busca.addEventListener("input", () => renderGrid(busca.value));

    window.__ggEmojiPickers = window.__ggEmojiPickers || [];
    window.__ggEmojiPickers.push({ btn, painel });
    if (!window.__ggEmojiOutsideBound){
      window.__ggEmojiOutsideBound = true;
      document.addEventListener("mousedown", (ev) => {
        (window.__ggEmojiPickers||[]).forEach(({btn:b, painel:p}) => {
          if (!document.body.contains(p)) return; // tela trocada, elemento antigo
          if (p.hidden) return;
          if (!p.contains(ev.target) && ev.target !== b && !b.contains(ev.target)){
            p.hidden = true;
          }
        });
      });
    }
  }

  // ---------------------------------------------------------------------
  // Preview estilo WhatsApp — mostra em tempo real como a mensagem chega
  // ---------------------------------------------------------------------
  function horaAgora(){
    const d = new Date();
    return String(d.getHours()).padStart(2,'0') + ":" + String(d.getMinutes()).padStart(2,'0');
  }
  function whatsappPreviewShellHtml(target, nomeContato){
    return '<div class="wa-preview">' +
      '<div class="wa-preview-header">' +
        '<div class="wa-preview-avatar">' + ICONS.giftnav + '</div>' +
        '<div class="wa-preview-contact"><div class="wa-preview-name">'+esc(nomeContato||"Sua Clínica")+'</div><div class="wa-preview-status">online</div></div>' +
      '</div>' +
      '<div class="wa-preview-body">' +
        '<div class="wa-bubble" data-wa-preview="'+target+'"></div>' +
      '</div>' +
    '</div>';
  }
  function textoPreviewBubbleHtml(texto){
    const linhas = esc(texto||"").split("\n").join("<br>");
    return '<span class="wa-bubble-text">'+(linhas||'<span class="wa-bubble-vazio">Digite a mensagem ao lado…</span>')+'</span>' +
      '<span class="wa-bubble-meta">'+horaAgora()+' <span class="wa-bubble-check">✓✓</span></span>';
  }
  function aplicarVarsPreview(texto, vars){
    let msg = texto || "";
    Object.keys(vars).forEach(k => { msg = msg.split("{{"+k+"}}").join(vars[k]); });
    return msg;
  }

  // ---------------------------------------------------------------------
  // Importação de planilha — o parsing acontece no servidor
  // (POST /clientes/importar, /produtos/importar), não mais no navegador;
  // usado em Clientes e Produtos.
  // ---------------------------------------------------------------------
  function importCardHtml(prefixo, titulo, descricao){
    return '<div class="card">' +
      '<div class="section-title" style="margin-bottom:8px;">' + esc(titulo) + '</div>' +
      '<p class="muted" style="font-size:12px; margin:0 0 12px; line-height:1.5;">' + esc(descricao) + '</p>' +
      '<div class="field full"><input type="file" id="arquivo-'+prefixo+'" accept=".xlsx,.xls,.csv"></div>' +
      '<div class="field full" style="margin-top:8px;"><button class="btn btn-sm" id="btn-importar-'+prefixo+'" type="button">' + ICONS.upload + ' Importar planilha</button></div>' +
      '<div id="resultado-importar-'+prefixo+'" style="margin-top:10px; font-size:12.5px;"></div>' +
    '</div>';
  }
  function ligarImportacao(main, prefixo, rota, resumoTexto){
    const input = document.getElementById("arquivo-"+prefixo);
    const botao = document.getElementById("btn-importar-"+prefixo);
    const resultado = document.getElementById("resultado-importar-"+prefixo);
    if (!botao) return;
    botao.addEventListener("click", async ()=>{
      const arquivo = input.files && input.files[0];
      if (!arquivo){ toast("Escolha um arquivo .xlsx ou .csv primeiro.", "erro"); return; }
      botao.disabled = true;
      resultado.innerHTML = '<span class="faint">Importando…</span>';
      try {
        const resumo = await apiUpload(rota, arquivo);
        await carregarTudo();
        render();
        toast("Importação concluída.");
        setTimeout(()=>{
          const box = document.getElementById("resultado-importar-"+prefixo);
          if (!box) return;
          let html = '<div style="color:var(--success); font-weight:700;">' + esc(resumoTexto(resumo)) + '</div>';
          if (resumo.erros && resumo.erros.length){
            html += '<div style="color:var(--danger); margin-top:4px;">' + resumo.erros.length + ' linha(s) com problema: ' +
              esc(resumo.erros.slice(0,5).map(e=>'linha '+e.linha+' ('+e.motivo+')').join('; ')) +
              (resumo.erros.length > 5 ? '…' : '') + '</div>';
          }
          box.innerHTML = html;
        }, 0);
      } catch(err){
        botao.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível importar o arquivo."), "erro");
        resultado.innerHTML = "";
      }
    });
  }

  // ---------------------------------------------------------------------
  // Página: Clientes
  // ---------------------------------------------------------------------
  function renderClientes(main){
    setHeader("Clientes", "Base de clientes da empresa. O telefone é usado para montar o link de WhatsApp de cada giftback.");
    const lista = Object.values(state.clientes).sort((a,b)=>a.nome.localeCompare(b.nome));
    main.innerHTML =
      '<div class="grid grid-split" style="margin-bottom:16px;">' +
        '<div class="card">' +
          '<div class="section-title" style="margin-bottom:12px;">Novo cliente</div>' +
          '<form id="form-cliente" class="form-grid">' +
            campo("nome","Nome","text","Ex.: Marina Souza", true) +
            campo("telefone","WhatsApp","tel","+55 11 90000-0000", true) +
            '<div class="field full"><button class="btn btn-primary" type="submit">' + ICONS.plus + ' Adicionar cliente</button></div>' +
          '</form>' +
        '</div>' +
        importCardHtml("clientes", "Importar clientes por planilha",
          "Colunas aceitas: Nome, WhatsApp e (opcional) Produtos que já consome — nomes separados por vírgula. " +
          "Produtos citados que ainda não existem são cadastrados automaticamente.") +
      '</div>' +
      '<div class="card table-wrap">' +
        (lista.length ? (
          '<table><thead><tr><th>Nome</th><th>WhatsApp</th><th>Produtos que já consome</th><th></th></tr></thead><tbody>' +
          lista.map(c => {
            const produtosCliente = c.produtosConsumidos || [];
            return '<tr><td><strong>'+esc(c.nome)+'</strong></td><td class="mono">'+esc(c.telefone)+'</td>' +
              '<td class="muted">' + (produtosCliente.length ? esc(produtosCliente.join(", ")) : '<span class="faint">nenhum ainda</span>') + '</td>' +
              '<td><button class="btn btn-ghost btn-sm" data-hist="'+c.id+'">Ver histórico</button></td></tr>';
          }).join("") + '</tbody></table>'
        ) : '<div class="empty">Nenhum cliente cadastrado ainda.</div>') +
      '</div>';

    main.querySelectorAll("[data-hist]").forEach(b => b.addEventListener("click", ()=> ir("giftback-controle/"+b.getAttribute("data-hist"))));
    document.getElementById("form-cliente").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const nome = fd.get("nome").trim(), telefone = fd.get("telefone").trim();
      if (!nome || !telefone) return;
      try {
        await api("/clientes", { method:"POST", body:{ nome, telefone } });
        await carregarTudo();
        render();
        toast("Cliente adicionado.");
      } catch(err){ if (err.status!==401) toast(mensagemErro(err), "erro"); }
    });
    ligarImportacao(main, "clientes", "/clientes/importar", (resumo)=>{
      const partes = [resumo.clientesCriados + " cliente(s) novo(s)", resumo.clientesAtualizados + " atualizado(s)"];
      if (resumo.produtosCriados) partes.push(resumo.produtosCriados + " produto(s) novo(s) cadastrado(s) automaticamente");
      return partes.join(", ") + ".";
    });
  }

  // ---------------------------------------------------------------------
  // Página: Produtos
  // ---------------------------------------------------------------------
  function renderProdutos(main){
    setHeader("Produtos", "Catálogo de serviços que podem ser produto-gatilho, produto-alvo, ou ambos, dentro das campanhas de giftback.");
    const lista = Object.values(state.produtos).sort((a,b)=>a.nome.localeCompare(b.nome));
    main.innerHTML =
      '<div class="grid grid-split" style="margin-bottom:16px;">' +
        '<div class="card">' +
          '<div class="section-title" style="margin-bottom:12px;">Novo produto</div>' +
          '<form id="form-produto" class="form-grid">' +
            campo("nome","Nome do produto","text","Ex.: Drenagem Linfática", true) +
            campo("categoria","Categoria","text","Ex.: Procedimento estético", false) +
            '<div class="field full"><button class="btn btn-primary" type="submit">' + ICONS.plus + ' Adicionar produto</button></div>' +
          '</form>' +
        '</div>' +
        importCardHtml("produtos", "Importar produtos por planilha",
          "Colunas aceitas: Nome e (opcional) Categoria. Produtos já cadastrados (mesmo nome) só têm a categoria atualizada.") +
      '</div>' +
      '<div class="card table-wrap">' +
        (lista.length ? (
          '<table><thead><tr><th>Produto</th><th>Categoria</th><th>Usado como gatilho em</th><th>Usado como alvo em</th></tr></thead><tbody>' +
          lista.map(p => {
            return '<tr><td><strong>'+esc(p.nome)+'</strong></td><td class="muted">'+esc(p.categoria||"—")+'</td>' +
              '<td class="muted">'+(p.comoGatilho||0)+' campanha(s)</td><td class="muted">'+(p.comoAlvo||0)+' campanha(s)</td></tr>';
          }).join("") + '</tbody></table>'
        ) : '<div class="empty">Nenhum produto cadastrado ainda.</div>') +
      '</div>';

    document.getElementById("form-produto").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const nome = fd.get("nome").trim(), categoria = fd.get("categoria").trim();
      if (!nome) return;
      try {
        await api("/produtos", { method:"POST", body:{ nome, categoria } });
        await carregarTudo();
        render();
        toast("Produto adicionado.");
      } catch(err){ if (err.status!==401) toast(mensagemErro(err), "erro"); }
    });
    ligarImportacao(main, "produtos", "/produtos/importar", (resumo)=>{
      return resumo.criados + " produto(s) novo(s), " + resumo.atualizados + " atualizado(s).";
    });
  }

  // ---------------------------------------------------------------------
  // Página: Campanhas → Consultar Campanhas
  // ---------------------------------------------------------------------
  let campanhasExpandidas = new Set();
  let enviosRecentesPorCampanha = {}; // { campanhaId: { clienteId: {mensagem, link} } }
  let elegiveisPorCampanha = {}; // cache local: { campanhaId: [ {clienteId, compraId, nome, telefone}, ... ] }, vindo de GET /campanhas/:id/elegiveis

  function renderCampanhasConsultar(main){
    setHeader("Consultar Giftback", "Cada campanha liga um produto-gatilho a um produto-alvo, com mensagem, regras, compra mínima e validade já definidas — prontas para disparo.",
      '<button class="btn header-btn btn-sm" id="btn-ir-criar-campanha">' + ICONS.plus + ' Criar campanha</button>');
    const lista = Object.values(state.campanhas);

    main.innerHTML =
      '<div class="section">' +
        '<div class="section-head"><div class="section-title">Mix de campanhas cadastradas</div></div>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fill, minmax(280px,1fr));">' +
          (lista.length ? lista.map(campanhaCardHtml).join("") : '<div class="card empty">Nenhuma campanha cadastrada ainda.</div>') +
        '</div>' +
      '</div>';

    document.getElementById("btn-ir-criar-campanha").addEventListener("click", ()=>ir("campanhas-criar"));

    main.querySelectorAll("[data-toggle-campanha]").forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-toggle-campanha");
        if (campanhasExpandidas.has(id)){
          campanhasExpandidas.delete(id);
        } else {
          campanhasExpandidas.add(id);
          if (!elegiveisPorCampanha[id]){
            try { elegiveisPorCampanha[id] = await api("/campanhas/"+id+"/elegiveis"); }
            catch(err){ if (err.status!==401){ toast(mensagemErro(err), "erro"); elegiveisPorCampanha[id] = []; } }
          }
        }
        renderCampanhasConsultar(main);
      });
    });
    ligarAcoesEnviosCampanha(main);
  }

  // ---------------------------------------------------------------------
  // Página: Campanhas → Criar Campanha
  //
  // NOTA DE INTEGRAÇÃO: o protótipo original permitia escolher VÁRIOS
  // produtos-alvo de uma vez (campo multi-select "alvos", criando uma
  // campanha por alvo). O backend real (POST /api/campanhas, ver
  // routes/campanhas.js) só aceita UM produtoAlvoId por campanha — por isso
  // este formulário usa um <select> simples para o alvo, igual ao gatilho.
  // O multi-select e seus componentes (campoMultiSelectProdutos /
  // ligarMultiSelectProdutos) não são usados em nenhuma outra tela.
  // ---------------------------------------------------------------------
  function renderCampanhasCriar(main){
    setHeader("Campanha Giftback", "Defina o produto-gatilho, o produto-alvo, o valor do giftback e a mensagem de WhatsApp para o cliente.");
    const produtos = Object.values(state.produtos).sort((a,b)=>a.nome.localeCompare(b.nome));
    const opcoesProduto = produtos.map(p=>'<option value="'+p.id+'">'+esc(p.nome)+'</option>').join("");

    main.innerHTML =
      '<div class="section">' +
        '<div class="card">' +
          '<div class="section-title" style="margin-bottom:12px;">Campanha Giftback</div>' +
          '<form id="form-campanha" class="form-grid">' +
            campo("titulo","Título da campanha","text","Ex.: Botox → Limpeza de Pele", true) +
            '<div class="field"><label>Produto-gatilho *</label><select name="gatilho" required><option value="">Selecione…</option>'+opcoesProduto+'</select><div class="hint">Produto cuja compra dispara a oferta.</div></div>' +
            '<div class="field"><label>Produto-alvo *</label><select name="alvo" required><option value="">Selecione…</option>'+opcoesProduto+'</select><div class="hint">Produto que o giftback oferece (não pode ser igual ao gatilho).</div></div>' +
            '<div class="field"><label>Valor do giftback (R$) *</label><input type="number" name="valor" min="0" step="0.01" required placeholder="200,00"></div>' +
            '<div class="field"><label>Compra mínima exigida (R$)</label><input type="number" name="valorMinimo" min="0" step="0.01" placeholder="150,00"><div class="hint">Valor mínimo de venda para o cliente poder usar este giftback.</div></div>' +
            '<div class="field"><label>Validade (dias após confirmação) *</label><input type="number" name="validade" min="1" step="1" required placeholder="15"></div>' +
            '<div class="field full">' +
              '<label>Texto da mensagem de WhatsApp (para o cliente) *</label>' +
              '<div class="grid grid-split msg-editor-grid">' +
                '<div class="msg-editor-col">' +
                  '<div class="msg-toolbar">' + botaoEmojiHtml("mensagem") + '</div>' +
                  '<textarea name="mensagem" required placeholder="Oi {{nome_cliente}}! ...">Oi {{nome_cliente}}! Como agradecimento pelo seu {{produto_gatilho}}, você ganhou um Giftback de {{valor_giftback}} para {{produto_alvo}}, válido por {{validade_dias}} dias após a confirmação. Ativa aqui: {{link_resgate}} 🎁</textarea>' +
                  pickerEmojiHtml("mensagem") +
                  '<div class="var-chips">' + ['nome_cliente','produto_gatilho','produto_alvo','valor_giftback','validade_dias','link_resgate'].map(v=>'<span class="var-chip" data-var="'+v+'" data-target="mensagem">{{'+v+'}}</span>').join("") + '</div>' +
                '</div>' +
                '<div class="msg-preview-col">' + whatsappPreviewShellHtml("mensagem") + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="field full"><label>Regras de uso</label><textarea name="regras" placeholder="Ex.: válido uma vez por cliente, não cumulativo com outras promoções."></textarea></div>' +
            '<div class="field full">' +
              '<label>Mensagem de retorno (o cliente envia isso ao estabelecimento após confirmar)</label>' +
              '<div class="grid grid-split msg-editor-grid">' +
                '<div class="msg-editor-col">' +
                  '<div class="msg-toolbar">' + botaoEmojiHtml("mensagemRetorno") + '</div>' +
                  '<textarea name="mensagemRetorno" placeholder="Obrigado pelo Giftback...">Oi! Aqui é {{nome_cliente}}. Obrigado pelo Giftback, foi resgatado com sucesso! Código {{codigo_voucher}}. Quero agendar meu procedimento de {{produto_alvo}} para: 💬</textarea>' +
                  pickerEmojiHtml("mensagemRetorno") +
                  '<div class="var-chips">' + ['nome_cliente','produto_alvo','valor_giftback','codigo_voucher'].map(v=>'<span class="var-chip" data-var="'+v+'" data-target="mensagemRetorno">{{'+v+'}}</span>').join("") + '</div>' +
                '</div>' +
                '<div class="msg-preview-col">' + whatsappPreviewShellHtml("mensagemRetorno", "Cliente") + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="field full">' +
              '<label class="checkbox-row"><input type="checkbox" name="permiteReenvio" id="chk-reenvio"> Permitir reenvio desta campanha ao mesmo cliente</label>' +
            '</div>' +
            '<div class="field" id="campo-intervalo" style="display:none;"><label>Intervalo mínimo entre reenvios (dias)</label><input type="number" name="intervalo" min="1" step="1" placeholder="30"></div>' +
            '<div class="field full"><button class="btn btn-primary" type="submit">' + ICONS.plus + ' Criar campanha</button></div>' +
          '</form>' +
        '</div>' +
      '</div>';

    const form = document.getElementById("form-campanha");
    const gatilhoSelect = form.querySelector('select[name="gatilho"]');
    const alvoSelect = form.querySelector('select[name="alvo"]');

    function atualizarPreviews(){
      const valorInput = parseFloat(form.querySelector('input[name="valor"]').value);
      const validadeVal = form.querySelector('input[name="validade"]').value;
      const vars = {
        nome_cliente: "Marina",
        produto_gatilho: (state.produtos[gatilhoSelect.value]||{}).nome || "Botox",
        produto_alvo: (state.produtos[alvoSelect.value]||{}).nome || "Limpeza de Pele",
        valor_giftback: (isFinite(valorInput) && valorInput>0) ? reais(valorInput) : "R$ 200,00",
        validade_dias: validadeVal || "15",
        link_resgate: linkPublico("resgate/abc123"),
        codigo_voucher: "GB-AB12CD",
      };
      const elMsg = main.querySelector('[data-wa-preview="mensagem"]');
      const elRet = main.querySelector('[data-wa-preview="mensagemRetorno"]');
      const taMsg = form.querySelector('textarea[name="mensagem"]');
      const taRet = form.querySelector('textarea[name="mensagemRetorno"]');
      if (elMsg) elMsg.innerHTML = textoPreviewBubbleHtml(aplicarVarsPreview(taMsg.value, vars));
      if (elRet) elRet.innerHTML = textoPreviewBubbleHtml(aplicarVarsPreview(taRet.value, vars));
    }

    gatilhoSelect.addEventListener("change", atualizarPreviews);
    alvoSelect.addEventListener("change", atualizarPreviews);
    form.querySelector('input[name="valor"]').addEventListener("input", atualizarPreviews);
    form.querySelector('input[name="validade"]').addEventListener("input", atualizarPreviews);
    form.querySelector('textarea[name="mensagem"]').addEventListener("input", atualizarPreviews);
    form.querySelector('textarea[name="mensagemRetorno"]').addEventListener("input", atualizarPreviews);
    ligarEmojiPicker(main, "mensagem", atualizarPreviews);
    ligarEmojiPicker(main, "mensagemRetorno", atualizarPreviews);

    const chk = document.getElementById("chk-reenvio");
    chk.addEventListener("change", ()=>{ document.getElementById("campo-intervalo").style.display = chk.checked ? "" : "none"; });
    main.querySelectorAll(".var-chip").forEach(chip => {
      chip.addEventListener("click", ()=>{
        const ta = main.querySelector('textarea[name="'+chip.getAttribute("data-target")+'"]');
        const pos = ta.selectionStart || ta.value.length;
        const ins = "{{"+chip.getAttribute("data-var")+"}}";
        ta.value = ta.value.slice(0,pos) + ins + ta.value.slice(pos);
        ta.focus();
        atualizarPreviews();
      });
    });

    atualizarPreviews();

    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const gatilho = fd.get("gatilho"), alvo = fd.get("alvo");
      if (!gatilho || !alvo){ toast("Selecione o produto-gatilho e o produto-alvo.", 'erro'); return; }
      if (gatilho === alvo){ toast("O produto-alvo precisa ser diferente do produto-gatilho.", 'erro'); return; }
      const permite = !!fd.get("permiteReenvio");
      try {
        await api("/campanhas", { method:"POST", body:{
          titulo: fd.get("titulo").trim(), produtoGatilhoId: gatilho, produtoAlvoId: alvo,
          valor: fd.get("valor"), valorMinimo: fd.get("valorMinimo"),
          mensagem: fd.get("mensagem"), regras: fd.get("regras"), mensagemRetorno: fd.get("mensagemRetorno"),
          validade: fd.get("validade"), permiteReenvio: permite, intervalo: fd.get("intervalo"),
        }});
        await carregarTudo();
        toast("Campanha criada.");
        ir("campanhas-consultar");
      } catch(err){ if (err.status!==401) toast(mensagemErro(err), "erro"); }
    });
  }

  function campanhaCardHtml(c){
    const gat = (state.produtos[c.produtoGatilhoId]||{}).nome || "?";
    const alv = (state.produtos[c.produtoAlvoId]||{}).nome || "?";
    const expandido = campanhasExpandidas.has(c.id);
    return '<div class="campaign-card"' + (expandido ? ' style="grid-column:1/-1;"' : '') + '>' +
      '<div class="campaign-flow">' + esc(gat) + ' <span class="arrow">→</span> ' + esc(alv) + '</div>' +
      '<div class="muted" style="font-size:12.5px;">' + esc(c.titulo) + '</div>' +
      '<div class="campaign-meta">' +
        '<span class="pill-value">' + reais(c.valor) + '</span>' +
        (c.valorMinimoCompra ? '<span>Compra mínima: ' + reais(c.valorMinimoCompra) + '</span>' : '') +
        '<span>Validade: ' + c.validadeDias + ' dias</span>' +
        '<span>' + (c.permiteReenvio ? 'Reenvio a cada ' + c.intervaloReenvioDias + ' dias' : 'Envio único por cliente') + '</span>' +
      '</div>' +
      '<div class="btn-row"><button class="btn btn-sm" data-toggle-campanha="'+c.id+'">' + (expandido ? 'Ocultar clientes elegíveis' : 'Ver clientes elegíveis') + '</button></div>' +
      (expandido ? painelClientesCampanha(c) : '') +
    '</div>';
  }

  function painelClientesCampanha(campanha){
    const elegiveis = elegiveisPorCampanha[campanha.id] || [];
    const recentes = enviosRecentesPorCampanha[campanha.id] || {};
    const idsElegiveis = new Set(elegiveis.map(e=>e.clienteId));
    const extras = Object.keys(recentes).filter(cid => !idsElegiveis.has(cid))
      .map(cid => ({ clienteId:cid, compraId:null, nome:(state.clientes[cid]||{}).nome, telefone:(state.clientes[cid]||{}).telefone }));
    const linhas = elegiveis.concat(extras);

    if (!linhas.length){
      return '<div class="empty" style="padding:16px 6px;">Nenhum cliente elegível agora — todos que compraram o produto-gatilho já foram convertidos ou já receberam esta campanha.</div>';
    }
    const rows = linhas.map((l) => {
      const enviado = recentes[l.clienteId];
      if (enviado){
        return '<tr><td colspan="3">' +
          '<div class="msg-preview" style="margin:4px 0;">' + esc(enviado.mensagem) + '</div>' +
          wameAvisoEnvioHtml(enviado.envioAutomatico) +
          '<div class="btn-row">' +
            '<a class="btn btn-primary btn-sm" href="'+esc(enviado.link)+'" target="_blank" rel="noopener">' + ICONS.whatsapp + ' Abrir WhatsApp</a>' +
            '<button class="btn btn-sm" data-copy="'+esc(enviado.link)+'">' + ICONS.copy + ' Copiar link</button>' +
          '</div>' +
        '</td></tr>';
      }
      return '<tr>' +
        '<td><strong>'+esc(l.nome)+'</strong></td>' +
        '<td class="faint mono">'+esc(l.telefone)+'</td>' +
        '<td><button class="btn btn-primary btn-sm" data-enviar-campanha="'+campanha.id+'" data-cliente-campanha="'+l.clienteId+'" data-compra-campanha="'+(l.compraId||"")+'">' + ICONS.whatsapp + ' Enviar giftback</button></td>' +
      '</tr>';
    }).join("");
    return '<div class="table-wrap" style="margin-top:6px;"><table><thead><tr><th>Cliente</th><th>WhatsApp</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  function ligarAcoesEnviosCampanha(main){
    main.querySelectorAll("[data-enviar-campanha]").forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const campanhaId = btn.getAttribute("data-enviar-campanha");
        const clienteId = btn.getAttribute("data-cliente-campanha");
        const compraId = btn.getAttribute("data-compra-campanha");
        if (!compraId){ toast("Não encontrei a compra de origem deste cliente.", "erro"); return; }
        btn.disabled = true;
        try {
          const { mensagem, link, envioAutomatico } = await api("/campanhas/"+campanhaId+"/enviar", { method:"POST", body:{ clienteId, compraId } });
          enviosRecentesPorCampanha[campanhaId] = enviosRecentesPorCampanha[campanhaId] || {};
          enviosRecentesPorCampanha[campanhaId][clienteId] = { mensagem, link, envioAutomatico };
          await carregarTudo();
          renderCampanhasConsultar(document.getElementById("main"));
          wameToastEnvio(envioAutomatico, "Giftback", (state.clientes[clienteId]||{}).nome);
        } catch(err){
          btn.disabled = false;
          if (err.status!==401) toast(mensagemErro(err), "erro");
        }
      });
    });
    main.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", ()=> copiar(btn.getAttribute("data-copy")));
    });
  }

  // ---------------------------------------------------------------------
  // Página: Configurações → Dados da empresa
  // ---------------------------------------------------------------------
  function renderConfigEmpresa(main){
    setHeader("Dados da empresa", "Nome/marca exibido ao cliente e o WhatsApp de contato usado na mensagem de retorno após o resgate.");
    const cfg = configEmpresa();

    main.innerHTML =
      '<div class="section">' +
        '<div class="card" style="max-width:520px;">' +
          '<div class="section-title" style="margin-bottom:12px;">Dados da empresa</div>' +
          '<form id="form-config-empresa" class="form-grid">' +
            '<div class="field full"><label>Nome ou Marca (aparece para o cliente) *</label><input type="text" name="nomeEmpresa" required placeholder="Ex.: Clínica Bella Estética" value="'+esc(cfg.nomeEmpresa||"")+'"></div>' +
            '<div class="field full"><label>WhatsApp de contato e retorno *</label><input type="tel" name="whatsapp" required placeholder="+55 11 90000-0000" value="'+esc(cfg.whatsapp||"")+'"><div class="hint">Para onde o cliente é direcionado, com a mensagem de retorno, depois de confirmar o resgate.</div></div>' +
            '<div class="field full"><label>Instagram</label><input type="text" name="instagram" placeholder="@seuestabelecimento ou link do perfil" value="'+esc(cfg.instagram||"")+'"><div class="hint">Usado no convite "Já segue nosso perfil no Instagram?" exibido ao cliente nas páginas de giftback e indicação.</div></div>' +
            '<div class="field full"><button class="btn btn-primary" type="submit">Salvar</button></div>' +
          '</form>' +
        '</div>' +
      '</div>';

    document.getElementById("form-config-empresa").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api("/config/empresa", { method:"PUT", body:{
          nomeEmpresa: fd.get("nomeEmpresa").trim(),
          whatsapp: fd.get("whatsapp").trim(),
          instagram: fd.get("instagram").trim(),
        }});
        await carregarTudo();
        render();
        toast("Dados da empresa salvos.");
      } catch(err){ if (err.status!==401) toast(mensagemErro(err), "erro"); }
    });
  }

  // ---------------------------------------------------------------------
  // Configurações → Aparência: paleta de cores, seletor manual/conta-gotas
  // e upload de logo (recortado e redimensionado para 800×800 no cliente).
  // ---------------------------------------------------------------------
  const PALETA_CORES = [
    "#1a264b","#0e1730","#2b6fb0","#1f8a5f","#b9750a","#c0392b",
    "#7c3aed","#db2777","#0891b2","#059669","#ea580c","#4338ca",
    "#111827","#6b7280",
  ];
  function corTextoLegivel(hex){
    const h = (hex||"").replace('#','');
    if (h.length !== 6) return '#ffffff';
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    if ([r,g,b].some(isNaN)) return '#ffffff';
    const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
    return lum > 0.6 ? '#141b33' : '#ffffff';
  }
  function redimensionarImagemQuadrada(file, tamanho){
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
      leitor.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Arquivo não é uma imagem válida."));
        img.onload = () => {
          const lado = Math.min(img.width, img.height);
          const sx = (img.width - lado) / 2, sy = (img.height - lado) / 2;
          const canvas = document.createElement("canvas");
          canvas.width = tamanho; canvas.height = tamanho;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0,0,tamanho,tamanho);
          ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tamanho, tamanho);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(file);
    });
  }
  function logoTagPreview(logoUrl){
    if (logoUrl) return '<img class="redeem-logo redeem-logo-custom" src="'+esc(logoUrl)+'" alt="Logo">';
    return LOGO_TAG;
  }
  function previewAparenciaHtml(cor, logoUrl, nomeEmpresa, instagram){
    const alvoExemplo = addDias(new Date().toISOString(), 3);
    return '<div class="redeem-wrap" style="--navy:'+esc(cor)+'; padding:0;"><div class="redeem-card">' +
      '<div class="redeem-badge">' + ICONS.check + '</div>' +
      '<div class="redeem-title">Giftback já ativado ✓</div>' +
      '<p class="muted" style="font-size:13.5px;">Oi Marina, seu voucher para <strong>Botox</strong> está pronto para uso.</p>' +
      '<div class="voucher-code">GB-8F2K91</div>' +
      '<p class="faint">Válido até 20/10/2026. Apresente este código na recepção.</p>' +
      cronometroHtml(alvoExemplo, "Tempo restante para resgate") +
      '<a class="btn btn-primary" style="width:100%; justify-content:center; padding:12px; margin-top:14px; text-decoration:none; pointer-events:none;">' + ICONS.whatsapp + ' Agendar</a>' +
      construirRodapeConfianca(nomeEmpresa, logoUrl, instagram) +
      '<a class="back-link" href="javascript:void(0)" style="pointer-events:none;">← Voltar ao painel interno (visão do atendente)</a>' +
    '</div></div>';
  }
  function renderConfigAparencia(main){
    setHeader("Aparência", "Cor principal e logo usadas nas páginas de giftback e indicação exibidas ao cliente (variáveis {{cores}} e {{logo}}).");
    const cfg = configEmpresa();
    let corSelecionada = cfg.corPrincipal || "#7c3aed";
    let logoSelecionada = cfg.logoUrl || "";
    const eyedropperDisponivel = typeof window.EyeDropper === "function";

    main.innerHTML =
      '<div class="grid grid-split aparencia-layout">' +
        '<div class="aparencia-col-form">' +
          '<div class="section">' +
            '<div class="card">' +
              '<div class="section-title" style="margin-bottom:4px;">Cor principal</div>' +
              '<p class="muted" style="font-size:12.5px; margin:0 0 14px;">Usada nos botões e destaques das páginas de giftback e indicação exibidas ao cliente.</p>' +
              '<div class="cor-swatches" id="cor-swatches">' +
                PALETA_CORES.map(c => '<button type="button" class="cor-swatch'+(c.toLowerCase()===corSelecionada.toLowerCase()?' is-selected':'')+'" style="background:'+c+';" data-cor="'+c+'" title="'+c+'" aria-label="'+c+'"></button>').join("") +
              '</div>' +
              '<div class="cor-manual-row">' +
                '<label class="cor-picker-label" title="Roda de cores">' +
                  '<input type="color" id="cor-picker" value="'+(/^#([0-9a-f]{6})$/i.test(corSelecionada)?corSelecionada:'#7c3aed')+'">' +
                '</label>' +
                '<input type="text" id="cor-hex" class="cor-hex-input" value="'+esc(corSelecionada)+'" placeholder="#1A264B" maxlength="7">' +
                (eyedropperDisponivel ? '<button type="button" class="btn btn-sm" id="btn-eyedropper">' + ICONS.aparencia + ' Conta-gotas</button>' : '') +
              '</div>' +
              '<div class="cor-preview-row">' +
                '<span class="muted" style="font-size:12px;">Pré-visualização:</span>' +
                '<button type="button" class="btn cor-preview-btn" id="cor-preview-btn" style="background:'+corSelecionada+'; color:'+corTextoLegivel(corSelecionada)+';">Botão de exemplo</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="section">' +
            '<div class="card">' +
              '<div class="section-title" style="margin-bottom:4px;">Logo</div>' +
              '<p class="muted" style="font-size:12.5px; margin:0 0 14px;">Recomendado: imagem quadrada, 800×800px — é recortada e redimensionada automaticamente.</p>' +
              '<div class="logo-upload-row">' +
                '<div class="logo-preview" id="logo-preview">' + (logoSelecionada ? '<img src="'+esc(logoSelecionada)+'" alt="Logo">' : '<span class="logo-preview-vazio">Sem logo</span>') + '</div>' +
                '<div class="logo-upload-actions">' +
                  '<label class="btn btn-sm" for="input-logo">' + ICONS.upload + ' Enviar logo</label>' +
                  '<input type="file" id="input-logo" accept="image/*" hidden>' +
                  '<button type="button" class="btn btn-sm btn-ghost" id="btn-remover-logo"'+(logoSelecionada?'':' disabled')+'>Remover logo</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="btn-row" style="margin-top:4px;">' +
            '<button type="button" class="btn btn-primary" id="btn-salvar-aparencia">' + ICONS.check.replace('width="26" height="26"','width="14" height="14"').replace('stroke="white"','stroke="currentColor"') + ' Salvar aparência</button>' +
          '</div>' +
        '</div>' +
        '<div class="aparencia-col-preview">' +
          '<div class="eyebrow" style="margin-bottom:10px;">Como o cliente vai ver</div>' +
          '<div class="phone-frame"><div class="phone-notch"></div><div class="phone-screen" id="aparencia-preview-mount"></div></div>' +
        '</div>' +
      '</div>';

    const hexInput = document.getElementById("cor-hex");
    const colorPicker = document.getElementById("cor-picker");
    const previewBtn = document.getElementById("cor-preview-btn");
    const previewMount = document.getElementById("aparencia-preview-mount");

    function atualizarPreviewAparencia(){
      previewMount.innerHTML = previewAparenciaHtml(corSelecionada, logoSelecionada, cfg.nomeEmpresa, cfg.instagram);
    }
    atualizarPreviewAparencia();
    ligarCronometro();

    function aplicarCor(cor, origem){
      corSelecionada = cor;
      main.querySelectorAll(".cor-swatch").forEach(sw => {
        sw.classList.toggle("is-selected", sw.getAttribute("data-cor").toLowerCase() === cor.toLowerCase());
      });
      if (origem !== "hex") hexInput.value = cor;
      if (origem !== "picker" && /^#([0-9a-f]{6})$/i.test(cor)) colorPicker.value = cor;
      previewBtn.style.background = cor;
      previewBtn.style.color = corTextoLegivel(cor);
      atualizarPreviewAparencia();
    }

    main.querySelectorAll(".cor-swatch").forEach(sw => {
      sw.addEventListener("click", () => aplicarCor(sw.getAttribute("data-cor")));
    });
    colorPicker.addEventListener("input", () => aplicarCor(colorPicker.value, "picker"));
    hexInput.addEventListener("input", () => {
      const v = hexInput.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) aplicarCor(v, "hex");
    });
    if (eyedropperDisponivel){
      document.getElementById("btn-eyedropper").addEventListener("click", async () => {
        try {
          const ed = new window.EyeDropper();
          const resultado = await ed.open();
          if (resultado && resultado.sRGBHex) aplicarCor(resultado.sRGBHex);
        } catch(err){ /* usuário cancelou a seleção — nada a fazer */ }
      });
    }

    const inputLogo = document.getElementById("input-logo");
    const logoPreview = document.getElementById("logo-preview");
    const btnRemoverLogo = document.getElementById("btn-remover-logo");
    inputLogo.addEventListener("change", async () => {
      const file = inputLogo.files && inputLogo.files[0];
      if (!file) return;
      try {
        const dataUrl = await redimensionarImagemQuadrada(file, 800);
        logoSelecionada = dataUrl;
        logoPreview.innerHTML = '<img src="'+esc(dataUrl)+'" alt="Logo">';
        btnRemoverLogo.disabled = false;
        atualizarPreviewAparencia();
      } catch(err){
        toast(mensagemErro(err, "Não foi possível processar essa imagem."), 'erro');
      }
    });
    btnRemoverLogo.addEventListener("click", () => {
      logoSelecionada = "";
      logoPreview.innerHTML = '<span class="logo-preview-vazio">Sem logo</span>';
      btnRemoverLogo.disabled = true;
      inputLogo.value = "";
      atualizarPreviewAparencia();
    });

    const btnSalvarAparencia = document.getElementById("btn-salvar-aparencia");
    btnSalvarAparencia.addEventListener("click", async () => {
      btnSalvarAparencia.disabled = true;
      try {
        await api("/config/empresa", { method:"PUT", body:{
          corPrincipal: corSelecionada,
          logoUrl: logoSelecionada,
        }});
        await carregarTudo();
        toast("Aparência salva.");
      } catch(err){
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível salvar a aparência."), "erro");
      } finally {
        btnSalvarAparencia.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------
  // Integração WAME — envio automático + tela Configurações → Conexão
  // WhatsApp. Quando a empresa tem o número conectado na WAME, os botões de
  // envio de giftback/indicação mandam a mensagem sozinhos pelo servidor; sem
  // WAME (ou com falha), seguem abrindo o link wa.me como antes.
  // ---------------------------------------------------------------------
  function wameAtiva(){
    return !!(state.wame && state.wame.configurado && state.wame.status === "conectado");
  }
  // Com envio manual, a aba do WhatsApp precisa ser aberta AINDA dentro do
  // clique (senão o navegador bloqueia o pop-up). Com a WAME ativa não abre
  // nada — a mensagem sai pelo servidor.
  function wameAbrirAbaSeManual(){
    return wameAtiva() ? null : window.open("", "_blank");
  }
  // Depois da resposta do servidor: se a WAME enviou, fecha a aba (se houver);
  // se não, leva a aba (ou uma nova) para o link wa.me de sempre.
  function wameConcluirEnvio(aba, resp){
    const auto = resp && resp.envioAutomatico;
    if (auto && auto.enviado){ if (aba) aba.close(); return; }
    if (!resp || !resp.link){ if (aba) aba.close(); return; }
    if (aba) aba.location.href = resp.link;
    else window.open(resp.link, "_blank", "noopener");
  }
  function wameToastEnvio(auto, oque, nome){
    const quem = nome ? " para " + nome : "";
    if (!auto) return toast(oque + " enviado" + quem + ".");
    if (auto.enviado) return toast(oque + " enviado" + quem + " pelo WhatsApp automaticamente.");
    toast((auto.erro || "O envio automático falhou.") + " Use o botão Abrir WhatsApp para enviar manualmente.", "erro");
  }
  function wameAvisoEnvioHtml(auto){
    if (!auto) return '';
    if (auto.enviado){
      return '<div style="font-size:12.5px; font-weight:700; color:var(--accent-dark); margin:6px 0;">✓ Enviado automaticamente pelo WhatsApp</div>';
    }
    return '<div style="font-size:12.5px; color:var(--danger); margin:6px 0;">Não foi enviado automaticamente: ' + esc(auto.erro || "erro desconhecido") + ' Envie pelo botão abaixo.</div>';
  }

  const WAME_STATUS_INFO = {
    conectado: { label: "Conectado", badge: "b-confirmado" },
    aguardando_qr: { label: "Aguardando leitura do QR Code", badge: "b-visualizado" },
    desconectado: { label: "Número desconectado", badge: "b-cancelado" },
    erro: { label: "Erro de comunicação", badge: "b-expirado" },
  };
  const WAME_MSG_STATUS = {
    pendente: { label: "Enviando", badge: "b-enviado" },
    enviada: { label: "Enviada", badge: "b-enviado" },
    entregue: { label: "Entregue", badge: "b-visualizado" },
    lida: { label: "Lida", badge: "b-confirmado" },
    falhou: { label: "Falhou", badge: "b-expirado" },
    recebida: { label: "Recebida", badge: "b-ativo" },
  };
  const WAME_ORIGEM = { giftback: "Giftback", indicacao: "Indicação", teste: "Teste", cliente: "Cliente" };
  let wameQrTimer = null;

  async function renderConfigWame(main){
    setHeader("Conexão WhatsApp", "Conecte o WhatsApp da sua empresa para enviar giftbacks e convites de indicação automaticamente e acompanhar as respostas dos clientes.");
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    try { state.wame = await api("/config/wame?atualizar=1"); }
    catch(err){
      if (err.status === 401) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar a conexão. ' + esc(mensagemErro(err)) + '</div>';
      return;
    }
    wameRenderizarTela(main);
  }

  function wameRenderizarTela(main){
    const c = state.wame || { configurado:false };
    if (!c.configurado){
      main.innerHTML = '<div class="section">' + wameCardChaveHtml(false) + '</div>';
      wameLigarFormChave(main);
      return;
    }
    main.innerHTML = '<div class="section">' + wameCardStatusHtml(c) + '</div>' +
      '<div class="section">' +
        '<div class="card" style="max-width:900px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">' +
            '<div class="section-title" style="margin:0;">Mensagens recentes</div>' +
            '<button class="btn btn-sm" id="btn-wame-msgs-atualizar" type="button">' + ICONS.sync + ' Atualizar</button>' +
          '</div>' +
          '<div id="wame-mensagens"><div class="empty" style="padding:14px 6px;">Carregando…</div></div>' +
        '</div>' +
      '</div>';
    wameLigarAcoes(main);
    wameCarregarMensagens();
  }

  function wameCardChaveHtml(trocando){
    return '<div class="card" style="max-width:640px;">' +
      '<div class="section-title" style="margin-bottom:6px;">' + (trocando ? 'Trocar chave da WAME' : 'Conecte seu WhatsApp pela WAME') + '</div>' +
      '<p class="muted" style="font-size:13.5px; line-height:1.6; margin:0 0 12px;">' +
        'As mensagens de giftback e indicação passam a sair sozinhas do número de WhatsApp da sua empresa, e as respostas dos clientes aparecem aqui.' +
      '</p>' +
      (trocando ? '' :
      '<ol style="margin:0 0 14px; padding-left:20px; font-size:13px; line-height:1.8; color:var(--text);">' +
        '<li>Entre no painel da WAME em <a href="https://dash.wame.api.br/" target="_blank" rel="noopener">dash.wame.api.br</a> e abra (ou crie) a sua instância.</li>' +
        '<li>Copie a <strong>chave (key)</strong> da instância.</li>' +
        '<li>Cole a chave abaixo e clique em <strong>Salvar chave</strong>.</li>' +
        '<li>Depois, clique em <strong>Conectar número</strong> e leia o QR Code com o celular da empresa.</li>' +
      '</ol>') +
      '<form id="form-wame-chave" class="form-grid" style="grid-template-columns:1fr;">' +
        '<div class="field"><label for="wame-chave">Chave da instância WAME *</label>' +
          '<input type="text" id="wame-chave" name="chave" required autocomplete="off" spellcheck="false" placeholder="Cole aqui a chave copiada do painel da WAME"></div>' +
        '<div class="btn-row">' +
          (trocando ? '<button type="button" class="btn btn-sm" id="btn-wame-chave-cancelar">Cancelar</button>' : '') +
          '<button class="btn btn-primary" type="submit">Salvar chave</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  }

  function wameLigarFormChave(main){
    const form = document.getElementById("form-wame-chave");
    if (!form) return;
    const cancelar = document.getElementById("btn-wame-chave-cancelar");
    if (cancelar) cancelar.addEventListener("click", () => wameRenderizarTela(main));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = "Validando na WAME…";
      try {
        state.wame = await api("/config/wame/chave", { method:"PUT", body:{ chave: form.chave.value } });
        toast(state.wame.ultimoErro ? state.wame.ultimoErro : "Chave salva.", state.wame.ultimoErro ? "erro" : undefined);
        wameRenderizarTela(main);
      } catch(err){
        btn.disabled = false; btn.textContent = "Salvar chave";
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível salvar a chave."), "erro");
      }
    });
  }

  function wameCardStatusHtml(c){
    const info = WAME_STATUS_INFO[c.status] || { label: c.status, badge: "b-cancelado" };
    const conectado = c.status === "conectado";
    let aviso = '';
    if (!conectado){
      aviso = '<div class="alert-box" style="display:flex; gap:10px; align-items:flex-start; background:var(--warning-soft); color:var(--warning); border-radius:10px; padding:12px 14px; font-size:12.5px; line-height:1.55; margin-bottom:14px;">' +
        '<span style="flex:none; margin-top:1px;">' + ICONS.alerta + '</span>' +
        '<span>' + esc(c.ultimoErro || "O número ainda não está conectado. Clique em \"Conectar número\" e leia o QR Code com o WhatsApp do celular da empresa.") +
        ' Enquanto isso, os envios continuam pelo link do WhatsApp, como antes.</span>' +
      '</div>';
    } else if (!c.webhookConfigurado){
      aviso = '<div class="alert-box" style="display:flex; gap:10px; align-items:flex-start; background:var(--warning-soft); color:var(--warning); border-radius:10px; padding:12px 14px; font-size:12.5px; line-height:1.55; margin-bottom:14px;">' +
        '<span style="flex:none; margin-top:1px;">' + ICONS.alerta + '</span>' +
        '<span>' + esc(c.ultimoErro || "O recebimento de respostas e status ainda não foi configurado na WAME.") + ' Clique em "Trocar chave" e salve a mesma chave de novo para tentar outra vez.</span>' +
      '</div>';
    }
    return aviso +
      '<div class="card" style="max-width:720px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; margin-bottom:12px;">' +
          '<div>' +
            '<div class="section-title" style="margin-bottom:2px;">' + esc(c.telefone ? wameFormatarTelefone(c.telefone) : "Número ainda não conectado") + '</div>' +
            '<div class="muted" style="font-size:13px;">' + esc(c.nomePerfil || "WhatsApp via WAME") + '</div>' +
          '</div>' +
          '<span class="badge ' + info.badge + '">' + esc(info.label) + '</span>' +
        '</div>' +
        '<div class="campaign-meta" style="row-gap:8px; margin-bottom:14px;">' +
          '<span>Chave: <span class="mono">••••' + esc(c.chaveFinal || "") + '</span></span>' +
          '<span>Envio automático: <strong>' + (conectado ? "Ligado" : "Desligado") + '</strong></span>' +
          '<span>Recebimento de respostas: <strong>' + (c.webhookConfigurado ? "Ligado" : "Pendente") + '</strong></span>' +
          (c.ultimoEventoEm ? '<span>Último evento: ' + dataHoraBR(c.ultimoEventoEm) + '</span>' : '') +
        '</div>' +
        '<div class="btn-row">' +
          (conectado
            ? '<button class="btn btn-primary btn-sm" id="btn-wame-teste" type="button">' + ICONS.whatsapp + ' Enviar mensagem de teste</button>'
            : '<button class="btn btn-primary btn-sm" id="btn-wame-qr" type="button">' + ICONS.plugue + ' Conectar número (QR Code)</button>') +
          '<button class="btn btn-sm" id="btn-wame-atualizar" type="button">' + ICONS.sync + ' Atualizar status</button>' +
          '<button class="btn btn-sm" id="btn-wame-trocar" type="button">Trocar chave</button>' +
          '<button class="btn btn-sm" id="btn-wame-remover" type="button" style="color:var(--danger);">' + ICONS.x + ' Remover integração</button>' +
        '</div>' +
        '<p class="faint" style="font-size:11.5px; line-height:1.5; margin:14px 0 0;">Dica: envie mensagens só para clientes que conhecem a sua empresa. Muitas denúncias de "spam" podem fazer o WhatsApp bloquear o número.</p>' +
      '</div>';
  }

  function wameFormatarTelefone(t){
    const d = String(t||"").replace(/\D/g, "");
    const m = d.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    return m ? "+55 (" + m[1] + ") " + m[2] + "-" + m[3] : (d ? "+" + d : "");
  }

  function wameLigarAcoes(main){
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
    on("btn-wame-qr", () => wameAbrirModalQr(main));
    on("btn-wame-teste", () => wameAbrirModalTeste());
    on("btn-wame-msgs-atualizar", () => wameCarregarMensagens());
    on("btn-wame-atualizar", async (e) => {
      const botao = e.currentTarget;
      botao.disabled = true;
      try {
        state.wame = await api("/config/wame?atualizar=1");
        wameRenderizarTela(main);
        toast("Status atualizado.");
      } catch(err){
        botao.disabled = false;
        if (err.status!==401) toast(mensagemErro(err), "erro");
      }
    });
    on("btn-wame-trocar", () => {
      main.innerHTML = '<div class="section">' + wameCardChaveHtml(true) + '</div>';
      wameLigarFormChave(main);
    });
    on("btn-wame-remover", () => wameConfirmarRemocao(main));
  }

  async function wameCarregarMensagens(){
    const box = document.getElementById("wame-mensagens");
    if (!box) return;
    let lista;
    try { lista = await api("/config/wame/mensagens?limite=50"); }
    catch(err){
      if (err.status === 401) return;
      box.innerHTML = '<div class="empty" style="padding:14px 6px;">Não foi possível carregar as mensagens.</div>';
      return;
    }
    if (!lista.length){
      box.innerHTML = '<div class="empty" style="padding:14px 6px;">Nenhuma mensagem ainda. Os giftbacks e convites enviados e as respostas dos clientes vão aparecer aqui.</div>';
      return;
    }
    const linhas = lista.map(m => {
      const st = WAME_MSG_STATUS[m.status] || { label: m.status, badge: "b-cancelado" };
      const entrada = m.direcao === "entrada";
      const texto = String(m.texto || "");
      const curto = texto.length > 140 ? texto.slice(0, 140) + "…" : texto;
      return '<tr>' +
        '<td class="faint" style="white-space:nowrap;">' + dataHoraBR(m.criadoEm) + '</td>' +
        '<td>' + (entrada ? '<strong>Recebida</strong>' : 'Enviada') + '<div class="faint" style="font-size:11.5px;">' + esc(WAME_ORIGEM[m.origem] || "") + '</div></td>' +
        '<td><div>' + esc(m.nomeContato || "") + '</div><div class="faint mono" style="font-size:12px;">' + esc(wameFormatarTelefone(m.telefone)) + '</div></td>' +
        '<td style="max-width:360px; white-space:pre-wrap; word-break:break-word;" title="' + esc(texto) + '">' + esc(curto) +
          (m.erro ? '<div style="color:var(--danger); font-size:11.5px; margin-top:3px;">' + esc(m.erro) + '</div>' : '') + '</td>' +
        '<td><span class="badge ' + st.badge + '">' + esc(st.label) + '</span></td>' +
      '</tr>';
    }).join("");
    box.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Quando</th><th>Tipo</th><th>Contato</th><th>Mensagem</th><th>Status</th></tr></thead><tbody>' + linhas + '</tbody></table></div>';
  }

  // QR Code: mostra a imagem, renova a cada 30s (o QR do WhatsApp expira) e
  // confere a cada 3s se o número já conectou — fecha sozinho quando conectar.
  function wameAbrirModalQr(main){
    const overlay = abrirModal(
      '<div class="section-title" style="margin-bottom:6px;">Conectar o WhatsApp da empresa</div>' +
      '<ol style="margin:0 0 12px; padding-left:20px; font-size:13px; line-height:1.7;">' +
        '<li>Abra o WhatsApp no celular da empresa.</li>' +
        '<li>Toque em <strong>Configurações</strong> (ou nos três pontinhos) → <strong>Aparelhos conectados</strong> → <strong>Conectar um aparelho</strong>.</li>' +
        '<li>Aponte a câmera para o QR Code abaixo.</li>' +
      '</ol>' +
      '<div id="wame-qr-box" style="display:flex; justify-content:center; align-items:center; min-height:260px; background:#fff; border-radius:12px; border:1px solid var(--border, #e5e5e5);">Gerando QR Code…</div>' +
      '<p class="faint" style="font-size:11.5px; text-align:center; margin:8px 0 0;">O QR Code é renovado automaticamente. Esta janela fecha sozinha quando o número conectar.</p>' +
      '<div class="btn-row" style="justify-content:flex-end; margin-top:12px;"><button type="button" class="btn btn-sm" id="btn-wame-qr-fechar">Fechar</button></div>'
    );
    let ultimaGeracao = 0;
    let ativo = true;
    const parar = () => { ativo = false; clearInterval(wameQrTimer); wameQrTimer = null; };
    overlay.querySelector("#btn-wame-qr-fechar").addEventListener("click", () => { parar(); fecharModal(); });
    const inicio = Date.now();

    async function gerar(){
      ultimaGeracao = Date.now();
      const box = overlay.querySelector("#wame-qr-box");
      try {
        const r = await api("/config/wame/qrcode", { method:"POST" });
        if (!ativo) return;
        if (r.conectado) return concluir();
        box.innerHTML = '<img src="' + esc(r.imagem) + '" alt="QR Code de conexão do WhatsApp" style="width:240px; height:240px; image-rendering:pixelated;">';
      } catch(err){
        if (!ativo || err.status === 401) return;
        box.textContent = mensagemErro(err, "Não foi possível gerar o QR Code.");
      }
    }
    async function verificar(){
      if (!ativo) return;
      if (!document.getElementById("wame-qr-box")) return parar(); // modal fechado por fora (Esc/clique fora)
      if (Date.now() - inicio > 3 * 60 * 1000){
        parar();
        overlay.querySelector("#wame-qr-box").textContent = "Tempo esgotado. Feche e clique em \"Conectar número\" de novo.";
        return;
      }
      try {
        const s = await api("/config/wame?atualizar=1");
        if (s.status === "conectado"){ state.wame = s; return concluir(); }
      } catch(err){ /* tenta de novo no próximo ciclo */ }
      if (Date.now() - ultimaGeracao > 30000) gerar();
    }
    async function concluir(){
      parar();
      fecharModal();
      try { state.wame = await api("/config/wame"); } catch(e){}
      toast("WhatsApp conectado! As mensagens agora saem automaticamente.");
      wameRenderizarTela(main);
    }
    gerar();
    clearInterval(wameQrTimer);
    wameQrTimer = setInterval(verificar, 3000);
  }

  function wameAbrirModalTeste(){
    const overlay = abrirModal(
      '<div class="section-title" style="margin-bottom:4px;">Enviar mensagem de teste</div>' +
      '<p class="muted" style="font-size:12.5px; margin:0 0 12px; line-height:1.5;">A mensagem sai do número conectado. Use o seu próprio celular para conferir.</p>' +
      '<form id="form-wame-teste" class="form-grid" style="grid-template-columns:1fr;">' +
        '<div class="field"><label for="wame-teste-telefone">Número de destino (com DDD) *</label><input type="tel" id="wame-teste-telefone" name="telefone" required placeholder="(11) 90000-0000"></div>' +
        '<div class="field"><label for="wame-teste-texto">Mensagem *</label><textarea id="wame-teste-texto" name="texto" rows="3" required>Olá! Esta é uma mensagem de teste da integração do WhatsApp.</textarea></div>' +
        '<div class="btn-row" style="justify-content:flex-end;">' +
          '<button type="button" class="btn btn-sm" id="btn-wame-teste-fechar">Fechar</button>' +
          '<button class="btn btn-primary btn-sm" type="submit">' + ICONS.whatsapp + ' Enviar teste</button>' +
        '</div>' +
      '</form>'
    );
    overlay.querySelector("#btn-wame-teste-fechar").addEventListener("click", fecharModal);
    const form = overlay.querySelector("#form-wame-teste");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await api("/config/wame/teste", { method:"POST", body:{ telefone: form.telefone.value, texto: form.texto.value } });
        fecharModal();
        toast("Mensagem de teste enviada.");
        wameCarregarMensagens();
      } catch(err){
        btn.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível enviar o teste."), "erro");
      }
    });
  }

  function wameConfirmarRemocao(main){
    abrirModal(
      '<div class="section-title" style="margin-bottom:12px;">Remover integração com a WAME</div>' +
      '<p class="muted" style="font-size:13.5px; line-height:1.55;">A plataforma para de enviar mensagens automaticamente e de receber as respostas — os envios voltam a ser pelo link do WhatsApp. O número continua conectado na sua instância da WAME; nada é apagado lá.</p>' +
      '<div class="btn-row" style="justify-content:flex-end; margin-top:14px;">' +
        '<button type="button" class="btn btn-sm" id="btn-wame-remover-cancelar">Cancelar</button>' +
        '<button type="button" class="btn btn-primary btn-sm" id="btn-wame-remover-confirmar" style="background:var(--danger);">Remover</button>' +
      '</div>'
    );
    document.getElementById("btn-wame-remover-cancelar").addEventListener("click", fecharModal);
    document.getElementById("btn-wame-remover-confirmar").addEventListener("click", async (e) => {
      e.target.disabled = true;
      try {
        state.wame = await api("/config/wame", { method:"DELETE" });
        fecharModal();
        toast("Integração removida.");
        wameRenderizarTela(main);
      } catch(err){
        e.target.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível remover."), "erro");
      }
    });
  }

  // ---------------------------------------------------------------------
  // Página: Configurações → Conexão WhatsApp (Meta Cloud API / Embedded Signup)
  // ---------------------------------------------------------------------
  // Estado local: a conexão em si (espelho do GET /config/whatsapp/connection)
  // e o carregamento único do SDK oficial da Meta (facebook.net/.../sdk.js),
  // carregado sob demanda (só quando esta tela é aberta), nunca em toda
  // página — é um script de terceiro, então só entra quando precisa.
  let waConexaoCache = null;
  let waSdkPromise = null;

  function waCarregarSdk(){
    if (waSdkPromise) return waSdkPromise;
    waSdkPromise = new Promise((resolve, reject) => {
      if (window.FB) { resolve(); return; }
      if (document.getElementById("facebook-jssdk")) {
        // Script já está sendo carregado por uma chamada anterior — espera
        // window.FB aparecer em vez de duplicar a tag <script>.
        const espera = setInterval(() => { if (window.FB) { clearInterval(espera); resolve(); } }, 100);
        setTimeout(() => { clearInterval(espera); if (!window.FB) reject(new Error("Tempo esgotado carregando o script da Meta.")); }, 15000);
        return;
      }
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/pt_BR/sdk.js";
      script.async = true; script.defer = true; script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Não foi possível carregar o script oficial da Meta — verifique sua conexão ou bloqueadores de script/anúncios."));
      document.body.appendChild(script);
    });
    return waSdkPromise;
  }

  const WA_STATUS_INFO = {
    conectado: { label: "Conectado", badge: "b-confirmado" },
    conectado_com_pendencia: { label: "Conectado, com pendência", badge: "b-visualizado" },
    token_expirado: { label: "Autorização expirada", badge: "b-expirado" },
    numero_restrito: { label: "Número restrito", badge: "b-expirado" },
    erro: { label: "Erro de conexão", badge: "b-expirado" },
    desconectado: { label: "Desconectado", badge: "b-cancelado" },
  };
  function waStatusInfo(status){ return WA_STATUS_INFO[status] || { label: status, badge: "b-cancelado" }; }

  async function renderConfigWhatsapp(main){
    setHeader("Conexão WhatsApp", "Conecte o número oficial do WhatsApp Business da sua empresa à plataforma, usando a integração oficial da Meta (WhatsApp Business Platform / Cloud API).");
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    try { waConexaoCache = await api("/config/whatsapp/connection"); }
    catch(err){
      if (err.status === 401) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar a conexão.</div>';
      return;
    }
    waRenderizarTela(main);
  }

  function waRenderizarTela(main){
    const c = waConexaoCache || { status: "nao_conectado" };
    if (c.status === "nao_conectado" || c.status === "desconectado"){
      main.innerHTML = waTelaNaoConectadaHtml(c.status === "desconectado");
      const btn = document.getElementById("btn-wa-conectar");
      if (btn) btn.addEventListener("click", () => waIniciarConexao(main, btn));
      return;
    }
    main.innerHTML = waTelaConectadaHtml(c);
    waLigarAcoesConectado(main);
  }

  function waTelaNaoConectadaHtml(foiDesconectado){
    return '<div class="section">' +
      '<div class="card" style="max-width:640px;">' +
        (foiDesconectado ? '<div class="faint" style="margin-bottom:10px; font-size:12.5px;">A integração foi desconectada. Seu número, WABA e Business Portfolio continuam intactos na Meta — você pode reconectar quando quiser.</div>' : '') +
        '<div class="section-title" style="margin-bottom:6px;">Conecte seu WhatsApp</div>' +
        '<p class="muted" style="font-size:13.5px; line-height:1.6; margin:0 0 14px;">' +
          'A conexão usa a integração oficial da Meta — WhatsApp Business Platform (Cloud API) via Embedded Signup — para que sua empresa envie e receba mensagens diretamente pela plataforma, com o número e as credenciais da sua própria conta Meta Business.' +
        '</p>' +
        '<div class="faint" style="font-size:12px; font-weight:700; margin-bottom:6px;">Você vai precisar de:</div>' +
        '<ul style="margin:0 0 14px; padding-left:20px; font-size:13px; line-height:1.8; color:var(--text);">' +
          '<li>Acesso à conta Meta responsável pela sua empresa (quem administra o Business Portfolio).</li>' +
          '<li>Permissão de administrador nesse Business Portfolio.</li>' +
          '<li>Um número de telefone elegível para o WhatsApp Business Platform (não pode estar em uso em outra WABA).</li>' +
          '<li>Capacidade de receber SMS ou ligação nesse número, caso a Meta peça verificação.</li>' +
        '</ul>' +
        '<div class="alert-box" style="display:flex; gap:10px; align-items:flex-start; background:var(--warning-soft); color:var(--warning); border-radius:10px; padding:12px 14px; font-size:12.5px; line-height:1.55; margin-bottom:16px;">' +
          '<span style="flex:none; margin-top:1px;">' + ICONS.alerta + '</span>' +
          '<span>Se esse número já é usado no aplicativo WhatsApp Business (app comum), a própria Meta vai indicar, durante a conexão, o fluxo oficial de <strong>coexistência</strong> ou <strong>migração</strong> — siga a orientação exibida na janela da Meta, conforme a elegibilidade do seu número.</span>' +
        '</div>' +
        '<button class="btn btn-primary" id="btn-wa-conectar" type="button">' + ICONS.whatsapp + ' Conectar com a Meta</button>' +
      '</div>' +
    '</div>';
  }

  function waMascaraHtml(v){ return '<span class="mono faint" style="font-size:12px;">'+esc(v||"—")+'</span>'; }

  function waTelaConectadaHtml(c){
    const info = waStatusInfo(c.status);
    const pendente = c.status !== "conectado";
    const avisoTopo = pendente
      ? '<div class="alert-box" style="display:flex; gap:10px; align-items:flex-start; background:var(--danger-soft); color:var(--danger); border-radius:10px; padding:12px 14px; font-size:12.5px; line-height:1.55; margin-bottom:16px;">' +
          '<span style="flex:none; margin-top:1px;">' + ICONS.alerta + '</span>' +
          '<span>' + esc(waMensagemPendencia(c)) + '</span>' +
        '</div>'
      : '';
    return '<div class="section">' +
      avisoTopo +
      '<div class="card" style="max-width:720px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; margin-bottom:14px;">' +
          '<div>' +
            '<div class="section-title" style="margin-bottom:2px;">' + esc(c.displayPhoneNumber || "Número conectado") + '</div>' +
            '<div class="muted" style="font-size:13px;">' + esc(c.verifiedName || "—") + '</div>' +
          '</div>' +
          '<span class="badge ' + info.badge + '">' + esc(info.label) + '</span>' +
        '</div>' +
        '<div class="campaign-meta" style="row-gap:10px; margin-bottom:4px;">' +
          '<span>Status do número: <strong>' + esc(c.numberStatus || "—") + '</strong></span>' +
          '<span>Qualidade: <strong>' + esc(c.qualityRating || "—") + '</strong></span>' +
          '<span>Verificação: <strong>' + esc(c.codeVerificationStatus || "—") + '</strong></span>' +
        '</div>' +
        '<div class="campaign-meta" style="row-gap:10px; margin-bottom:14px;">' +
          '<span>Webhooks: <strong>' + esc(c.webhookStatus === "inscrito" ? "Inscrito" : (c.webhookStatus === "erro" ? "Com erro" : "Pendente")) + '</strong></span>' +
          '<span>Envio de mensagens: <strong>' + (c.status === "conectado" ? "Habilitado" : "Indisponível") + '</strong></span>' +
        '</div>' +
        '<table style="width:100%; font-size:13px; margin-bottom:16px;"><tbody>' +
          '<tr><td class="faint" style="padding:5px 10px 5px 0;">WABA ID</td><td>' + waMascaraHtml(c.wabaId) + '</td></tr>' +
          '<tr><td class="faint" style="padding:5px 10px 5px 0;">Phone Number ID</td><td>' + waMascaraHtml(c.phoneNumberId) + '</td></tr>' +
          '<tr><td class="faint" style="padding:5px 10px 5px 0;">Business ID</td><td>' + waMascaraHtml(c.metaBusinessId) + '</td></tr>' +
          '<tr><td class="faint" style="padding:5px 10px 5px 0;">Conectado em</td><td>' + dataHoraBR(c.connectedAt) + '</td></tr>' +
          '<tr><td class="faint" style="padding:5px 10px 5px 0;">Última sincronização</td><td>' + dataHoraBR(c.lastSyncedAt) + '</td></tr>' +
        '</tbody></table>' +
        '<div class="btn-row">' +
          '<button class="btn btn-sm" id="btn-wa-sync" type="button">' + ICONS.sync + ' Sincronizar status</button>' +
          '<button class="btn btn-sm" id="btn-wa-teste" type="button" ' + (c.status!=="conectado"?'disabled title="Disponível quando a conexão estiver saudável"':'') + '>' + ICONS.whatsapp + ' Enviar mensagem de teste</button>' +
          '<button class="btn btn-sm" id="btn-wa-reconectar" type="button">' + ICONS.plugue + ' Reconectar</button>' +
          '<button class="btn btn-sm" id="btn-wa-desconectar" type="button" style="color:var(--danger);">' + ICONS.x + ' Desconectar</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function waMensagemPendencia(c){
    if (c.lastErrorMessage) return c.lastErrorMessage;
    if (c.status === "conectado_com_pendencia") return "A conexão foi concluída, mas há uma pendência (ex.: inscrição de webhooks) — tente \"Sincronizar status\" ou \"Reconectar\".";
    if (c.status === "token_expirado") return "A autorização com a Meta expirou ou foi revogada. Clique em \"Reconectar\".";
    if (c.status === "numero_restrito") return "Este número está restrito pela Meta. Verifique o Business Manager.";
    return "Há um problema com esta conexão. Tente \"Sincronizar status\" ou \"Reconectar\".";
  }

  function waLigarAcoesConectado(main){
    const btnSync = document.getElementById("btn-wa-sync");
    if (btnSync) btnSync.addEventListener("click", async () => {
      btnSync.disabled = true;
      try {
        waConexaoCache = await api("/config/whatsapp/connection/sync", { method:"POST" });
        waRenderizarTela(main);
        toast("Status sincronizado com a Meta.");
      } catch(err){
        btnSync.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível sincronizar."), "erro");
      }
    });
    const btnReconectar = document.getElementById("btn-wa-reconectar");
    if (btnReconectar) btnReconectar.addEventListener("click", () => waIniciarConexao(main, btnReconectar));
    const btnTeste = document.getElementById("btn-wa-teste");
    if (btnTeste) btnTeste.addEventListener("click", () => waAbrirModalTeste());
    const btnDesconectar = document.getElementById("btn-wa-desconectar");
    if (btnDesconectar) btnDesconectar.addEventListener("click", () => waConfirmarDesconexao(main));
  }

  function waConfirmarDesconexao(main){
    abrirModal(
      '<div class="section-title" style="margin-bottom:12px;">Desconectar WhatsApp</div>' +
      '<p class="muted" style="font-size:13.5px; line-height:1.55;">Tem certeza que deseja desconectar? A plataforma para de enviar/receber mensagens por este número, mas <strong>nada é apagado na sua conta Meta</strong> — o Business Portfolio, a WABA e o número continuam intactos, e você pode reconectar quando quiser.</p>' +
      '<div class="btn-row" style="justify-content:flex-end; margin-top:14px;">' +
        '<button type="button" class="btn btn-sm" id="btn-wa-desconectar-cancelar">Cancelar</button>' +
        '<button type="button" class="btn btn-primary btn-sm" id="btn-wa-desconectar-confirmar" style="background:var(--danger);">Desconectar</button>' +
      '</div>'
    );
    document.getElementById("btn-wa-desconectar-cancelar").addEventListener("click", fecharModal);
    document.getElementById("btn-wa-desconectar-confirmar").addEventListener("click", async (e) => {
      e.target.disabled = true;
      try {
        waConexaoCache = await api("/config/whatsapp/connection", { method:"DELETE" });
        fecharModal();
        toast("WhatsApp desconectado.");
        waRenderizarTela(main);
      } catch(err){
        e.target.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível desconectar."), "erro");
      }
    });
  }

  function waAbrirModalTeste(){
    const overlay = abrirModal(
      '<div class="section-title" style="margin-bottom:4px;">Enviar mensagem de teste</div>' +
      '<p class="muted" style="font-size:12.5px; margin:0 0 12px; line-height:1.5;">Mensagem iniciada pela empresa fora da janela de atendimento exige um template já aprovado pela Meta para esta conexão.</p>' +
      '<form id="form-wa-teste" class="form-grid" style="grid-template-columns:1fr;">' +
        '<div class="field"><label>Número de destino *</label><input type="tel" name="destinatario" required placeholder="+55 11 90000-0000"></div>' +
        '<div class="field"><label>Nome do template aprovado *</label><input type="text" name="templateNome" required placeholder="Ex.: hello_world"></div>' +
        '<div class="field"><label>Idioma do template</label><input type="text" name="templateIdioma" placeholder="pt_BR" value="pt_BR"></div>' +
        '<div id="wa-teste-resultado"></div>' +
        '<div class="btn-row" style="justify-content:flex-end;">' +
          '<button type="button" class="btn btn-sm" id="btn-wa-teste-fechar">Fechar</button>' +
          '<button class="btn btn-primary btn-sm" type="submit">' + ICONS.whatsapp + ' Enviar teste</button>' +
        '</div>' +
      '</form>'
    );
    document.getElementById("btn-wa-teste-fechar").addEventListener("click", fecharModal);
    const form = overlay.querySelector("#form-wa-teste");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const resultadoEl = overlay.querySelector("#wa-teste-resultado");
      const btnSubmit = form.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      try {
        const resp = await api("/config/whatsapp/test-message", { method:"POST", body:{
          destinatario: fd.get("destinatario"),
          templateNome: fd.get("templateNome"),
          templateIdioma: fd.get("templateIdioma") || "pt_BR",
        }});
        resultadoEl.innerHTML = '<div class="alert-box" style="background:var(--success-soft); color:var(--success); border-radius:8px; padding:10px 12px; font-size:12.5px; line-height:1.5;">' +
          'Enviado. Status: <strong>' + esc(resp.status) + '</strong>' + (resp.wamid ? '<br>wamid: <span class="mono">' + esc(resp.wamid) + '</span>' : '') +
          '<br><span class="faint">O status (entregue/lido) é atualizado automaticamente quando a Meta confirmar, via webhook.</span>' +
        '</div>';
        toast("Mensagem de teste enviada.");
      } catch(err){
        resultadoEl.innerHTML = '<div class="alert-box" style="background:var(--danger-soft); color:var(--danger); border-radius:8px; padding:10px 12px; font-size:12.5px;">' + esc(mensagemErro(err, "Não foi possível enviar a mensagem de teste.")) + '</div>';
        if (err.status!==401) toast(mensagemErro(err, "Falha ao enviar mensagem de teste."), "erro");
      } finally {
        btnSubmit.disabled = false;
      }
    });
  }

  // Fluxo do Embedded Signup — usado tanto pelo botão "Conectar com a Meta"
  // (não conectado) quanto por "Reconectar" (já conectado).
  async function waIniciarConexao(main, botao){
    if (botao){ botao.disabled = true; botao.dataset.textoOriginal = botao.innerHTML; botao.innerHTML = "Iniciando…"; }
    let embedCfg, nonce;
    try {
      embedCfg = await api("/config/whatsapp/embed-config");
      const respNonce = await api("/config/whatsapp/connection/iniciar", { method:"POST" });
      nonce = respNonce.nonce;
      await waCarregarSdk();
    } catch(err){
      if (botao){ botao.disabled = false; botao.innerHTML = botao.dataset.textoOriginal; }
      if (err.status!==401) toast(mensagemErro(err, "Não foi possível iniciar a conexão com a Meta."), "erro");
      return;
    }

    if (botao) botao.innerHTML = "Aguardando conclusão na janela da Meta…";

    // O evento FINISH/CANCEL do Embedded Signup chega por postMessage da
    // janela popup — captura aqui os identificadores (waba_id,
    // phone_number_id, business_id) que o FB.login sozinho não devolve (ele
    // só devolve o `code`). Ouvinte é removido assim que o fluxo termina.
    let dadosSignup = null;
    function onMessage(event){
      if (!event.origin || !event.origin.endsWith("facebook.com")) return;
      let data;
      try { data = JSON.parse(event.data); } catch(e){ return; }
      if (data && data.type === "WA_EMBEDDED_SIGNUP") dadosSignup = data;
    }
    window.addEventListener("message", onMessage);

    let response;
    try {
      window.FB.init({ appId: embedCfg.appId, autoLogAppEvents: true, xfbml: true, version: embedCfg.graphApiVersion });
      response = await new Promise((resolve, reject) => {
        try {
          window.FB.login((r) => resolve(r), {
            config_id: embedCfg.configId,
            response_type: "code",
            override_default_response_type: true,
            extras: { setup: {}, sessionInfoVersion: "3" },
          });
        } catch(e){ reject(e); }
      });
    } catch(err){
      window.removeEventListener("message", onMessage);
      if (botao){ botao.disabled = false; botao.innerHTML = botao.dataset.textoOriginal; }
      toast("Não foi possível abrir a janela de conexão da Meta — verifique se seu navegador está bloqueando pop-ups.", "erro");
      return;
    }
    // Dá uma folga curta pro postMessage do popup chegar — ele normalmente
    // chega antes ou junto do callback do FB.login, mas não é garantido.
    if (!dadosSignup) await new Promise((r) => setTimeout(r, 700));
    window.removeEventListener("message", onMessage);

    const cancelado = dadosSignup && dadosSignup.event === "CANCEL";
    const erroDoPopup = cancelado && dadosSignup.data && dadosSignup.data.error_message;
    const code = response && response.authResponse ? response.authResponse.code : null;

    if (!code){
      if (botao){ botao.disabled = false; botao.innerHTML = botao.dataset.textoOriginal; }
      if (erroDoPopup) toast("A Meta retornou um erro: " + dadosSignup.data.error_message, "erro");
      else toast("Conexão cancelada.");
      return;
    }

    const finishData = dadosSignup && dadosSignup.event === "FINISH" ? dadosSignup.data : {};
    if (botao) botao.innerHTML = "Concluindo conexão…";
    try {
      waConexaoCache = await api("/config/whatsapp/connection/complete", { method:"POST", body:{
        code, nonce,
        wabaId: finishData.waba_id, phoneNumberId: finishData.phone_number_id, businessId: finishData.business_id,
      }});
      toast("WhatsApp conectado com sucesso.");
      waRenderizarTela(main);
    } catch(err){
      if (botao){ botao.disabled = false; botao.innerHTML = botao.dataset.textoOriginal; }
      if (err.status!==401) toast(mensagemErro(err, "Não foi possível concluir a conexão."), "erro");
    }
  }

  // ---------------------------------------------------------------------
  // Página: Indicações → Criar Indicação
  // ---------------------------------------------------------------------
  function renderIndicacoesCriar(main){
    setHeader("Criar Indicação", "Defina a meta de amigos indicados, o prêmio de quem indica, o presente de boas-vindas de quem é indicado e as mensagens de convite e de encaminhamento.");
    main.innerHTML =
      '<div class="section">' +
        '<div class="card">' +
          '<div class="section-title" style="margin-bottom:12px;">Nova campanha de indicação</div>' +
          '<form id="form-indicacao" class="form-grid">' +
            campo("titulo","Título da campanha","text","Ex.: Indique e Ganhe", true) +
            '<div class="field"><label>Meta de indicações *</label><input type="number" name="meta" min="1" step="1" required placeholder="3"><div class="hint">Quantos amigos confirmados até o indicador ganhar o prêmio.</div></div>' +
            '<div class="field"><label>Validade do link (dias) *</label><input type="number" name="validade" min="1" step="1" required placeholder="30"></div>' +
            '<div class="field full"><label>Prêmio do indicador (quem indica) *</label><textarea name="premioIndicador" required placeholder="Ex.: R$ 100 de desconto em qualquer procedimento">Ex.: R$ 100 de desconto em qualquer procedimento</textarea></div>' +
            '<div class="field full"><label>Presente de boas-vindas do indicado (quem é indicado)</label><textarea name="premioIndicado" placeholder="Ex.: 10% de desconto na primeira visita">Ex.: 10% de desconto na primeira visita</textarea></div>' +
            '<div class="field full"><label>Condições (aparece na página pública)</label><textarea name="condicoes" placeholder="Ex.: válido por cliente, um prêmio por meta atingida."></textarea></div>' +
            '<div class="field full">' +
              '<label>Mensagem de convite (para o cliente que vai indicar) *</label>' +
              '<div class="grid grid-split msg-editor-grid">' +
                '<div class="msg-editor-col">' +
                  '<div class="msg-toolbar">' + botaoEmojiHtml("mensagem") + '</div>' +
                  '<textarea name="mensagem" required placeholder="Oi {{nome_cliente}}! ...">Oi {{nome_cliente}}! Indique {{meta_indicacoes}} amigos e ganhe: {{premio_indicador}} 🎁. Toque no link, confirme sua participação com os 4 últimos números do seu WhatsApp e comece a indicar: {{link_indicacao}}</textarea>' +
                  pickerEmojiHtml("mensagem") +
                  '<div class="var-chips">' + ['nome_cliente','meta_indicacoes','premio_indicador','premio_indicado','link_indicacao'].map(v=>'<span class="var-chip" data-var="'+v+'" data-target="mensagem">{{'+v+'}}</span>').join("") + '</div>' +
                '</div>' +
                '<div class="msg-preview-col">' + whatsappPreviewShellHtml("mensagem") + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="field full">' +
              '<label>Mensagem para o indicador encaminhar aos amigos *</label>' +
              '<div class="grid grid-split msg-editor-grid">' +
                '<div class="msg-editor-col">' +
                  '<div class="msg-toolbar">' + botaoEmojiHtml("textoEncaminhar") + '</div>' +
                  '<textarea name="textoEncaminhar" required placeholder="Oi! Aqui é {{nome_indicador}}...">Oi! Aqui é {{nome_indicador}}. Se você confirmar, ganha: {{premio_indicado}} ✨. Condições: {{condicoes}}. Confirme aqui: {{link_indicacao}}</textarea>' +
                  pickerEmojiHtml("textoEncaminhar") +
                  '<div class="var-chips">' + ['nome_indicador','premio_indicado','condicoes','link_indicacao'].map(v=>'<span class="var-chip" data-var="'+v+'" data-target="textoEncaminhar">{{'+v+'}}</span>').join("") + '</div>' +
                '</div>' +
                '<div class="msg-preview-col">' + whatsappPreviewShellHtml("textoEncaminhar", "Amigo(a)") + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="field full"><button class="btn btn-primary" type="submit">' + ICONS.plus + ' Criar campanha de indicação</button></div>' +
          '</form>' +
        '</div>' +
      '</div>';

    const formIndicacao = document.getElementById("form-indicacao");

    function atualizarPreviewsIndicacao(){
      const meta = formIndicacao.querySelector('input[name="meta"]').value;
      const premioIndicador = formIndicacao.querySelector('textarea[name="premioIndicador"]').value;
      const premioIndicado = formIndicacao.querySelector('textarea[name="premioIndicado"]').value;
      const condicoes = formIndicacao.querySelector('textarea[name="condicoes"]').value;
      const varsComuns = {
        nome_cliente: "Marina",
        nome_indicador: "Marina",
        meta_indicacoes: meta || "3",
        premio_indicador: premioIndicador || "R$ 100 de desconto em qualquer procedimento",
        premio_indicado: premioIndicado || "10% de desconto na primeira visita",
        condicoes: condicoes || "válido por cliente, um prêmio por meta atingida",
      };
      // Os dois links de exemplo são DIFERENTES de propósito: o convite vai
      // pro próprio indicador (link sem sufixo — reaberto depois de
      // confirmar, mostra o status dele) e o encaminhado vai pros amigos
      // dele (link com sufixo /amigo — mostra o formulário do amigo). Ver
      // linkParaAmigo em backend/src/routes/public.js.
      const varsConvite = Object.assign({}, varsComuns, { link_indicacao: linkPublico("indicacao/abc123") });
      const varsEncaminhar = Object.assign({}, varsComuns, { link_indicacao: linkPublico("indicacao/abc123/amigo") });
      const elMsg = main.querySelector('[data-wa-preview="mensagem"]');
      const elEnc = main.querySelector('[data-wa-preview="textoEncaminhar"]');
      const taMsg = formIndicacao.querySelector('textarea[name="mensagem"]');
      const taEnc = formIndicacao.querySelector('textarea[name="textoEncaminhar"]');
      if (elMsg) elMsg.innerHTML = textoPreviewBubbleHtml(aplicarVarsPreview(taMsg.value, varsConvite));
      if (elEnc) elEnc.innerHTML = textoPreviewBubbleHtml(aplicarVarsPreview(taEnc.value, varsEncaminhar));
    }

    ['meta','premioIndicador','premioIndicado','condicoes'].forEach(n => {
      const campo = formIndicacao.querySelector('[name="'+n+'"]');
      if (campo) campo.addEventListener("input", atualizarPreviewsIndicacao);
    });
    formIndicacao.querySelector('textarea[name="mensagem"]').addEventListener("input", atualizarPreviewsIndicacao);
    formIndicacao.querySelector('textarea[name="textoEncaminhar"]').addEventListener("input", atualizarPreviewsIndicacao);
    ligarEmojiPicker(main, "mensagem", atualizarPreviewsIndicacao);
    ligarEmojiPicker(main, "textoEncaminhar", atualizarPreviewsIndicacao);

    main.querySelectorAll(".var-chip").forEach(chip => {
      chip.addEventListener("click", ()=>{
        const ta = main.querySelector('textarea[name="'+chip.getAttribute("data-target")+'"]');
        const pos = ta.selectionStart || ta.value.length;
        const ins = "{{"+chip.getAttribute("data-var")+"}}";
        ta.value = ta.value.slice(0,pos) + ins + ta.value.slice(pos);
        ta.focus();
        atualizarPreviewsIndicacao();
      });
    });

    atualizarPreviewsIndicacao();

    document.getElementById("form-indicacao").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const botao = e.target.querySelector('button[type="submit"]');
      botao.disabled = true;
      try {
        await api("/indicacoes/campanhas", { method:"POST", body:{
          titulo: fd.get("titulo").trim(),
          metaIndicacoes: fd.get("meta"),
          validade: fd.get("validade"),
          premioIndicador: fd.get("premioIndicador"),
          premioIndicado: fd.get("premioIndicado") || "",
          condicoes: fd.get("condicoes") || "",
          mensagem: fd.get("mensagem"),
          textoEncaminhar: fd.get("textoEncaminhar"),
        }});
        await carregarTudo();
        toast("Campanha de indicação criada.");
        ir("indicacoes-consultar");
      } catch(err){
        botao.disabled = false;
        if (err.status!==401) toast(mensagemErro(err), "erro");
      }
    });
  }

  // ---------------------------------------------------------------------
  // Página: Indicações → Consultar Indicação
  // ---------------------------------------------------------------------
  // cache local: { campanhaId: [ {clienteIndicadorId, mensagem, linkWhatsapp,
  // indicadorConfirmadoEm, ...} ] }, vindo de GET /indicacoes/campanhas/:id/enviadas.
  // Compartilhado entre a lista de campanhas (pra mostrar os contadores de
  // enviados/confirmados de cada card) e a tela de Enviar mensagens.
  let enviadasPorCampanhaIndicacao = {};

  async function renderIndicacoesConsultar(main){
    setHeader("Consultar Indicação", "Cada campanha de indicação gera um link pessoal por cliente — ele encaminha esse link aos amigos, que confirmam a indicação e viram clientes.",
      '<button class="btn header-btn btn-sm" id="btn-ir-criar-indicacao">' + ICONS.plus + ' Criar indicação</button>');
    // Liga o clique já aqui, antes de qualquer await abaixo — mesmo motivo
    // do comentário em ligarBtnMasterVoltar: setHeader() recria o botão a
    // cada render, então o listener tem que ser religado toda vez, e nunca
    // depois de um await (senão o botão fica visível sem funcionar por um
    // tempo, com respostas de API mais lentas).
    document.getElementById("btn-ir-criar-indicacao").addEventListener("click", ()=>ir("indicacoes-criar"));

    const lista = Object.values(state.campanhasIndicacao);
    if (!lista.length){
      main.innerHTML =
        '<div class="section">' +
          '<div class="section-head"><div class="section-title">Campanhas de indicação cadastradas</div></div>' +
          '<div class="card empty">Nenhuma campanha de indicação cadastrada ainda.</div>' +
        '</div>';
      return;
    }
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    await Promise.all(lista.map(async c => {
      if (!enviadasPorCampanhaIndicacao[c.id]){
        try { enviadasPorCampanhaIndicacao[c.id] = await api("/indicacoes/campanhas/"+c.id+"/enviadas"); }
        catch(err){ enviadasPorCampanhaIndicacao[c.id] = []; }
      }
    }));
    main.innerHTML =
      '<div class="section">' +
        '<div class="section-head"><div class="section-title">Campanhas de indicação cadastradas</div></div>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fill, minmax(280px,1fr));">' +
          lista.map(campanhaIndicacaoCardHtml).join("") +
        '</div>' +
      '</div>';
    main.querySelectorAll("[data-ir-enviar-indicacao]").forEach(btn=>{
      btn.addEventListener("click", ()=> ir("indicacoes-enviar/"+btn.getAttribute("data-ir-enviar-indicacao")));
    });
  }

  // Card resumido de cada campanha, com os contadores de convites
  // enviados/confirmados — clareza imediata do resultado sem precisar abrir
  // a campanha. O botão leva à tela dedicada de envio (ver
  // renderIndicacoesEnviar), em vez de expandir a lista de clientes aqui.
  function campanhaIndicacaoCardHtml(c){
    const enviadas = enviadasPorCampanhaIndicacao[c.id] || [];
    const confirmados = enviadas.filter(i => i.indicadorConfirmadoEm).length;
    const stats = enviadas.length
      ? '<span>' + enviadas.length + ' convite' + (enviadas.length===1?'':'s') + ' enviado' + (enviadas.length===1?'':'s') + '</span>' +
        '<span style="color:var(--success);">' + confirmados + ' confirmado' + (confirmados===1?'':'s') + '</span>'
      : '<span class="faint">Nenhum convite enviado ainda</span>';
    return '<div class="campaign-card">' +
      '<div class="campaign-flow">' + esc(c.titulo) + '</div>' +
      '<div class="muted" style="font-size:12.5px;">Prêmio: ' + esc(c.premioIndicador) + '</div>' +
      '<div class="campaign-meta">' +
        '<span class="pill-value">Meta: ' + c.metaIndicacoes + '</span>' +
        (c.premioIndicado ? '<span>Boas-vindas: ' + esc(c.premioIndicado) + '</span>' : '') +
        '<span>Validade: ' + c.validadeDias + ' dias</span>' +
      '</div>' +
      '<div class="campaign-meta" style="margin-top:2px;">' + stats + '</div>' +
      '<div class="btn-row"><button class="btn btn-primary btn-sm" data-ir-enviar-indicacao="'+c.id+'">' + ICONS.whatsapp + ' Enviar mensagens</button></div>' +
    '</div>';
  }

  // ---------------------------------------------------------------------
  // Página: Indicações → Enviar mensagens (uma campanha por vez)
  // ---------------------------------------------------------------------
  // Tela dedicada: dados da campanha no topo, lista de TODOS os clientes
  // embaixo, cada um com o status do convite (Não enviado / Enviado /
  // Confirmado) e a ação correspondente — pra dar clareza imediata de quem
  // já foi contatado e quem já confirmou participação.
  async function renderIndicacoesEnviar(main, campanhaId){
    const campanha = state.campanhasIndicacao[campanhaId];
    setHeader(campanha ? campanha.titulo : "Enviar mensagens",
      "Envie o convite de indicação para cada cliente e acompanhe quem já recebeu e quem já confirmou participação.",
      '<button class="btn header-btn btn-sm" id="btn-indicacoes-voltar">← Voltar</button>');
    // Mesmo motivo do comentário em ligarBtnMasterVoltar: religar sempre
    // logo depois do setHeader(), antes de qualquer await.
    ligarBtnIndicacoesVoltar();
    if (!campanha){
      main.innerHTML = '<div class="card empty">Campanha não encontrada.</div>';
      return;
    }
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    try {
      enviadasPorCampanhaIndicacao[campanhaId] = await api("/indicacoes/campanhas/"+campanhaId+"/enviadas");
    } catch(err){
      if (err.status === 401) return;
      toast(mensagemErro(err), "erro");
      enviadasPorCampanhaIndicacao[campanhaId] = enviadasPorCampanhaIndicacao[campanhaId] || [];
    }
    renderPainelEnviarIndicacao(document.getElementById("main"), campanha);
  }
  function ligarBtnIndicacoesVoltar(){
    const btn = document.getElementById("btn-indicacoes-voltar");
    if (btn) btn.addEventListener("click", ()=> ir("indicacoes-consultar"));
  }

  function renderPainelEnviarIndicacao(main, campanha){
    main.innerHTML =
      '<div class="card" style="margin-bottom:16px;">' +
        '<div class="campaign-meta" style="margin-bottom:10px;">' +
          '<span class="pill-value">Meta: ' + campanha.metaIndicacoes + ' indicações</span>' +
          '<span>Prêmio do indicador: ' + esc(campanha.premioIndicador) + '</span>' +
          (campanha.premioIndicado ? '<span>Boas-vindas do indicado: ' + esc(campanha.premioIndicado) + '</span>' : '') +
          '<span>Validade: ' + campanha.validadeDias + ' dias</span>' +
        '</div>' +
        '<div class="faint" style="margin-bottom:2px; font-size:12px; font-weight:700;">Mensagem de convite</div>' +
        '<div class="msg-preview">' + esc(campanha.mensagem) + '</div>' +
      '</div>' +
      '<div class="card table-wrap">' + painelClientesIndicacao(campanha) + '</div>';
    ligarAcoesEnviosIndicacao(main);
  }

  function painelClientesIndicacao(campanha){
    const clientes = Object.values(state.clientes).sort((a,b)=>a.nome.localeCompare(b.nome));
    if (!clientes.length){
      return '<div class="empty" style="padding:16px 6px;">Nenhum cliente cadastrado ainda.</div>';
    }
    const jaEnviadas = enviadasPorCampanhaIndicacao[campanha.id] || [];
    const porCliente = {};
    jaEnviadas.forEach(i => { porCliente[i.clienteIndicadorId] = i; });

    const rows = clientes.map((cli) => {
      const info = porCliente[cli.id];
      let statusHtml;
      if (!info){
        statusHtml = '<button class="btn btn-primary btn-sm" data-enviar-indicacao="'+campanha.id+'" data-cliente-indicacao="'+cli.id+'">' + ICONS.whatsapp + ' Enviar mensagem</button>';
      } else if (info.indicadorConfirmadoEm){
        statusHtml = '<span class="badge b-confirmado">Confirmado</span>';
      } else {
        statusHtml =
          '<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">' +
            '<span class="badge b-enviado">Enviado</span>' +
            '<button class="btn btn-ghost btn-sm" data-abrir-indicacao="'+esc(info.linkWhatsapp)+'" title="Abrir WhatsApp novamente">' + ICONS.whatsapp + '</button>' +
            '<button class="btn btn-ghost btn-sm" data-copy="'+esc(info.linkWhatsapp)+'" title="Copiar link">' + ICONS.copy + '</button>' +
          '</div>';
      }
      return '<tr>' +
        '<td><strong>'+esc(cli.nome)+'</strong></td>' +
        '<td class="faint mono">'+esc(cli.telefone)+'</td>' +
        '<td>'+statusHtml+'</td>' +
      '</tr>';
    }).join("");
    return '<table><thead><tr><th>Cliente</th><th>WhatsApp</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  function ligarAcoesEnviosIndicacao(main){
    main.querySelectorAll("[data-enviar-indicacao]").forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const campanhaId = btn.getAttribute("data-enviar-indicacao");
        const clienteId = btn.getAttribute("data-cliente-indicacao");
        btn.disabled = true;
        // Abre a aba em branco AGORA, ainda dentro do gesto de clique do
        // usuário — mesmo padrão (e mesmo motivo) do botão de envio de
        // Giftback: como o envio grava no banco antes de termos o link, só
        // abrir a aba depois do await já não conta como interação direta, e
        // o navegador bloqueia o pop-up silenciosamente (principalmente
        // Safari/iOS).
        const abaWhatsapp = wameAbrirAbaSeManual();
        let resp;
        try {
          resp = await api("/indicacoes/campanhas/"+campanhaId+"/enviar", { method:"POST", body:{ clienteId } });
        } catch(err){
          if (abaWhatsapp) abaWhatsapp.close();
          btn.disabled = false;
          if (err.status!==401) toast(mensagemErro(err), "erro");
          return;
        }
        const lista = enviadasPorCampanhaIndicacao[campanhaId] = enviadasPorCampanhaIndicacao[campanhaId] || [];
        const idx = lista.findIndex(i => i.clienteIndicadorId === clienteId);
        if (idx >= 0) lista[idx] = resp.indicacao; else lista.push(resp.indicacao);
        wameConcluirEnvio(abaWhatsapp, resp);
        wameToastEnvio(resp.envioAutomatico, "Convite de indicação", (state.clientes[clienteId]||{}).nome);
        const campanha = state.campanhasIndicacao[campanhaId];
        if (campanha) renderPainelEnviarIndicacao(document.getElementById("main"), campanha);
      });
    });
    main.querySelectorAll("[data-abrir-indicacao]").forEach(btn=>{
      btn.addEventListener("click", ()=> window.open(btn.getAttribute("data-abrir-indicacao"), "_blank", "noopener"));
    });
    main.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", ()=> copiar(btn.getAttribute("data-copy")));
    });
  }

  // ---------------------------------------------------------------------
  // Página: Controle de Indicações → Lista de Indicados
  // ---------------------------------------------------------------------
  async function renderIndicacoesLista(main){
    setHeader("Lista de Indicados", "Amigos que confirmaram uma indicação — nome e WhatsApp coletados na confirmação, com quem os indicou.");
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    let lista;
    try { lista = await api("/indicacoes/indicados"); }
    catch(err){
      if (err.status === 401) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar a lista de indicados.</div>';
      return;
    }
    main.innerHTML =
      '<div class="card table-wrap">' + (lista.length ? tabelaIndicados(lista) : '<div class="empty">Nenhum indicado confirmado ainda.</div>') + '</div>';
  }
  function tabelaIndicados(lista){
    const rows = lista.map(i => (
      '<tr>' +
        '<td><strong>'+esc(i.nome)+'</strong></td>' +
        '<td class="faint mono">'+esc(i.telefone)+'</td>' +
        '<td class="muted">'+esc(i.indicadorNome)+'</td>' +
        '<td class="muted">'+esc(i.campanhaTitulo)+'</td>' +
        '<td class="faint">'+dataHoraBR(i.dataConfirmacao)+'</td>' +
      '</tr>'
    )).join("");
    return '<table><thead><tr><th>Indicado</th><th>WhatsApp</th><th>Indicado por</th><th>Campanha</th><th>Confirmado em</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  // ---------------------------------------------------------------------
  // Página: Controle de Indicações → Resgate Indicações
  // ---------------------------------------------------------------------
  // Mostra TODO indicador que já confirmou participação (não só quem já
  // bateu a meta, como antes) — dá clareza do estágio de cada um: quantos
  // amigos já confirmou, se já pode resgatar o prêmio e se já resgatou.
  let resgateIndicacaoEmEdicao = new Set();
  let resgatesIndicacaoCache = []; // cache local: vem de GET /indicacoes/indicadores, refeito ao entrar na tela e após cada confirmação
  let indicacaoIndicadosExpandidos = new Set(); // quais linhas estão com o drill-down "amigos confirmados" aberto
  let indicadosPorIndicacaoCache = {}; // cache local: { indicacaoId: [ {nome, telefone, dataConfirmacao, ...} ] }

  async function renderIndicacoesResgate(main){
    setHeader("Resgate Indicações", "Todo indicador que já confirmou participação, com o progresso de amigos indicados até a meta e o resgate do prêmio.");
    // Reabrir a tela (ex.: saiu pra outro menu e voltou) tem que sempre
    // mostrar o estado mais recente — inclusive no drill-down "amigos
    // indicados" de cada linha. Sem isso, uma linha que já tinha sido
    // expandida antes ficava com a lista de amigos velha (cache nunca
    // invalidado), mesmo depois de novas confirmações chegarem.
    indicacaoIndicadosExpandidos = new Set();
    indicadosPorIndicacaoCache = {};
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    try { resgatesIndicacaoCache = await api("/indicacoes/indicadores"); }
    catch(err){
      if (err.status === 401) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar a lista.</div>';
      return;
    }
    renderTabelaResgateIndicacao(main);
  }
  function renderTabelaResgateIndicacao(main){
    const lista = resgatesIndicacaoCache;
    main.innerHTML =
      '<div class="card table-wrap" id="tabela-resgate-indicacao">' + (lista.length ? tabelaResgatesIndicacao(lista) : '<div class="empty">Nenhum indicador confirmou participação ainda.</div>') + '</div>';

    ligarAcoesResgateIndicacao(main);
  }
  function tabelaResgatesIndicacao(lista){
    const rows = lista.map(r => {
      let acao;
      if (r.resgatado){
        acao = '<span class="badge b-confirmado">Prêmio resgatado</span>';
      } else if (resgateIndicacaoEmEdicao.has(r.indicacaoId)){
        acao = '<div style="display:flex; flex-wrap:nowrap; gap:6px; align-items:center;">' +
          '<input type="number" min="0" step="0.01" placeholder="Valor da venda" data-valor-resgate-input="'+r.indicacaoId+'" style="width:110px; flex:none; padding:6px 8px; background:var(--surface-2); border:1px solid var(--border); border-radius:8px; color:var(--text);">' +
          '<button class="btn btn-primary btn-sm" style="flex:none;" data-confirmar-resgate="'+r.indicacaoId+'">Confirmar</button>' +
          '<button class="btn btn-ghost btn-sm" style="flex:none;" data-cancelar-resgate="'+r.indicacaoId+'">Cancelar</button>' +
        '</div>';
      } else if (r.metaAtingida){
        acao = '<button class="btn btn-primary btn-sm" data-toggle-resgate="'+r.indicacaoId+'">Resgatar prêmio</button>';
      } else {
        acao = '<span class="faint" style="font-size:12px;">Aguardando indicações</span>';
      }
      const expandido = indicacaoIndicadosExpandidos.has(r.indicacaoId);
      const progresso =
        '<button class="btn btn-ghost btn-sm" data-ver-indicados="'+r.indicacaoId+'" style="font-weight:700;" title="Ver amigos indicados por ele">' +
          r.totalConfirmados + ' / ' + r.metaIndicacoes + (r.metaAtingida ? ' ✓' : '') +
        '</button>';
      const linhaPrincipal = '<tr>' +
        '<td><strong>'+esc(r.indicadorNome)+'</strong>' + (r.codigo ? ' <span class="faint mono" style="font-size:11px;">'+esc(r.codigo)+'</span>' : '') + '</td>' +
        '<td class="faint mono">'+esc(r.indicadorTelefone)+'</td>' +
        '<td class="muted">'+esc(r.campanhaTitulo)+'</td>' +
        '<td class="muted">'+esc(r.premioIndicador)+'</td>' +
        '<td>'+progresso+'</td>' +
        '<td>'+acao+'</td>' +
      '</tr>';
      const linhaExpandida = expandido
        ? '<tr><td colspan="6" style="background:var(--surface-2);">' + painelIndicadosDoIndicador(r.indicacaoId) + '</td></tr>'
        : '';
      return linhaPrincipal + linhaExpandida;
    }).join("");
    return '<table><thead><tr><th>Indicador</th><th>WhatsApp</th><th>Campanha</th><th>Prêmio</th><th>Indicações</th><th>Ação</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  // Drill-down: "Ao clicar em indicações, mostra os clientes que vieram
  // pela indicação" — a lista de amigos confirmados por aquele indicador.
  function painelIndicadosDoIndicador(indicacaoId){
    const lista = indicadosPorIndicacaoCache[indicacaoId];
    if (!lista) return '<div class="faint" style="padding:8px 6px;">Carregando…</div>';
    if (!lista.length) return '<div class="faint" style="padding:8px 6px;">Nenhum amigo confirmado ainda.</div>';
    const linhas = lista.map(ind =>
      '<div style="display:flex; justify-content:space-between; gap:10px; padding:6px 0; border-bottom:1px solid var(--border);">' +
        '<span><strong>'+esc(ind.nome)+'</strong> <span class="faint mono" style="font-size:11.5px;">'+esc(ind.telefone)+'</span></span>' +
        '<span class="faint" style="font-size:12px;">'+dataHoraBR(ind.dataConfirmacao)+'</span>' +
      '</div>'
    ).join("");
    return '<div style="padding:6px 4px;"><div class="muted" style="font-size:12px; font-weight:700; margin-bottom:4px;">Amigos indicados por ele:</div>' + linhas + '</div>';
  }
  function ligarAcoesResgateIndicacao(main){
    main.querySelectorAll("[data-toggle-resgate]").forEach(b=>{
      b.addEventListener("click", ()=>{ resgateIndicacaoEmEdicao.add(b.getAttribute("data-toggle-resgate")); renderTabelaResgateIndicacao(main); });
    });
    main.querySelectorAll("[data-cancelar-resgate]").forEach(b=>{
      b.addEventListener("click", ()=>{ resgateIndicacaoEmEdicao.delete(b.getAttribute("data-cancelar-resgate")); renderTabelaResgateIndicacao(main); });
    });
    main.querySelectorAll("[data-confirmar-resgate]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const indicacaoId = b.getAttribute("data-confirmar-resgate");
        const input = main.querySelector('[data-valor-resgate-input="'+indicacaoId+'"]');
        const valorVendaGerada = parseFloat(input ? input.value : "0");
        if (!(valorVendaGerada >= 0)){ toast("Informe o valor da venda gerada.", "erro"); return; }
        b.disabled = true;
        try {
          await api("/indicacoes/resgates", { method:"POST", body:{ indicacaoId, valorVendaGerada } });
          resgateIndicacaoEmEdicao.delete(indicacaoId);
          toast("Prêmio de indicação resgatado.");
          await renderIndicacoesResgate(main);
        } catch(err){
          b.disabled = false;
          if (err.status!==401) toast(mensagemErro(err), "erro");
        }
      });
    });
    main.querySelectorAll("[data-ver-indicados]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const indicacaoId = b.getAttribute("data-ver-indicados");
        if (indicacaoIndicadosExpandidos.has(indicacaoId)){
          indicacaoIndicadosExpandidos.delete(indicacaoId);
          renderTabelaResgateIndicacao(main);
          return;
        }
        indicacaoIndicadosExpandidos.add(indicacaoId);
        renderTabelaResgateIndicacao(main);
        if (!indicadosPorIndicacaoCache[indicacaoId]){
          try { indicadosPorIndicacaoCache[indicacaoId] = await api("/indicacoes/"+indicacaoId+"/indicados"); }
          catch(err){ if (err.status!==401){ toast(mensagemErro(err), "erro"); indicadosPorIndicacaoCache[indicacaoId] = []; } }
          renderTabelaResgateIndicacao(main);
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  // Página: Vendas → Nova Venda (registrar venda + disparo de giftback)
  // ---------------------------------------------------------------------
  let novaCompraResultado = null; // { clienteId, compraId, elegiveis, enviados: {campanhaId: {mensagem, link}} }

  function renderNovaCompra(main){
    setHeader("Nova Venda", "Assim que uma venda é registrada, o sistema calcula os giftbacks elegíveis para o cliente e você escolhe qual disparar.",
      '<button class="btn header-btn btn-sm" id="btn-ir-consultar-vendas">Consultar vendas</button>');
    const clientes = Object.values(state.clientes).sort((a,b)=>a.nome.localeCompare(b.nome));
    const produtos = Object.values(state.produtos).sort((a,b)=>a.nome.localeCompare(b.nome));

    main.innerHTML =
      '<div class="card" style="max-width:560px;">' +
        '<form id="form-compra" class="form-grid">' +
          campoAutocompleteCliente("cliente", "Cliente", true) +
          '<div class="field"><label>Produto comprado *</label><select name="produto" required><option value="">Selecione…</option>' +
            produtos.map(p=>'<option value="'+p.id+'">'+esc(p.nome)+'</option>').join("") + '</select></div>' +
          '<div class="field full"><label>Valor pago (R$) *</label><input type="number" name="valor" min="0" step="0.01" required placeholder="1500,00"></div>' +
          '<div class="field full"><button class="btn btn-primary" type="submit">Registrar compra e calcular giftbacks</button></div>' +
        '</form>' +
      '</div>' +
      '<div id="resultado-elegibilidade" class="section" style="margin-top:22px;"></div>';

    ligarAutocompleteCliente(main, "cliente", clientes);

    document.getElementById("form-compra").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const clienteId = fd.get("cliente"), produtoId = fd.get("produto"), valor = parseFloat(fd.get("valor"));
      if (!clienteId || !produtoId){ toast("Selecione cliente e produto.", 'erro'); return; }
      const botao = e.target.querySelector('button[type="submit"]');
      botao.disabled = true;
      try {
        const { compra, elegiveis } = await api("/compras", { method:"POST", body:{ clienteId, produtoId, valor } });
        await carregarTudo();
        novaCompraResultado = { clienteId, compraId: compra.id, elegiveis, enviados: {} };
        renderResultadoElegibilidade();
        toast("Compra registrada.");
      } catch(err){
        if (err.status!==401) toast(mensagemErro(err), "erro");
      } finally {
        botao.disabled = false;
      }
    });
    document.getElementById("btn-ir-consultar-vendas").addEventListener("click", ()=>ir("vendas-consultar"));

    renderResultadoElegibilidade();
  }

  // ---------------------------------------------------------------------
  // Página: Vendas → Consultar Vendas
  // ---------------------------------------------------------------------
  function renderVendasConsultar(main){
    setHeader("Consultar Vendas", "Todas as vendas registradas, de origem direta ou geradas pela conversão de um giftback.",
      '<button class="btn header-btn btn-sm" id="btn-ir-nova-venda">' + ICONS.plus + ' Nova venda</button>');
    const clientes = Object.values(state.clientes).sort((a,b)=>a.nome.localeCompare(b.nome));
    const compras = Object.values(state.compras).sort((a,b)=> new Date(b.data)-new Date(a.data));

    main.innerHTML =
      '<div class="card" style="margin-bottom:16px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">' +
        '<label class="muted" style="font-size:12.5px; font-weight:700;">Filtrar por cliente:</label>' +
        '<select id="filtro-cliente-venda" style="max-width:260px;"><option value="">Todos os clientes</option>' +
          clientes.map(c=>'<option value="'+c.id+'">'+esc(c.nome)+'</option>').join("") +
        '</select>' +
      '</div>' +
      '<div class="card table-wrap" id="tabela-vendas">' + tabelaVendas(compras) + '</div>';

    document.getElementById("btn-ir-nova-venda").addEventListener("click", ()=>ir("vendas-nova"));
    document.getElementById("filtro-cliente-venda").addEventListener("change", (e)=>{
      const cid = e.target.value;
      const filtradas = cid ? compras.filter(c=>c.clienteId===cid) : compras;
      document.getElementById("tabela-vendas").innerHTML = tabelaVendas(filtradas);
    });
  }
  function tabelaVendas(lista){
    if (!lista.length) return '<div class="empty">Nenhuma venda registrada ainda.</div>';
    const origemLabel = { compra_direta: "Venda direta", conversao_giftback: "Conversão de giftback" };
    const rows = lista.map(c => {
      const cli = state.clientes[c.clienteId] || {nome:"—"};
      const prod = state.produtos[c.produtoId] || {nome:"—"};
      return '<tr><td><strong>'+esc(cli.nome)+'</strong></td><td class="muted">'+esc(prod.nome)+'</td>' +
        '<td><strong>'+reais(c.valor)+'</strong></td>' +
        '<td class="faint">'+esc(origemLabel[c.origem]||c.origem)+'</td>' +
        '<td class="faint">'+dataHoraBR(c.data)+'</td></tr>';
    }).join("");
    return '<table><thead><tr><th>Cliente</th><th>Produto</th><th>Valor</th><th>Origem</th><th>Data</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  function renderResultadoElegibilidade(){
    const box = document.getElementById("resultado-elegibilidade");
    if (!box || !novaCompraResultado) return;
    const { clienteId, compraId, elegiveis, enviados } = novaCompraResultado;
    const cliente = state.clientes[clienteId];
    if (!cliente) return;

    if (!elegiveis.length){
      box.innerHTML = '<div class="card empty">Nenhum giftback elegível para ' + esc(cliente.nome) + ' com esta compra — todas as campanhas para os produtos-alvo disponíveis já foram usadas ou já são consumidas por este cliente.</div>';
      return;
    }
    box.innerHTML =
      '<div class="section-title" style="margin-bottom:12px;">Giftbacks elegíveis para ' + esc(cliente.nome) + '</div>' +
      '<div class="grid" id="lista-elegiveis" style="grid-template-columns:repeat(auto-fill, minmax(320px,1fr));">' +
        elegiveis.map(c => elegivelCardHtml(c, enviados[c.id])).join("") +
      '</div>';

    box.querySelectorAll("[data-enviar]").forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const campId = btn.getAttribute("data-enviar");
        btn.disabled = true;
        try {
          const { mensagem, link, envioAutomatico } = await api("/campanhas/"+campId+"/enviar", { method:"POST", body:{ clienteId, compraId } });
          novaCompraResultado.enviados[campId] = { mensagem, link, envioAutomatico };
          await carregarTudo();
          renderResultadoElegibilidade();
          if (envioAutomatico) wameToastEnvio(envioAutomatico, "Giftback", (state.clientes[clienteId]||{}).nome);
          else toast("Giftback gerado e marcado como enviado.");
        } catch(err){
          btn.disabled = false;
          if (err.status!==401) toast(mensagemErro(err), "erro");
        }
      });
    });
    box.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", ()=> copiar(btn.getAttribute("data-copy")));
    });
  }
  function elegivelCardHtml(c, enviado){
    if (enviado){
      return '<div class="campaign-card">' +
        '<div class="campaign-flow">' + esc(c.titulo) + '</div>' +
        '<div class="msg-preview">' + esc(enviado.mensagem) + '</div>' +
        wameAvisoEnvioHtml(enviado.envioAutomatico) +
        '<div class="link-box">' + esc(enviado.link) + '</div>' +
        '<div class="btn-row">' +
          '<a class="btn btn-primary btn-sm" href="'+esc(enviado.link)+'" target="_blank" rel="noopener">' + ICONS.whatsapp + ' Abrir WhatsApp</a>' +
          '<button class="btn btn-sm" data-copy="'+esc(enviado.link)+'">' + ICONS.copy + ' Copiar link</button>' +
        '</div>' +
        '<div class="faint">Enviado — acompanhe em Controle Giftback.</div>' +
      '</div>';
    }
    return '<div class="campaign-card">' +
      '<div class="campaign-flow">' + esc(c.titulo) + '</div>' +
      '<div class="campaign-meta"><span class="pill-value">' + reais(c.valor) + '</span><span>para ' + esc((state.produtos[c.produtoAlvoId]||{}).nome||"") + '</span>' +
        (c.valorMinimoCompra ? '<span>compra mín. ' + reais(c.valorMinimoCompra) + '</span>' : '') +
        '<span>válido ' + c.validadeDias + ' dias</span></div>' +
      '<div class="btn-row"><button class="btn btn-primary btn-sm" data-enviar="'+c.id+'">' + ICONS.whatsapp + (wameAtiva() ? ' Enviar pelo WhatsApp' : ' Gerar link e marcar como enviado') + '</button></div>' +
    '</div>';
  }

  // ---------------------------------------------------------------------
  // Página: Giftback → Giftbacks Elegíveis (lista consolidada de todas as
  // campanhas ativas, com botão de envio direto)
  // ---------------------------------------------------------------------
  // Agrupa a resposta de GET /giftback/elegiveis por cliente — um cliente
  // pode estar elegível em mais de uma campanha ao mesmo tempo (uma linha por
  // cliente, com seleção da campanha dentro do popup de envio).
  let giftbackElegiveisCache = []; // cache local: vem de GET /giftback/elegiveis, refeito ao entrar na tela e após cada envio
  function clientesGiftbackElegiveis(){
    const porCliente = {};
    giftbackElegiveisCache.forEach(l => {
      if (!porCliente[l.clienteId]){
        porCliente[l.clienteId] = { clienteId: l.clienteId, clienteNome: l.clienteNome, clienteTelefone: l.clienteTelefone, elegiveis: [] };
      }
      porCliente[l.clienteId].elegiveis.push(l);
    });
    return Object.values(porCliente).sort((a,b)=> a.clienteNome.localeCompare(b.clienteNome));
  }
  function ultimoEnvioDoCliente(clienteId){
    const envios = Object.values(state.envios).filter(e => e.clienteId === clienteId && e.status !== 'cancelado');
    if (!envios.length) return null;
    const ultimo = envios.sort((a,b)=> new Date(b.dataEnvio)-new Date(a.dataEnvio))[0];
    const campanha = state.campanhas[ultimo.campanhaId];
    return { dataEnvio: ultimo.dataEnvio, campanhaTitulo: campanha ? campanha.titulo : "—" };
  }

  let filtroGiftbackElegivel = "";

  async function renderGiftbackElegiveis(main){
    setHeader("Giftbacks Elegíveis", "Todos os clientes elegíveis a receber um giftback agora, juntando todas as campanhas ativas.");
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    try { giftbackElegiveisCache = await api("/giftback/elegiveis"); }
    catch(err){
      if (err.status === 401) return;
      main.innerHTML = '<div class="card empty">Não foi possível carregar os giftbacks elegíveis.</div>';
      return;
    }

    main.innerHTML =
      '<div class="card" style="margin-bottom:16px;">' +
        '<div class="autocomplete-wrap busca-com-icone" style="max-width:360px;">' +
          '<span class="busca-icone">' + ICONS.search + '</span>' +
          '<input type="text" id="busca-cliente-elegivel" class="autocomplete-input" placeholder="Buscar cliente pelo nome…" value="'+esc(filtroGiftbackElegivel)+'" autocomplete="off">' +
        '</div>' +
      '</div>' +
      '<div class="card table-wrap" id="tabela-elegiveis-wrap">' + giftbackElegiveisTabelaHtml() + '</div>';

    const busca = document.getElementById("busca-cliente-elegivel");
    busca.addEventListener("input", () => {
      filtroGiftbackElegivel = busca.value;
      const wrap = document.getElementById("tabela-elegiveis-wrap");
      wrap.innerHTML = giftbackElegiveisTabelaHtml();
      ligarAcoesGiftbackElegiveis(wrap);
    });

    ligarAcoesGiftbackElegiveis(main);
  }
  function giftbackElegiveisTabelaHtml(){
    const listaCompleta = clientesGiftbackElegiveis();
    const termo = filtroGiftbackElegivel.trim().toLowerCase();
    const lista = termo ? listaCompleta.filter(c => c.clienteNome.toLowerCase().includes(termo)) : listaCompleta;
    if (!lista.length){
      return '<div class="empty">' + (termo ? 'Nenhum cliente encontrado para “'+esc(filtroGiftbackElegivel)+'”.' : 'Nenhum cliente elegível no momento.') + '</div>';
    }
    const rows = lista.map(c => {
      const ultimo = ultimoEnvioDoCliente(c.clienteId);
      return '<tr>' +
        '<td><strong>'+esc(c.clienteNome)+'</strong></td>' +
        '<td class="faint mono">'+esc(c.clienteTelefone)+'</td>' +
        '<td class="muted">' + (c.elegiveis.length > 1 ? c.elegiveis.length + ' campanhas elegíveis' : esc(c.elegiveis[0].campanhaTitulo)) + '</td>' +
        '<td>' + (ultimo
            ? '<span class="faint" style="font-size:11.5px; line-height:1.5;">Último envio em '+dataHoraBR(ultimo.dataEnvio)+'<br>campanha: <strong>'+esc(ultimo.campanhaTitulo)+'</strong></span>'
            : '<span class="faint">—</span>') +
        '</td>' +
        '<td><button class="btn btn-primary btn-sm" data-cliente-elegivel="'+c.clienteId+'">' + ICONS.whatsapp + ' Enviar giftback</button></td>' +
      '</tr>';
    }).join("");
    return '<table><thead><tr><th>Cliente</th><th>WhatsApp</th><th>Campanha(s) elegível(is)</th><th>Último envio</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function ligarAcoesGiftbackElegiveis(main){
    main.querySelectorAll("[data-cliente-elegivel]").forEach(btn => {
      btn.addEventListener("click", () => {
        const clienteId = btn.getAttribute("data-cliente-elegivel");
        const item = clientesGiftbackElegiveis().find(c => c.clienteId === clienteId);
        if (item) abrirModalEnviarGiftback(item);
      });
    });
  }

  // Popup de confirmação: escolher a campanha (quando o cliente está
  // elegível em mais de uma), ver o preview da mensagem e então enviar.
  function modalEnviarGiftbackHtml(cliente, elegiveis){
    const multiplas = elegiveis.length > 1;
    return (
      '<div class="modal-head"><div class="modal-title">Enviar Giftback</div><button type="button" class="modal-close" data-modal-fechar>'+ICONS.close+'</button></div>' +
      '<p class="muted" style="font-size:12.5px; margin:0 0 14px;">Cliente: <strong>'+esc(cliente.nome)+'</strong> · <span class="mono">'+esc(cliente.telefone||"")+'</span></p>' +
      (multiplas
        ? '<div class="field" style="margin-bottom:14px;"><label>Campanha elegível *</label><select id="modal-select-campanha">' +
            elegiveis.map((e,i)=>'<option value="'+i+'">'+esc(e.campanhaTitulo)+' — '+reais(e.valor)+'</option>').join("") +
          '</select></div>'
        : '<div class="field" style="margin-bottom:14px;"><label>Campanha elegível</label><div style="font-size:13px; color:var(--text); margin-top:2px;"><strong>'+esc(elegiveis[0].campanhaTitulo)+'</strong> — '+reais(elegiveis[0].valor)+'</div></div>'
      ) +
      '<div style="margin-bottom:16px;">' + whatsappPreviewShellHtml("modal-giftback") + '</div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn" data-modal-fechar>Cancelar</button>' +
        '<button type="button" class="btn btn-primary" id="modal-btn-confirmar-envio">' + ICONS.whatsapp + (wameAtiva() ? ' Enviar pelo WhatsApp' : ' Enviar e abrir WhatsApp') + '</button>' +
      '</div>'
    );
  }
  function abrirModalEnviarGiftback(item){
    const cliente = state.clientes[item.clienteId];
    const elegiveis = item.elegiveis;
    if (!cliente || !elegiveis.length) return;
    const overlay = abrirModal(modalEnviarGiftbackHtml(cliente, elegiveis));
    const select = overlay.querySelector("#modal-select-campanha");

    function itemSelecionado(){
      return elegiveis[select ? (Number(select.value)||0) : 0];
    }
    function atualizarPreview(){
      const alvo = itemSelecionado();
      const campanha = state.campanhas[alvo.campanhaId];
      const el = overlay.querySelector('[data-wa-preview="modal-giftback"]');
      if (el && campanha) el.innerHTML = textoPreviewBubbleHtml(previewMensagemGiftback(campanha, cliente));
    }
    if (select) select.addEventListener("change", atualizarPreview);
    atualizarPreview();

    overlay.querySelectorAll("[data-modal-fechar]").forEach(b => b.addEventListener("click", fecharModal));

    const btnConfirmar = overlay.querySelector("#modal-btn-confirmar-envio");
    btnConfirmar.addEventListener("click", async () => {
      const alvo = itemSelecionado();
      btnConfirmar.disabled = true;
      // Abre a aba em branco AGORA, ainda dentro do gesto de clique do usuário —
      // navegadores (principalmente Safari/iOS) só permitem window.open sem
      // bloqueio de pop-up quando ele acontece de forma síncrona a partir do
      // clique. Como enviarGiftback() é assíncrono (grava no banco antes de
      // termos o link), abrir a aba só depois do await já conta como não ter
      // vindo de uma interação direta, e o navegador bloqueia silenciosamente.
      const abaWhatsapp = wameAbrirAbaSeManual();
      let resp;
      try {
        resp = await api("/campanhas/"+alvo.campanhaId+"/enviar", { method:"POST", body:{ clienteId: alvo.clienteId, compraId: alvo.compraId } });
        giftbackElegiveisCache = await api("/giftback/elegiveis");
        await carregarTudo();
      } catch(err){
        if (abaWhatsapp) abaWhatsapp.close();
        btnConfirmar.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível enviar o giftback."), 'erro');
        return;
      }
      fecharModal();
      wameConcluirEnvio(abaWhatsapp, resp);
      wameToastEnvio(resp.envioAutomatico, "Giftback", cliente.nome);
      const wrap = document.getElementById("tabela-elegiveis-wrap");
      if (wrap){
        wrap.innerHTML = giftbackElegiveisTabelaHtml();
        ligarAcoesGiftbackElegiveis(wrap);
      }
    });
  }

  // ---------------------------------------------------------------------
  // Página: Giftback → Controle Giftback (histórico completo de envios)
  // ---------------------------------------------------------------------
  function renderControleGiftback(main, clienteIdFiltro){
    setHeader("Controle Giftback", "Todo giftback já enviado, com status de leitura, confirmação e uso do voucher.");
    const clientes = Object.values(state.clientes).sort((a,b)=>a.nome.localeCompare(b.nome));
    let envios = Object.values(state.envios).sort((a,b)=> new Date(b.dataEnvio)-new Date(a.dataEnvio));
    if (clienteIdFiltro) envios = envios.filter(e => e.clienteId === clienteIdFiltro);

    main.innerHTML =
      '<div class="card" style="margin-bottom:16px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">' +
        '<label class="muted" style="font-size:12.5px; font-weight:700;">Filtrar por cliente:</label>' +
        '<select id="filtro-cliente" style="max-width:260px;"><option value="">Todos os clientes</option>' +
          clientes.map(c=>'<option value="'+c.id+'" '+(c.id===clienteIdFiltro?'selected':'')+'>'+esc(c.nome)+'</option>').join("") +
        '</select>' +
      '</div>' +
      '<div class="card table-wrap">' + (envios.length ? tabelaEnvios(envios, {compacta:false}) : '<div class="empty">Nenhum envio registrado ainda.</div>') + '</div>';

    document.getElementById("filtro-cliente").addEventListener("change", (e)=>{
      ir("giftback-controle" + (e.target.value ? "/"+e.target.value : ""));
    });
    ligarAcoesEnvio(main);
  }

  // ---------------------------------------------------------------------
  // Tabela de envios (compartilhada entre Painel e Controle Giftback)
  // ---------------------------------------------------------------------
  function badgeStatus(status){
    const labels = { enviado:"Enviado", visualizado:"Visualizado", confirmado:"Confirmado", expirado:"Expirado", cancelado:"Cancelado" };
    return '<span class="badge b-'+status+'">'+ (labels[status]||status) +'</span>';
  }
  function badgeVoucher(v){
    if (!v) return '<span class="faint">—</span>';
    const efetivo = (v.status === 'ativo' && new Date(v.validoAte) < new Date()) ? 'expirado' : v.status;
    const labels = { ativo:"Ativo", utilizado:"Utilizado", expirado:"Expirado" };
    return '<span class="mono" style="font-size:11.5px;">'+esc(v.codigo)+'</span> <span class="badge b-'+ (efetivo==='utilizado'?'utilizado': efetivo==='expirado'?'expirado':'ativo') +'">'+labels[efetivo]+'</span>';
  }

  // Envios cujo botão "Venda gerada" está com o formulário de valor de
  // venda aberto (precisa sobreviver a re-renders — mesmo padrão de sempre).
  let usoEmEdicao = new Set();

  function valorGeradoHtml(voucher){
    if (!voucher || voucher.status !== 'utilizado' || !voucher.compraGeradaId) return '<span class="faint">—</span>';
    const compra = state.compras[voucher.compraGeradaId];
    if (!compra) return '<span class="faint">—</span>';
    return '<strong style="color:var(--success);">' + reais(compra.valor) + '</strong>';
  }

  function tabelaEnvios(lista, opts){
    if (!lista.length) return '<div class="empty">Nada por aqui ainda.</div>';
    const rows = lista.map(e => {
      const cli = state.clientes[e.clienteId] || {nome:"—"};
      const camp = state.campanhas[e.campanhaId] || {titulo:"—", valorMinimoCompra:0};
      const voucher = state.vouchers[e.id];
      const efetivoExpirado = voucher && voucher.status==='ativo' && new Date(voucher.validoAte) < new Date();
      let acoes = '<button class="btn btn-ghost btn-sm" data-ver-resgate="'+e.tok+'">Ver página de resgate</button>';
      if (voucher && voucher.status === 'ativo' && !efetivoExpirado){
        if (usoEmEdicao.has(e.id)){
          acoes = '<div style="display:flex; flex-wrap:nowrap; gap:6px; align-items:center;">' +
            '<input type="number" min="'+(camp.valorMinimoCompra||0)+'" step="0.01" value="'+(camp.valorMinimoCompra||0)+'" data-valor-venda-input="'+e.id+'" style="width:90px; flex:none; padding:6px 8px; background:var(--surface-2); border:1px solid var(--border); border-radius:8px; color:var(--text);">' +
            '<button class="btn btn-primary btn-sm" style="flex:none;" data-confirmar-uso="'+e.id+'">Confirmar</button>' +
            '<button class="btn btn-ghost btn-sm" style="flex:none;" data-cancelar-uso="'+e.id+'">Cancelar</button>' +
          '</div>';
        } else {
          acoes += ' <button class="btn btn-sm" data-toggle-uso="'+e.id+'">Venda gerada</button>';
        }
      }
      return '<tr>' +
        '<td><strong>'+esc(cli.nome)+'</strong></td>' +
        '<td class="muted">'+esc(camp.titulo)+'</td>' +
        '<td>'+badgeStatus(e.status)+'</td>' +
        '<td class="faint">'+dataHoraBR(e.dataEnvio)+'</td>' +
        (opts.compacta ? '' : '<td class="faint">'+dataHoraBR(e.dataConfirmacao)+'</td>') +
        '<td>'+badgeVoucher(voucher)+'</td>' +
        (opts.compacta ? '' : '<td>'+valorGeradoHtml(voucher)+'</td>') +
        (opts.compacta ? '' : '<td class="btn-row">'+acoes+'</td>') +
      '</tr>';
    }).join("");
    const head = opts.compacta
      ? '<tr><th>Cliente</th><th>Campanha</th><th>Status</th><th>Enviado em</th><th>Voucher</th></tr>'
      : '<tr><th>Cliente</th><th>Campanha</th><th>Status</th><th>Enviado em</th><th>Confirmado em</th><th>Voucher</th><th>Valor gerado</th><th>Ações</th></tr>';
    return '<table><thead>'+head+'</thead><tbody>'+rows+'</tbody></table>';
  }

  function ligarAcoesEnvio(scope){
    scope.querySelectorAll("[data-ver-resgate]").forEach(b=>{
      b.addEventListener("click", ()=> ir("resgate/"+b.getAttribute("data-ver-resgate")));
    });
    scope.querySelectorAll("[data-toggle-uso]").forEach(b=>{
      b.addEventListener("click", ()=>{ usoEmEdicao.add(b.getAttribute("data-toggle-uso")); render(); });
    });
    scope.querySelectorAll("[data-cancelar-uso]").forEach(b=>{
      b.addEventListener("click", ()=>{ usoEmEdicao.delete(b.getAttribute("data-cancelar-uso")); render(); });
    });
    scope.querySelectorAll("[data-confirmar-uso]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const envioId = b.getAttribute("data-confirmar-uso");
        const input = scope.querySelector('[data-valor-venda-input="'+envioId+'"]');
        const valorVenda = parseFloat(input ? input.value : "0");
        b.disabled = true;
        const ok = await usarVoucher(envioId, valorVenda);
        if (ok){ usoEmEdicao.delete(envioId); render(); }
        else b.disabled = false;
      });
    });
  }

  async function usarVoucher(envioId, valorVenda){
    const valor = Number(valorVenda);
    if (!(valor > 0)){ toast("Informe o valor da venda gerada.", 'erro'); return false; }
    try {
      await api("/vouchers/"+envioId+"/usar", { method:"POST", body:{ valorVenda: valor } });
      await carregarTudo();
      toast("Voucher utilizado — nova compra registrada e cliente convertido no produto-alvo.");
      return true;
    } catch(err){
      if (err.status!==401) toast(mensagemErro(err, "Não foi possível registrar o uso do voucher."), 'erro');
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // Cliente HTTP para as páginas públicas (resgate/indicação) — igual à
  // api() do painel interno, mas sem token de autenticação e sem o
  // tratamento de 401 (rotas públicas não exigem login; erros de negócio
  // chegam tanto como `{erro}` com status 200 quanto com status 4xx/5xx,
  // conforme routes/public.js).
  // ---------------------------------------------------------------------
  async function apiPublica(path, opts){
    opts = opts || {};
    const resp = await fetch("/api" + path, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await resp.json(); } catch(e){ data = null; }
    if (!resp.ok){
      const err = new Error((data && data.erro) || "Erro inesperado.");
      err.status = resp.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  // ---------------------------------------------------------------------
  // Página pública de resgate (o que o cliente vê ao clicar no link)
  // ---------------------------------------------------------------------
  async function renderResgate(tok){
    const main = document.getElementById("main");
    main.style.padding = "0";
    main.innerHTML = '<div class="redeem-wrap"><div class="redeem-card">Carregando…</div></div>';

    let ctx;
    try { ctx = await apiPublica("/public/resgate/"+tok); }
    catch(err){
      main.innerHTML = telaResgate({ erro: mensagemErro(err, "Não foi possível abrir este giftback.") });
      return;
    }
    main.innerHTML = telaResgate(ctx);
    if (ctx.confirmado){
      ligarCronometro();
      return;
    }
    if (!ctx.erro) ligarFormularioConfirmacao(tok);
  }

  function ligarFormularioConfirmacao(tok){
    const form = document.getElementById("form-confirmar-resgate");
    if (!form) return;
    const input = document.getElementById("input-ultimos4");
    const erroEl = document.getElementById("erro-ultimos4");
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const digitado = (input.value || "").replace(/\D/g,"");
      if (digitado.length !== 4){
        erroEl.textContent = "Digite os 4 últimos números do seu WhatsApp.";
        erroEl.style.display = "block";
        return;
      }
      erroEl.style.display = "none";
      const botao = document.getElementById("btn-confirmar-resgate");
      botao.disabled = true;
      botao.textContent = "Ativando…";
      try {
        await apiPublica("/public/resgate/"+tok+"/confirmar", { method:"POST", body:{ ultimos4: digitado } });
        // Refaz o GET (em vez de montar a tela a partir da resposta do POST)
        // para já vir com `empresa` — só o GET devolve o subconjunto de
        // branding usado no rodapé de confiança e no botão de retorno.
        await renderResgate(tok);
      } catch(err){
        erroEl.textContent = mensagemErro(err, "Não foi possível confirmar o resgate.");
        erroEl.style.display = "block";
        input.value = "";
        input.focus();
        botao.disabled = false;
        botao.textContent = "Confirmar resgate";
      }
    });
  }

  function telaResgate(ctx){
    if (ctx.erro){
      return '<div class="redeem-wrap"'+redeemWrapAttr(ctx.empresa)+'><div class="redeem-card">' +
        '<div class="redeem-badge" style="background:linear-gradient(135deg, var(--danger), #8a2c20);">' + ICONS.gift + '</div>' +
        '<div class="redeem-title">Não foi possível abrir este giftback</div>' +
        '<p class="muted" style="font-size:13.5px;">' + esc(ctx.erro) + '</p>' +
        rodapeConfiancaHtml(ctx.empresa) +
        '<a class="back-link" href="#/dashboard">← Ir para o painel interno</a>' +
      '</div></div>';
    }
    if (ctx.confirmado){
      const v = ctx.voucher || {};
      const c = ctx.campanha || {};
      return '<div class="redeem-wrap"'+redeemWrapAttr(ctx.empresa)+'><div class="redeem-card">' +
        '<div class="redeem-badge">' + ICONS.check + '</div>' +
        '<div class="redeem-title">Giftback já ativado ✓</div>' +
        '<p class="muted" style="font-size:13.5px;">Oi ' + esc(primeiroNome(ctx.cliente.nome)) + ', seu voucher para <strong>' + esc(ctx.produtoAlvoNome) + '</strong> está pronto para uso.</p>' +
        '<div class="voucher-code">' + esc(v.codigo||"") + '</div>' +
        '<p class="faint">Válido até ' + dataBR(v.validoAte) + (c.valorMinimoCompra ? '. Compra mínima para uso: ' + reais(c.valorMinimoCompra) + '.' : '.') + ' Apresente este código na recepção.</p>' +
        cronometroHtml(v.validoAte, "Tempo restante para resgate") +
        botaoRetornoWhatsapp(ctx.linkRetorno) +
        rodapeConfiancaHtml(ctx.empresa) +
        '<a class="back-link" href="#/dashboard">← Voltar ao painel interno (visão do atendente)</a>' +
      '</div></div>';
    }
    const c = ctx.campanha;
    return '<div class="redeem-wrap"'+redeemWrapAttr(ctx.empresa)+'><div class="redeem-card">' +
      '<div class="redeem-badge">' + ICONS.gift + '</div>' +
      '<div class="faint" style="text-transform:uppercase; letter-spacing:.05em; font-weight:700; font-size:11px;">Giftback para ' + esc(primeiroNome(ctx.cliente.nome)) + '</div>' +
      '<div class="redeem-value">' + reais(c.valor) + '</div>' +
      '<div class="redeem-title">para usar em ' + esc(ctx.produtoAlvoNome) + '</div>' +
      '<div class="redeem-rules"><strong style="display:block; margin-bottom:4px; color:var(--text);">Regras de uso</strong>' + esc(c.regras || "Sem restrições adicionais.") +
        (c.valorMinimoCompra ? '<br><br><strong style="color:var(--text);">Compra mínima:</strong> ' + reais(c.valorMinimoCompra) : '') +
        '<br><br><strong style="color:var(--text);">Validade:</strong> ' + c.validadeDias + ' dias a partir da confirmação.</div>' +
      '<form id="form-confirmar-resgate">' +
        '<label style="display:block; text-align:left; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Para confirmar, digite os 4 últimos números do seu WhatsApp</label>' +
        '<input id="input-ultimos4" type="tel" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="0000" required ' +
          'style="width:100%; text-align:center; font-family:\'IBM Plex Mono\',monospace; font-size:20px; letter-spacing:0.3em; padding:10px; border-radius:9px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); margin-bottom:8px;">' +
        '<div id="erro-ultimos4" class="faint" style="display:none; color:var(--danger); margin-bottom:8px;"></div>' +
        '<button class="btn btn-primary" id="btn-confirmar-resgate" type="submit" style="width:100%; justify-content:center; padding:12px;">Confirmar resgate</button>' +
      '</form>' +
      rodapeConfiancaHtml(ctx.empresa) +
      '<a class="back-link" href="#/dashboard">← Voltar ao painel interno</a>' +
    '</div></div>';
  }

  function botaoRetornoWhatsapp(linkRetorno, rotulo){
    if (!linkRetorno){
      return '<p class="faint" style="margin-top:14px;">O WhatsApp do estabelecimento ainda não foi configurado (Configurações → Dados da empresa) — este passo fica desabilitado até lá.</p>';
    }
    return '<a class="btn btn-primary" href="'+esc(linkRetorno)+'" target="_blank" rel="noopener" style="width:100%; justify-content:center; padding:12px; margin-top:14px; text-decoration:none;">' +
      ICONS.whatsapp + ' ' + esc(rotulo || 'Agendar') + '</a>';
  }

  // ---------------------------------------------------------------------
  // Página pública de indicação — DOIS estágios no MESMO link/token:
  //   Estágio A: o próprio indicador confirma participação (últimos 4
  //   dígitos do WhatsApp dele) e recebe o botão para presentear os amigos.
  //   Estágio B: uma vez o indicador confirmado, o MESMO link, reaberto por
  //   qualquer pessoa (os amigos), vira "Você foi indicado por X e ganhou Y"
  //   com o formulário de nome + WhatsApp completo. Ver routes/public.js.
  // ---------------------------------------------------------------------
  // Um MESMO token serve dois papéis diferentes ao longo do tempo: primeiro o
  // link que o INDICADOR recebe (mostra as condições dele + confirmação por
  // últimos 4 dígitos); depois que ele confirma, o link passa a poder ser
  // reaberto por dois tipos de gente — o próprio indicador, revendo o status
  // da campanha dele, e os AMIGOS pra quem ele encaminhou (formulário de
  // nome+WhatsApp). Sem distinguir os dois, o indicador que reabrisse o
  // PRÓPRIO link (ex.: no histórico do WhatsApp) caía, por engano, na tela do
  // amigo ("Você foi indicado por você mesmo e ganhou..."). Dois sinais
  // resolvem isso: (1) o link que o indicador ENCAMINHA leva um sufixo
  // "/amigo" (ver linkParaAmigo em public.js) — vale pra qualquer link gerado
  // a partir de agora, em qualquer aparelho; (2) como sufixo não ajuda em
  // links já encaminhados ANTES desta correção, também guardamos neste
  // navegador, assim que ele vê o link ainda sem confirmar (só o indicador
  // pode ver isso — o link do amigo só passa a existir depois de confirmado),
  // uma marca de "este navegador é do dono do link", usada como resposta
  // padrão quando não há sufixo.
  function souDonoDoLinkIndicacao(tok, aindaNaoConfirmado){
    const chave = "gb_indicacao_dono_" + tok;
    try {
      if (aindaNaoConfirmado){ localStorage.setItem(chave, "1"); return true; }
      return localStorage.getItem(chave) === "1";
    } catch(e){ return false; }
  }
  async function renderIndicacaoPublica(tok, viaAmigoUrl){
    const main = document.getElementById("main");
    main.style.padding = "0";
    main.innerHTML = '<div class="redeem-wrap"><div class="redeem-card">Carregando…</div></div>';

    let ctx;
    try { ctx = await apiPublica("/public/indicacao/"+tok); }
    catch(err){
      main.innerHTML = telaIndicacao({ erro: mensagemErro(err, "Não foi possível abrir esta indicação.") });
      return;
    }
    const souDono = souDonoDoLinkIndicacao(tok, !ctx.indicadorConfirmado);
    ctx.ehAmigo = ctx.indicadorConfirmado && (viaAmigoUrl || !souDono);

    main.innerHTML = telaIndicacao(ctx);
    if (ctx.erro) return;
    if (ctx.ehAmigo) ligarFormularioIndicacao(tok, ctx);
    else if (!ctx.indicadorConfirmado) ligarFormularioIndicacaoIndicador(tok, ctx);
    else ligarBotaoCopiarLinkIndicacao();
  }

  // Estágio A: o indicador digita os últimos 4 números do WhatsApp dele para
  // confirmar participação (mesmo padrão de ligarFormularioConfirmacao() do
  // resgate de giftback). Ao confirmar, troca a tela LOCALMENTE para o botão
  // de presentear amigos — sem refazer o GET, que a partir de agora devolve
  // indicadorConfirmado:true e mostraria o formulário do amigo indicado.
  function ligarFormularioIndicacaoIndicador(tok, ctx){
    const form = document.getElementById("form-confirmar-indicador");
    if (!form) return;
    const input = document.getElementById("input-ultimos4-indicador");
    const erroEl = document.getElementById("erro-indicador");
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const digitado = (input.value || "").replace(/\D/g,"");
      if (digitado.length !== 4){
        erroEl.textContent = "Digite os 4 últimos números do seu WhatsApp.";
        erroEl.style.display = "block";
        return;
      }
      erroEl.style.display = "none";
      const botao = document.getElementById("btn-confirmar-indicador");
      botao.disabled = true;
      botao.textContent = "Confirmando…";
      try {
        const resp = await apiPublica("/public/indicacao/"+tok+"/confirmar-indicador", { method:"POST", body:{ ultimos4: digitado } });
        document.getElementById("main").innerHTML = telaIndicacao({
          empresa: ctx.empresa,
          campanha: resp.campanha || ctx.campanha,
          clienteIndicador: resp.clienteIndicador || ctx.clienteIndicador,
          linkIndicacao: resp.linkIndicacao || ctx.linkIndicacao,
          linkEncaminhar: resp.linkEncaminhar || ctx.linkEncaminhar,
          indicadorConfirmadoAgora: true,
        });
        ligarBotaoCopiarLinkIndicacao();
      } catch(err){
        erroEl.textContent = mensagemErro(err, "Não foi possível confirmar.");
        erroEl.style.display = "block";
        input.value = "";
        input.focus();
        botao.disabled = false;
        botao.textContent = "Quero participar";
      }
    });
  }
  function ligarBotaoCopiarLinkIndicacao(){
    const btn = document.getElementById("btn-copiar-link-indicacao");
    if (btn) btn.addEventListener("click", ()=> copiar(btn.getAttribute("data-link-indicacao")));
  }

  // Estágio B: o amigo indicado confirma nome completo + WhatsApp completo
  // (não há nada cadastrado ainda para conferir por últimos 4 dígitos).
  function ligarFormularioIndicacao(tok, ctx){
    const form = document.getElementById("form-confirmar-indicacao");
    if (!form) return;
    const erroEl = document.getElementById("erro-indicacao");
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const nome = (fd.get("nome")||"").trim();
      const telefone = (fd.get("telefone")||"").trim();
      erroEl.style.display = "none";
      const botao = document.getElementById("btn-confirmar-indicacao");
      botao.disabled = true;
      botao.textContent = "Enviando…";
      try {
        const resp = await apiPublica("/public/indicacao/"+tok+"/confirmar", { method:"POST", body:{ nome, telefone } });
        document.getElementById("main").innerHTML = telaIndicacao({
          empresa: ctx.empresa, campanha: ctx.campanha, clienteIndicador: ctx.clienteIndicador,
          confirmadoAgora: {
            nome: resp.nome, premioIndicado: resp.premioIndicado, ativadoEm: new Date().toISOString(),
            codigoVoucher: resp.codigoVoucher, linkAgendar: resp.linkAgendar,
          },
        });
        ligarCronometro();
      } catch(err){
        erroEl.textContent = mensagemErro(err, "Não foi possível confirmar.");
        erroEl.style.display = "block";
        botao.disabled = false;
        botao.textContent = "Emitir voucher";
      }
    });
  }

  function telaIndicacao(ctx){
    if (ctx.erro){
      return '<div class="redeem-wrap"'+redeemWrapAttr(ctx.empresa)+'><div class="redeem-card">' +
        '<div class="redeem-badge" style="background:linear-gradient(135deg, var(--danger), #8a2c20);">' + ICONS.gift + '</div>' +
        '<div class="redeem-title">Não foi possível abrir esta indicação</div>' +
        '<p class="muted" style="font-size:13.5px;">' + esc(ctx.erro) + '</p>' +
        rodapeConfiancaHtml(ctx.empresa) +
        '<a class="back-link" href="#/dashboard">← Ir para o painel interno</a>' +
      '</div></div>';
    }
    const c = ctx.campanha;
    const indicador = ctx.clienteIndicador || {};
    const nomeIndicador = esc(primeiroNome(indicador.nome));
    const botaoEncaminhar = ctx.linkEncaminhar
      ? '<a class="btn btn-primary" id="btn-presentear-amigos" href="'+esc(ctx.linkEncaminhar)+'" target="_blank" rel="noopener" data-link-indicacao="'+esc(ctx.linkIndicacao||"")+'" style="width:100%; justify-content:center; padding:12px; margin-top:14px; text-decoration:none;">' +
          ICONS.whatsapp + ' Presentear seus amigos</a>' +
        (ctx.linkIndicacao ? '<button type="button" class="btn btn-sm" id="btn-copiar-link-indicacao" data-link-indicacao="'+esc(ctx.linkIndicacao)+'" style="width:100%; justify-content:center; margin-top:8px;">' + ICONS.copy + ' Copiar link do convite</button>' : '')
      : '';

    let corpo;
    if (ctx.confirmadoAgora){
      // Estágio B, confirmado agora: o AMIGO acabou de confirmar a indicação.
      const r = ctx.confirmadoAgora;
      const alvoIndicacao = r.ativadoEm && c.validadeDias ? addDias(r.ativadoEm, c.validadeDias) : null;
      corpo =
        '<div class="redeem-badge">' + ICONS.check + '</div>' +
        '<div class="redeem-title">Indicação confirmada ✓</div>' +
        '<p class="muted" style="font-size:13.5px;">Valeu, ' + esc(primeiroNome(r.nome)) + '! Sua indicação por ' + nomeIndicador + ' foi registrada.</p>' +
        (r.premioIndicado ? '<div class="redeem-rules"><strong style="display:block; margin-bottom:4px; color:var(--text);">Seu presente de boas-vindas</strong>' + esc(r.premioIndicado) + '</div>' : '') +
        (r.codigoVoucher ? '<div class="voucher-code">' + esc(r.codigoVoucher) + '</div>' : '') +
        (alvoIndicacao ? cronometroHtml(alvoIndicacao, "Tempo restante para resgatar seu presente") : '') +
        botaoRetornoWhatsapp(r.linkAgendar, "Agendar agora") +
        '<p class="faint" style="margin-top:10px;">Em breve o estabelecimento entra em contato para combinar os detalhes.</p>';
    } else if (ctx.indicadorConfirmadoAgora || (ctx.indicadorConfirmado && !ctx.ehAmigo)){
      // Estágio A, já confirmado: aqui entram DOIS casos — (1) o INDICADOR
      // acabou de confirmar participação agora mesmo (ctx.indicadorConfirmadoAgora,
      // estado local após o POST) e (2) o INDICADOR reabriu o link dele
      // depois de já ter confirmado antes (ctx.ehAmigo é false — ver
      // souDonoDoLinkIndicacao/renderIndicacaoPublica pra como isso é
      // decidido). Nos dois casos é o PRÓPRIO indicador olhando, então mostra
      // o status dele + botão de encaminhar — nunca o formulário do amigo
      // indicado (esse só aparece no branch abaixo, quando ctx.ehAmigo).
      const progresso = (!ctx.indicadorConfirmadoAgora && typeof ctx.totalConfirmados === "number")
        ? '<p class="faint" style="margin-top:4px;">' + ctx.totalConfirmados + ' de ' + c.metaIndicacoes + ' amigo(s) confirmado(s) até agora.</p>'
        : '';
      corpo =
        '<div class="redeem-badge">' + ICONS.check + '</div>' +
        '<div class="redeem-title">Participação confirmada ✓</div>' +
        '<p class="muted" style="font-size:13.5px;">Agora é só chamar seus amigos! Cada um que confirmar pelo seu link ganha' + (c.premioIndicado ? ': <strong style="color:var(--text);">' + esc(c.premioIndicado) + '</strong>' : ' o presente de boas-vindas') + '.</p>' +
        progresso +
        botaoEncaminhar;
    } else if (ctx.ehAmigo){
      // Estágio B: quem abriu o link é um AMIGO indicado (não o próprio
      // indicador — ver ctx.ehAmigo em renderIndicacaoPublica), depois que o
      // indicador já confirmou participação anteriormente.
      corpo =
        '<div class="redeem-badge">' + ICONS.gift + '</div>' +
        '<div class="faint" style="text-transform:uppercase; letter-spacing:.05em; font-weight:700; font-size:11px;">Você foi indicado</div>' +
        '<div class="redeem-title" style="margin-top:6px;">Você foi indicado por ' + nomeIndicador + ' e acaba de ganhar ' + esc(c.premioIndicado || "um presente de boas-vindas") + '!</div>' +
        // A tela pública do indicado (amigo) não mostra "Condições" — isso
        // fica só na tela do indicador (branch else abaixo, tela dele). Aqui
        // entra a instrução direta de como confirmar, no lugar do campo de
        // condições.
        '<div class="redeem-rules">Para confirmar, informe seu nome e sobrenome e número do seu WhatsApp — clique em confirmar e resgatar.</div>' +
        '<form id="form-confirmar-indicacao" class="form-grid" style="grid-template-columns:1fr; margin-top:14px;">' +
          '<div class="field"><label>Seu nome completo</label><input type="text" name="nome" required placeholder="Seu nome completo"></div>' +
          '<div class="field"><label>Seu WhatsApp</label><input type="tel" name="telefone" required placeholder="+55 11 90000-0000"></div>' +
          '<div id="erro-indicacao" class="auth-error" style="display:none; color:var(--danger); font-size:12.5px;"></div>' +
          '<button class="btn btn-primary" id="btn-confirmar-indicacao" type="submit" style="justify-content:center; padding:12px;">Confirmar e resgatar</button>' +
        '</form>' +
        '<p class="faint" style="margin-top:10px; font-size:12px;">Após confirmar, não deixe de agendar o seu Voucher.</p>';
    } else {
      // Estágio A, ainda não confirmado: quem abriu o link é o PRÓPRIO
      // indicador (é para ele que o convite inicial foi enviado).
      corpo =
        '<div class="redeem-badge">' + ICONS.gift + '</div>' +
        '<div class="faint" style="text-transform:uppercase; letter-spacing:.05em; font-weight:700; font-size:11px;">Programa de indicação</div>' +
        '<div class="redeem-title" style="margin-top:6px;">' + esc(c.titulo) + '</div>' +
        '<div class="redeem-rules">' +
          '<strong style="display:block; margin-bottom:4px; color:var(--text);">Indique ' + c.metaIndicacoes + ' amigo(s) e ganhe:</strong>' + esc(c.premioIndicador) +
          (c.premioIndicado ? '<br><br><strong style="color:var(--text);">Cada amigo que confirmar ganha:</strong> ' + esc(c.premioIndicado) : '') +
          (c.condicoes ? '<br><br><strong style="color:var(--text);">Condições:</strong> ' + esc(c.condicoes) : '') +
        '</div>' +
        '<form id="form-confirmar-indicador" class="form-grid" style="grid-template-columns:1fr; margin-top:14px;">' +
          '<label style="display:block; text-align:left; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Para confirmar que é você, digite os 4 últimos números do seu WhatsApp</label>' +
          '<input id="input-ultimos4-indicador" type="tel" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="0000" required ' +
            'style="width:100%; text-align:center; font-family:\'IBM Plex Mono\',monospace; font-size:20px; letter-spacing:0.3em; padding:10px; border-radius:9px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); margin-bottom:8px;">' +
          '<div id="erro-indicador" class="faint" style="display:none; color:var(--danger); margin-bottom:8px;"></div>' +
          '<button class="btn btn-primary" id="btn-confirmar-indicador" type="submit" style="width:100%; justify-content:center; padding:12px;">Quero participar</button>' +
        '</form>';
    }

    return '<div class="redeem-wrap"'+redeemWrapAttr(ctx.empresa)+'><div class="redeem-card">' + corpo +
      rodapeConfiancaHtml(ctx.empresa) +
      '<a class="back-link" href="#/dashboard">← Ir para o painel interno</a>' +
    '</div></div>';
  }

  // ---------------------------------------------------------------------
  // Boot — substitui window.claude.use("db")/seedSeNecessario()/assinar()
  // do protótipo por uma inicialização real: rotas públicas (resgate/
  // indicação) não passam por login; as demais checam o token salvo e, se
  // houver, validam com GET /auth/me antes de carregar o painel (o refresh
  // de dados propriamente dito acontece em iniciarApp() → carregarTudo()).
  // ---------------------------------------------------------------------
  async function boot(){
    const btnMenuMobile = document.getElementById("btn-menu-mobile");
    const backdropMenuMobile = document.getElementById("sidebar-backdrop");
    if (btnMenuMobile) btnMenuMobile.addEventListener("click", abrirMenuMobile);
    if (backdropMenuMobile) backdropMenuMobile.addEventListener("click", fecharMenuMobile);

    const rotaInicial = rotaAtual().nome;
    if (rotaInicial === "resgate" || rotaInicial === "indicacao"){
      render();
      return;
    }

    const tokenSalvo = localStorage.getItem("gb_token");
    if (!tokenSalvo){
      renderLogin();
      return;
    }
    // Sessão do Painel Master: o token não tem empresaId, então GET /auth/me
    // (rota requireAuth de empresa) sempre rejeitaria — vai direto para o
    // fluxo master, que valida o token na primeira chamada a /master/empresas.
    if (localStorage.getItem("gb_role") === "master"){
      await iniciarAppMaster();
      return;
    }
    try {
      const resp = await api("/auth/me");
      state.usuario = resp.usuario;
      await iniciarApp();
    } catch (err){
      if (err.status !== 401) renderLogin();
      // 401 já foi tratado dentro de api() (limpa o token e mostra o login).
    }
  }
  boot();
})();
