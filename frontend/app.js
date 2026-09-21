(function(){
  "use strict";

  // Reaproveita a mesma imagem do logo já embutida na barra lateral (evita
  // duplicar o base64 do logo aqui) para exibir também nas páginas públicas.
  var LOGO_SRC = (document.querySelector(".brand-logo")||{}).src || "";
  var LOGO_TAG = LOGO_SRC ? '<img class="redeem-logo" src="'+LOGO_SRC+'" alt="Club’n Loyal">' : "";

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
  function ir(rota){ location.hash = "#/" + rota; }

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
      '<div class="redeem-badge" style="margin:0 0 16px;">' + ICONS.gift + '</div>' +
      '<div class="redeem-title" style="text-align:left;">Entrar no painel Club\'n Loyal</div>' +
      '<p class="muted" style="font-size:13px; margin:0 0 16px;">Acesse com o e-mail e senha da sua empresa.</p>' +
      (avisoInicial ? '<div class="auth-error">'+esc(avisoInicial)+'</div>' : '') +
      '<form id="form-login" class="form-grid" style="grid-template-columns:1fr;">' +
        '<div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="voce@empresa.com"></div>' +
        '<div class="field"><label>Senha</label><input type="password" name="senha" required placeholder="••••••••"></div>' +
        '<div id="erro-login" class="auth-error" style="display:none;"></div>' +
        '<button class="btn btn-primary" type="submit" style="justify-content:center; padding:11px;">Entrar</button>' +
      '</form>' +
      '<div class="auth-switch" style="margin-top:14px; font-size:12.5px; color:var(--text-muted);">Ainda não tem uma conta? <button id="ir-cadastro" type="button" style="background:none; border:none; color:var(--navy); font-weight:700; cursor:pointer; padding:0;">Cadastre sua empresa</button></div>'
    );
    document.getElementById("ir-cadastro").addEventListener("click", ()=>renderSignup());
    document.getElementById("form-login").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const erroEl = document.getElementById("erro-login");
      erroEl.style.display = "none";
      try {
        const resp = await api("/auth/login", { method:"POST", body:{ email: fd.get("email"), senha: fd.get("senha") } });
        localStorage.setItem("gb_token", resp.token);
        state.usuario = resp.usuario;
        await iniciarApp();
      } catch(err){
        erroEl.textContent = mensagemErro(err, "Não foi possível entrar.");
        erroEl.style.display = "block";
      }
    });
  }
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
  function logout(){
    localStorage.removeItem("gb_token");
    state.ready = false;
    state.usuario = null;
    state.config = {};
    location.hash = "#/dashboard";
    renderLogin();
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
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout && !btnLogout.dataset.ligado){
      btnLogout.dataset.ligado = "1";
      btnLogout.addEventListener("click", logout);
    }
    if (!location.hash || rotaAtual().nome === "resgate" || rotaAtual().nome === "indicacao") location.hash = "#/dashboard";
    render();
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
      renderIndicacaoPublica(params[0]);
      return;
    }
    if (!localStorage.getItem("gb_token")){ renderLogin(); return; }

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
    if (nome === "vendas-nova") return renderNovaCompra(main);
    if (nome === "vendas-consultar") return renderVendasConsultar(main);
    if (nome === "giftback-elegiveis") return renderGiftbackElegiveis(main);
    if (nome === "giftback-controle") return renderControleGiftback(main, params[0]);
    if (nome === "indicacoes-lista") return renderIndicacoesLista(main);
    if (nome === "indicacoes-resgate") return renderIndicacoesResgate(main);
    if (nome === "config-empresa") return renderConfigEmpresa(main);
    if (nome === "config-aparencia") return renderConfigAparencia(main);
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
          const { mensagem, link } = await api("/campanhas/"+campanhaId+"/enviar", { method:"POST", body:{ clienteId, compraId } });
          enviosRecentesPorCampanha[campanhaId] = enviosRecentesPorCampanha[campanhaId] || {};
          enviosRecentesPorCampanha[campanhaId][clienteId] = { mensagem, link };
          await carregarTudo();
          renderCampanhasConsultar(document.getElementById("main"));
          toast("Giftback enviado para " + (state.clientes[clienteId]||{}).nome + ".");
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
                  '<textarea name="mensagem" required placeholder="Oi {{nome_cliente}}! ...">Oi {{nome_cliente}}! Indique {{meta_indicacoes}} amigos e ganhe: {{premio_indicador}} 🎁. Compartilhe seu link: {{link_indicacao}}</textarea>' +
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
      const vars = {
        nome_cliente: "Marina",
        nome_indicador: "Marina",
        meta_indicacoes: meta || "3",
        premio_indicador: premioIndicador || "R$ 100 de desconto em qualquer procedimento",
        premio_indicado: premioIndicado || "10% de desconto na primeira visita",
        condicoes: condicoes || "válido por cliente, um prêmio por meta atingida",
        link_indicacao: linkPublico("indicacao/abc123"),
      };
      const elMsg = main.querySelector('[data-wa-preview="mensagem"]');
      const elEnc = main.querySelector('[data-wa-preview="textoEncaminhar"]');
      const taMsg = formIndicacao.querySelector('textarea[name="mensagem"]');
      const taEnc = formIndicacao.querySelector('textarea[name="textoEncaminhar"]');
      if (elMsg) elMsg.innerHTML = textoPreviewBubbleHtml(aplicarVarsPreview(taMsg.value, vars));
      if (elEnc) elEnc.innerHTML = textoPreviewBubbleHtml(aplicarVarsPreview(taEnc.value, vars));
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
  let indicacaoCampanhasExpandidas = new Set();
  let enviosRecentesIndicacao = {}; // { campanhaId: { clienteId: {mensagem, link} } }
  let enviadasPorCampanhaIndicacao = {}; // cache local: { campanhaId: [ {clienteIndicadorId, mensagem, linkWhatsapp, ...} ] }, vindo de GET /indicacoes/campanhas/:id/enviadas

  function renderIndicacoesConsultar(main){
    setHeader("Consultar Indicação", "Cada campanha de indicação gera um link pessoal por cliente — ele encaminha esse link aos amigos, que confirmam a indicação e viram clientes.",
      '<button class="btn header-btn btn-sm" id="btn-ir-criar-indicacao">' + ICONS.plus + ' Criar indicação</button>');
    const lista = Object.values(state.campanhasIndicacao);
    main.innerHTML =
      '<div class="section">' +
        '<div class="section-head"><div class="section-title">Campanhas de indicação cadastradas</div></div>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fill, minmax(280px,1fr));">' +
          (lista.length ? lista.map(campanhaIndicacaoCardHtml).join("") : '<div class="card empty">Nenhuma campanha de indicação cadastrada ainda.</div>') +
        '</div>' +
      '</div>';

    document.getElementById("btn-ir-criar-indicacao").addEventListener("click", ()=>ir("indicacoes-criar"));
    main.querySelectorAll("[data-toggle-indicacao]").forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-toggle-indicacao");
        if (indicacaoCampanhasExpandidas.has(id)){
          indicacaoCampanhasExpandidas.delete(id);
        } else {
          indicacaoCampanhasExpandidas.add(id);
          if (!enviadasPorCampanhaIndicacao[id]){
            try { enviadasPorCampanhaIndicacao[id] = await api("/indicacoes/campanhas/"+id+"/enviadas"); }
            catch(err){ if (err.status!==401){ toast(mensagemErro(err), "erro"); enviadasPorCampanhaIndicacao[id] = []; } }
          }
        }
        renderIndicacoesConsultar(main);
      });
    });
    ligarAcoesEnviosIndicacao(main);
  }

  function campanhaIndicacaoCardHtml(c){
    const expandido = indicacaoCampanhasExpandidas.has(c.id);
    return '<div class="campaign-card"' + (expandido ? ' style="grid-column:1/-1;"' : '') + '>' +
      '<div class="campaign-flow">' + esc(c.titulo) + '</div>' +
      '<div class="muted" style="font-size:12.5px;">Prêmio: ' + esc(c.premioIndicador) + '</div>' +
      '<div class="campaign-meta">' +
        '<span class="pill-value">Meta: ' + c.metaIndicacoes + '</span>' +
        (c.premioIndicado ? '<span>Boas-vindas: ' + esc(c.premioIndicado) + '</span>' : '') +
        '<span>Validade: ' + c.validadeDias + ' dias</span>' +
      '</div>' +
      '<div class="btn-row"><button class="btn btn-sm" data-toggle-indicacao="'+c.id+'">' + (expandido ? 'Ocultar clientes' : 'Ver clientes') + '</button></div>' +
      (expandido ? painelClientesIndicacao(c) : '') +
    '</div>';
  }

  function painelClientesIndicacao(campanha){
    const clientes = Object.values(state.clientes).sort((a,b)=>a.nome.localeCompare(b.nome));
    const jaEnviadas = enviadasPorCampanhaIndicacao[campanha.id] || [];
    const enviadasPorCliente = {};
    jaEnviadas.forEach(i => { enviadasPorCliente[i.clienteIndicadorId] = i; });
    const recentes = enviosRecentesIndicacao[campanha.id] || {};

    if (!clientes.length){
      return '<div class="empty" style="padding:16px 6px;">Nenhum cliente cadastrado ainda.</div>';
    }
    const rows = clientes.map((cli) => {
      const jaEnviada = enviadasPorCliente[cli.id];
      const recente = recentes[cli.id];
      if (jaEnviada || recente){
        const mensagem = recente ? recente.mensagem : jaEnviada.mensagem;
        const link = recente ? recente.link : jaEnviada.linkWhatsapp;
        return '<tr><td colspan="3">' +
          '<div class="faint" style="margin-bottom:2px;"><strong>' + esc(cli.nome) + '</strong></div>' +
          '<div class="msg-preview" style="margin:4px 0;">' + esc(mensagem) + '</div>' +
          '<div class="btn-row">' +
            '<a class="btn btn-primary btn-sm" href="'+esc(link)+'" target="_blank" rel="noopener">' + ICONS.whatsapp + ' Abrir WhatsApp</a>' +
            '<button class="btn btn-sm" data-copy="'+esc(link)+'">' + ICONS.copy + ' Copiar link</button>' +
          '</div>' +
        '</td></tr>';
      }
      return '<tr>' +
        '<td><strong>'+esc(cli.nome)+'</strong></td>' +
        '<td class="faint mono">'+esc(cli.telefone)+'</td>' +
        '<td><button class="btn btn-primary btn-sm" data-enviar-indicacao="'+campanha.id+'" data-cliente-indicacao="'+cli.id+'">' + ICONS.whatsapp + ' Enviar convite</button></td>' +
      '</tr>';
    }).join("");
    return '<div class="table-wrap" style="margin-top:6px;"><table><thead><tr><th>Cliente</th><th>WhatsApp</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  function ligarAcoesEnviosIndicacao(main){
    main.querySelectorAll("[data-enviar-indicacao]").forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const campanhaId = btn.getAttribute("data-enviar-indicacao");
        const clienteId = btn.getAttribute("data-cliente-indicacao");
        btn.disabled = true;
        try {
          const { mensagem, link } = await api("/indicacoes/campanhas/"+campanhaId+"/enviar", { method:"POST", body:{ clienteId } });
          enviosRecentesIndicacao[campanhaId] = enviosRecentesIndicacao[campanhaId] || {};
          enviosRecentesIndicacao[campanhaId][clienteId] = { mensagem, link };
          renderIndicacoesConsultar(document.getElementById("main"));
          toast("Convite de indicação enviado para " + (state.clientes[clienteId]||{}).nome + ".");
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
  let resgateIndicacaoEmEdicao = new Set();
  let resgatesIndicacaoCache = []; // cache local: vem de GET /indicacoes/resgataveis, refeito ao entrar na tela e após cada confirmação

  async function renderIndicacoesResgate(main){
    setHeader("Resgate Indicações", "Indicadores que já bateram a meta de amigos indicados e ainda não resgataram o prêmio.");
    main.innerHTML = '<div class="card empty">Carregando…</div>';
    try { resgatesIndicacaoCache = await api("/indicacoes/resgataveis"); }
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
      '<div class="card table-wrap" id="tabela-resgate-indicacao">' + (lista.length ? tabelaResgatesIndicacao(lista) : '<div class="empty">Nenhum indicador pronto para resgatar prêmio no momento.</div>') + '</div>';

    ligarAcoesResgateIndicacao(main);
  }
  function tabelaResgatesIndicacao(lista){
    const rows = lista.map(r => {
      let acao;
      if (resgateIndicacaoEmEdicao.has(r.indicacaoId)){
        acao = '<div style="display:flex; flex-wrap:nowrap; gap:6px; align-items:center;">' +
          '<input type="number" min="0" step="0.01" placeholder="Valor da venda" data-valor-resgate-input="'+r.indicacaoId+'" style="width:110px; flex:none; padding:6px 8px; background:var(--surface-2); border:1px solid var(--border); border-radius:8px; color:var(--text);">' +
          '<button class="btn btn-primary btn-sm" style="flex:none;" data-confirmar-resgate="'+r.indicacaoId+'">Confirmar</button>' +
          '<button class="btn btn-ghost btn-sm" style="flex:none;" data-cancelar-resgate="'+r.indicacaoId+'">Cancelar</button>' +
        '</div>';
      } else {
        acao = '<button class="btn btn-primary btn-sm" data-toggle-resgate="'+r.indicacaoId+'">Resgatar prêmio</button>';
      }
      return '<tr>' +
        '<td><strong>'+esc(r.indicadorNome)+'</strong></td>' +
        '<td class="faint mono">'+esc(r.indicadorTelefone)+'</td>' +
        '<td class="muted">'+esc(r.campanhaTitulo)+'</td>' +
        '<td class="muted">'+esc(r.premioIndicador)+'</td>' +
        '<td><span class="pill-value">'+r.totalConfirmados+' / '+r.metaIndicacoes+'</span></td>' +
        '<td>'+acao+'</td>' +
      '</tr>';
    }).join("");
    return '<table><thead><tr><th>Indicador</th><th>WhatsApp</th><th>Campanha</th><th>Prêmio</th><th>Indicados</th><th>Ação</th></tr></thead><tbody>'+rows+'</tbody></table>';
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
          const { mensagem, link } = await api("/campanhas/"+campId+"/enviar", { method:"POST", body:{ clienteId, compraId } });
          novaCompraResultado.enviados[campId] = { mensagem, link };
          await carregarTudo();
          renderResultadoElegibilidade();
          toast("Giftback gerado e marcado como enviado.");
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
      '<div class="btn-row"><button class="btn btn-primary btn-sm" data-enviar="'+c.id+'">' + ICONS.whatsapp + ' Gerar link e marcar como enviado</button></div>' +
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
        '<button type="button" class="btn btn-primary" id="modal-btn-confirmar-envio">' + ICONS.whatsapp + ' Enviar e abrir WhatsApp</button>' +
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
      const abaWhatsapp = window.open("", "_blank");
      let link;
      try {
        ({ link } = await api("/campanhas/"+alvo.campanhaId+"/enviar", { method:"POST", body:{ clienteId: alvo.clienteId, compraId: alvo.compraId } }));
        giftbackElegiveisCache = await api("/giftback/elegiveis");
        await carregarTudo();
      } catch(err){
        if (abaWhatsapp) abaWhatsapp.close();
        btnConfirmar.disabled = false;
        if (err.status!==401) toast(mensagemErro(err, "Não foi possível enviar o giftback."), 'erro');
        return;
      }
      fecharModal();
      toast("Giftback enviado para " + cliente.nome + ".");
      if (abaWhatsapp) abaWhatsapp.location.href = link;
      else window.open(link, "_blank", "noopener");
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

  function botaoRetornoWhatsapp(linkRetorno){
    if (!linkRetorno){
      return '<p class="faint" style="margin-top:14px;">O WhatsApp do estabelecimento ainda não foi configurado (Configurações → Dados da empresa) — este passo fica desabilitado até lá.</p>';
    }
    return '<a class="btn btn-primary" href="'+esc(linkRetorno)+'" target="_blank" rel="noopener" style="width:100%; justify-content:center; padding:12px; margin-top:14px; text-decoration:none;">' +
      ICONS.whatsapp + ' Agendar</a>';
  }

  // ---------------------------------------------------------------------
  // Página pública de indicação — o mesmo link serve tanto para o indicador
  // (que vê o prêmio e encaminha a amigos) quanto para o amigo indicado (que
  // confirma nome + WhatsApp para virar cliente).
  // ---------------------------------------------------------------------
  async function renderIndicacaoPublica(tok){
    const main = document.getElementById("main");
    main.style.padding = "0";
    main.innerHTML = '<div class="redeem-wrap"><div class="redeem-card">Carregando…</div></div>';

    let ctx;
    try { ctx = await apiPublica("/public/indicacao/"+tok); }
    catch(err){
      main.innerHTML = telaIndicacao({ erro: mensagemErro(err, "Não foi possível abrir esta indicação.") });
      return;
    }
    main.innerHTML = telaIndicacao(ctx);
    if (!ctx.erro) ligarFormularioIndicacao(tok, ctx);
  }

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
          empresa: ctx.empresa, campanha: ctx.campanha, clienteIndicador: ctx.clienteIndicador, linkEncaminhar: ctx.linkEncaminhar,
          confirmadoAgora: { nome: resp.nome, premioIndicado: resp.premioIndicado, ativadoEm: new Date().toISOString() },
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
      ? '<a class="btn btn-primary" href="'+esc(ctx.linkEncaminhar)+'" target="_blank" rel="noopener" style="width:100%; justify-content:center; padding:12px; margin-top:14px; text-decoration:none;">' +
          ICONS.whatsapp + ' Encaminhar para um amigo</a>'
      : '';

    let corpo;
    if (ctx.confirmadoAgora){
      const r = ctx.confirmadoAgora;
      const alvoIndicacao = r.ativadoEm && c.validadeDias ? addDias(r.ativadoEm, c.validadeDias) : null;
      corpo =
        '<div class="redeem-badge">' + ICONS.check + '</div>' +
        '<div class="redeem-title">Indicação confirmada ✓</div>' +
        '<p class="muted" style="font-size:13.5px;">Valeu, ' + esc(primeiroNome(r.nome)) + '! Sua indicação por ' + nomeIndicador + ' foi registrada.</p>' +
        (r.premioIndicado ? '<div class="redeem-rules"><strong style="display:block; margin-bottom:4px; color:var(--text);">Seu presente de boas-vindas</strong>' + esc(r.premioIndicado) + '</div>' : '') +
        (alvoIndicacao ? cronometroHtml(alvoIndicacao, "Tempo restante para resgatar seu presente") : '') +
        '<p class="faint" style="margin-top:10px;">Em breve o estabelecimento entra em contato para combinar os detalhes.</p>' +
        botaoEncaminhar;
    } else {
      corpo =
        '<div class="redeem-badge">' + ICONS.gift + '</div>' +
        '<div class="faint" style="text-transform:uppercase; letter-spacing:.05em; font-weight:700; font-size:11px;">Indicação de ' + nomeIndicador + '</div>' +
        '<div class="redeem-title" style="margin-top:6px;">' + esc(c.titulo) + '</div>' +
        '<div class="redeem-rules">' +
          (c.premioIndicado ? '<strong style="display:block; margin-bottom:4px; color:var(--text);">Se você confirmar a indicação de ' + nomeIndicador + ', ganha:</strong>' + esc(c.premioIndicado) + '<br><br>' : '') +
          '<strong style="display:block; margin-bottom:4px; color:var(--text);">Prêmio de ' + nomeIndicador + ':</strong>' + esc(c.premioIndicador) + ' a cada ' + c.metaIndicacoes + ' amigo(s) indicado(s)' +
          (c.condicoes ? '<br><br><strong style="color:var(--text);">Condições:</strong> ' + esc(c.condicoes) : '') +
        '</div>' +
        '<form id="form-confirmar-indicacao" class="form-grid" style="grid-template-columns:1fr; margin-top:14px;">' +
          '<div class="field"><label>Seu nome completo</label><input type="text" name="nome" required placeholder="Seu nome completo"></div>' +
          '<div class="field"><label>Seu WhatsApp</label><input type="tel" name="telefone" required placeholder="+55 11 90000-0000"></div>' +
          '<div id="erro-indicacao" class="auth-error" style="display:none; color:var(--danger); font-size:12.5px;"></div>' +
          '<button class="btn btn-primary" id="btn-confirmar-indicacao" type="submit" style="justify-content:center; padding:12px;">Emitir voucher</button>' +
        '</form>' +
        '<p class="faint" style="margin-top:10px; font-size:12px;">Foi você quem recebeu este link de ' + nomeIndicador + '? Preencha acima para confirmar. Se este link é seu e quer chamar mais amigos, use o botão abaixo.</p>' +
        botaoEncaminhar;
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
