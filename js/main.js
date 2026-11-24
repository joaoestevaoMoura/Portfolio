/* =========================================================
   PORTFÓLIO — JOÃO ESTEVÃO · Scripts
   ========================================================= */
(function () {
  "use strict";

  const raiz = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. TEMA CLARO / ESCURO ---------- */
  $("#btnTema").addEventListener("click", () => {
    const novo = raiz.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
    raiz.setAttribute("data-tema", novo);
    try { localStorage.setItem("tema", novo); } catch (e) {}
  });

  /* ---------- 2. MENU MOBILE ---------- */
  const menu = $("#menu");
  const btnMenu = $("#btnMenu");
  const menuLinks = $("#menuLinks");

  function alternarMenu(abrir) {
    menuLinks.classList.toggle("aberto", abrir);
    menu.classList.toggle("menu-aberto", abrir);
    btnMenu.setAttribute("aria-expanded", String(abrir));
    btnMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  }

  btnMenu.addEventListener("click", () => alternarMenu(!menuLinks.classList.contains("aberto")));
  $$("a", menuLinks).forEach((a) => a.addEventListener("click", () => alternarMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") alternarMenu(false); });
  document.addEventListener("click", (e) => {
    if (menuLinks.classList.contains("aberto") && !menu.contains(e.target)) alternarMenu(false);
  });

  /* ---------- 3. EFEITO DE DIGITAÇÃO ---------- */
  // Edite as frases abaixo à vontade
  const frases = [
    "Estudante de Desenvolvimento de Sistemas",
    "Desenvolvedor Front-end em formação",
    "Apaixonado por interfaces web",
  ];
  const alvo = $("#digitando");

  if (alvo && !reduzirMovimento) {
    let f = 0, c = frases[0].length, apagando = true;
    const tick = () => {
      const frase = frases[f];
      c += apagando ? -1 : 1;
      alvo.textContent = frase.slice(0, c);
      let espera = apagando ? 35 : 70;
      if (!apagando && c === frase.length) { apagando = true; espera = 2200; }
      else if (apagando && c === 0) { apagando = false; f = (f + 1) % frases.length; espera = 400; }
      setTimeout(tick, espera);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- 4. ANIMAÇÕES AO ROLAR + BARRAS ---------- */
  function animarNumero(el, alvoNum) {
    if (reduzirMovimento) { el.textContent = alvoNum + "%"; return; }
    const inicio = performance.now(), dur = 1400;
    const passo = (t) => {
      const p = Math.min((t - inicio) / dur, 1);
      el.textContent = Math.round(alvoNum * (1 - Math.pow(1 - p, 3))) + "%";
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const el = entrada.target;
      el.classList.add("visivel");
      $$(".barra-preenchida", el).forEach((b) => (b.style.width = b.dataset.nivel + "%"));
      $$("[data-nivel-num]", el).forEach((n) => animarNumero(n, +n.dataset.nivelNum));
      observador.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  // Pequeno atraso em cascata para itens irmãos
  $$(".revelar").forEach((el) => {
    const irmaos = $$(":scope > .revelar", el.parentElement);
    const i = irmaos.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 0.08, 0.4) + "s";
    observador.observe(el);
  });

  /* ---------- 5. BRILHO QUE SEGUE O MOUSE NOS CARDS ---------- */
  $$(".habilidade").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- 6. FILTRO DE PROJETOS ---------- */
  const filtros = $$(".filtro");
  const projetos = $$(".projeto");
  filtros.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtros.forEach((b) => b.classList.toggle("ativo", b === btn));
      const f = btn.dataset.filtro;
      projetos.forEach((p) => {
        const cats = (p.dataset.categoria || "").split(" ");
        p.classList.toggle("escondido", f !== "todos" && !cats.includes(f));
      });
    });
  });

  /* ---------- 7. MENU: SEÇÃO ATIVA, FUNDO AO ROLAR, VOLTAR AO TOPO ---------- */
  const secoes = $$("main section[id]");
  const linksMenu = $$(".menu-links a");
  const voltarTopo = $("#voltarTopo");

  function aoRolar() {
    const y = window.scrollY;
    menu.classList.toggle("rolado", y > 20);
    voltarTopo.classList.toggle("visivel", y > 600);

    let atual = "";
    secoes.forEach((s) => { if (y >= s.offsetTop - window.innerHeight * 0.35) atual = s.id; });
    linksMenu.forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === "#" + atual));
  }
  let agendado = false;
  window.addEventListener("scroll", () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => { aoRolar(); agendado = false; });
  }, { passive: true });
  aoRolar();

  voltarTopo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduzirMovimento ? "auto" : "smooth" }));

  /* ---------- 8. COPIAR E-MAIL ---------- */
  const aviso = $("#aviso");
  let avisoTimer;
  function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.add("visivel");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("visivel"), 2400);
  }

  const btnCopiar = $("#btnCopiarEmail");
  btnCopiar.addEventListener("click", async () => {
    const email = btnCopiar.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      mostrarAviso("✅ E-mail copiado!");
    } catch (e) {
      window.location.href = "mailto:" + email;
    }
  });

  /* ---------- 9. ANO NO RODAPÉ ---------- */
  $("#ano").textContent = new Date().getFullYear();
})();
