gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
gsap.defaults({ ease: "power3.out", duration: 0.9 });

function intro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const pill = document.querySelector("[data-nav-pill]");
  const left = document.querySelector("[data-nav-left]");
  const right = document.querySelector("[data-nav-right]");
  const logo = document.querySelector(".nav-logo");
  const tips = document.querySelectorAll(".nav-tip");
  const leftLinks = [...left.querySelectorAll(".nav-link")];
  const rightLinks = [...right.querySelectorAll(".nav-link")];
  const desktop = window.matchMedia("(min-width: 981px)").matches;

  gsap.set(logo, { scale: 0.72, autoAlpha: 0 });
  gsap.set(tips, { scaleX: 0 });

  if (desktop && !reduceMotion) {
    left.style.cssText = "width:auto;opacity:1;visibility:hidden;overflow:hidden";
    right.style.cssText = "width:auto;opacity:1;visibility:hidden;overflow:hidden";
    pill.classList.add("is-ready");
    const leftW = left.scrollWidth;
    const rightW = right.scrollWidth;
    gsap.set(left, { width: 0, visibility: "visible", overflow: "hidden", opacity: 1 });
    gsap.set(right, { width: 0, visibility: "visible", overflow: "hidden", opacity: 1 });
    gsap.set(leftLinks, { x: 28, autoAlpha: 0 });
    gsap.set(rightLinks, { x: -28, autoAlpha: 0 });

    tl.to(logo, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.5)" })
      .to(tips, { scaleX: 1, duration: 0.45, ease: "power2.out" }, "+=0.06")
      .add(() => pill.classList.add("is-open"))
      .to(left, { width: leftW, duration: 0.8, ease: "power3.inOut" }, "+=0.02")
      .to(right, { width: rightW, duration: 0.8, ease: "power3.inOut" }, "<")
      .to(leftLinks, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07 }, "<0.14")
      .to(rightLinks, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07 }, "<")
      .add(() => {
        gsap.set([left, right], { width: "auto", overflow: "visible" });
      });
  } else {
    pill.classList.add("is-ready", "is-open");
    gsap.set(tips, { scaleX: 1 });
    gsap.set([left, right], { clearProps: "width", opacity: 1, visibility: "visible" });
    tl.to(logo, { scale: 1, autoAlpha: 1, duration: reduceMotion ? 0 : 0.5 });
    if (!desktop && !reduceMotion) {
      tl.from(".nav-toggle", { autoAlpha: 0, duration: 0.35 }, "-=0.15");
    }
  }

  tl.from(".hero-title .line span", { y: 36, autoAlpha: 0, duration: 1.05 }, 0.2)
    .from(".hero .reveal", { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, "-=0.55");
}

function preloader() {
  const root = document.querySelector("[data-preloader]");
  const fill = document.querySelector("[data-loader-fill]");
  document.body.style.overflow = "hidden";

  if (reduceMotion) {
    gsap.set(root, { autoAlpha: 0 });
    document.body.style.overflow = "";
    intro();
    return;
  }

  const tl = gsap.timeline();
  tl.from(".preloader-word", { y: 24, autoAlpha: 0, duration: 0.7 })
    .to(fill, { width: "100%", duration: 0.8, ease: "power2.inOut" }, "<0.15")
    .to(root, {
      yPercent: -100,
      duration: 0.85,
      ease: "power3.inOut",
      onComplete: () => {
        root.remove();
        document.body.style.overflow = "";
      },
    })
    .add(intro, "-=0.4");
}

function spine() {
  const fill = document.querySelector("[data-spine]");
  if (!fill) return;
  gsap.to(fill, {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
    },
  });
}

function reveals() {
  gsap.utils.toArray(".about, .services, .autos, .method, .work, .contact").forEach((section) => {
    gsap.from(section.querySelectorAll("h2, .section-head p, .cases-head h3, .work-card, .service-card, .about-cards article, .anat-step, .case-card, .media-frame, form, .process-node"), {
      y: 28,
      autoAlpha: 0,
      stagger: 0.05,
      duration: 0.75,
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
    });
  });

  gsap.from(".footer-word", {
    y: 50,
    autoAlpha: 0,
    duration: 1,
    scrollTrigger: { trigger: ".footer", start: "top 88%", once: true },
  });
}

function process() {
  const root = document.querySelector("[data-process]");
  if (!root) return;

  const steps = [...root.querySelectorAll("[data-step]")];
  const fill = root.querySelector("[data-process-fill]");
  const kicker = root.querySelector("[data-process-kicker]");
  const title = root.querySelector("[data-process-title]");
  const text = root.querySelector("[data-process-text]");
  const out = root.querySelector("[data-process-out]");
  const panel = root.querySelector("[data-process-panel]");

  const data = [
    {
      kicker: "Etapa 01 — 5 a 8 dias",
      title: "Diagnóstico comercial",
      text: "Onde o funil trava, o que a marca promete, o que o time aguenta. Sem isso, qualquer página ou disparo vira ruído.",
      out: ["Mapa do funil atual", "Gargalos e perdas", "Prioridade de operação"],
    },
    {
      kicker: "Etapa 02 — 4 a 7 dias",
      title: "Arquitetura da malha",
      text: "Mapa de páginas, CRM, disparos e identidade — desenhados juntos, antes da execução. O cliente vê o sistema, não um briefing solto.",
      out: ["Fluxo ponta a ponta", "Stack e integrações", "Ordem de construção"],
    },
    {
      kicker: "Etapa 03 — 5 a 10 dias",
      title: "Mensagem e oferta",
      text: "Copy, scripts e proposta em uma voz só: página, WhatsApp e comercial falam a mesma coisa.",
      out: ["Narrativa da oferta", "Scripts de conversa", "Hierarquia de CTAs"],
    },
    {
      kicker: "Etapa 04 — 7 a 12 dias",
      title: "Identidade aplicada",
      text: "Marca verbal e visual para ser reconhecida no funil inteiro — não só no logo.",
      out: ["Sistema visual", "Tom de voz", "Peças-base da operação"],
    },
    {
      kicker: "Etapa 05 — 8 a 14 dias",
      title: "Páginas de captura",
      text: "Landing e rotas de campanha com performance, prova e formulário ligado ao CRM.",
      out: ["LP no ar", "Eventos de conversão", "Formulário no pipeline"],
    },
    {
      kicker: "Etapa 06 — 7 a 12 dias",
      title: "Sistema e automações",
      text: "CRM, tarefas e integrações. O lead entra e o time recebe o próximo passo, sem planilha.",
      out: ["Pipeline vivo", "Automações-chave", "Handoff do comercial"],
    },
    {
      kicker: "Etapa 07 — 4 a 8 dias",
      title: "Disparo e cadência",
      text: "WhatsApp, e-mail e SMS com template, fila e horário. Escala sem perder o tom da marca.",
      out: ["Cadência pronta", "Templates aprovados", "Filas por etapa"],
    },
    {
      kicker: "Etapa 08 — contínuo",
      title: "Go-live e ajuste",
      text: "Tracking, leitura de dado e novo ciclo. A malha não termina no lançamento — ela opera.",
      out: ["Dashboard simples", "Rituais de ajuste", "Próximo disparo / página"],
    },
  ];

  let current = 0;
  let timer;
  let booted = false;

  const show = (index) => {
    current = index;
    const item = data[index];
    steps.forEach((step, i) => {
      const on = i === index;
      step.classList.toggle("is-on", on);
      step.setAttribute("aria-selected", String(on));
    });
    if (fill) fill.style.width = `${((index + 1) / steps.length) * 100}%`;

    const swap = () => {
      kicker.textContent = item.kicker;
      title.textContent = item.title;
      text.textContent = item.text;
      out.replaceChildren(
        ...item.out.map((line) => {
          const li = document.createElement("li");
          li.textContent = line;
          return li;
        })
      );
    };

    if (!booted || reduceMotion) {
      swap();
      booted = true;
      return;
    }

    gsap.to(panel, {
      autoAlpha: 0,
      y: 10,
      duration: 0.18,
      onComplete: () => {
        swap();
        gsap.fromTo(panel, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35 });
      },
    });
  };

  const play = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show((current + 1) % data.length), 4200);
  };

  steps.forEach((step) => {
    const index = Number(step.dataset.step);
    step.addEventListener("mouseenter", () => {
      window.clearInterval(timer);
      show(index);
    });
    step.addEventListener("focus", () => {
      window.clearInterval(timer);
      show(index);
    });
    step.addEventListener("click", () => {
      window.clearInterval(timer);
      show(index);
    });
  });

  root.addEventListener("mouseleave", play);

  ScrollTrigger.create({
    trigger: root,
    start: "top 75%",
    onEnter: play,
    onEnterBack: play,
    onLeave: () => window.clearInterval(timer),
    onLeaveBack: () => window.clearInterval(timer),
  });

  show(0);
}

function spy() {
  const links = [...document.querySelectorAll(".nav-link[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const set = () => {
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section;
    });
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`);
    });
  };

  window.addEventListener("scroll", set, { passive: true });
  set();
}

function services() {
  const items = [...document.querySelectorAll(".service-item")];
  if (!items.length) return;
  const videos = [...document.querySelectorAll(".stage-videos video")];
  const messages = document.querySelector("[data-messages]");

  const show = (index) => {
    items.forEach((item, i) => {
      const on = i === index;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-selected", String(on));
    });
    videos.forEach((video, i) => {
      const on = i === index;
      video.classList.toggle("is-on", on);
      if (on) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    messages.classList.toggle("is-on", index === 5);
  };

  items.forEach((item) => {
    const index = Number(item.dataset.service);
    item.addEventListener("mouseenter", () => show(index));
    item.addEventListener("focus", () => show(index));
    item.addEventListener("click", () => show(index));
  });

  show(0);
}

function nav() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      menu.classList.remove("open");
      gsap.to(window, {
        duration: 0.95,
        scrollTo: { y: target, offsetY: 16 },
        ease: "power3.inOut",
      });
    });
  });

  toggle.addEventListener("click", () => menu.classList.toggle("open"));
}

const WHATSAPP = "5511952025568";

function form() {
  const formEl = document.querySelector("[data-form]");
  const ok = document.querySelector("[data-form-ok]");
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    saveLead(readForm(formEl, "contato"));
    ok.hidden = false;
    formEl.reset();
  });
}

function readForm(formEl, origem) {
  const data = Object.fromEntries(new FormData(formEl).entries());
  return { ...data, origem };
}

async function saveLead(lead) {
  const api = await window.LeadsReady;
  try {
    await api.save(lead);
  } catch (error) {
    console.error("Não foi possível salvar o lead.", error);
  }
}

function modals() {
  const open = (name) => {
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const box = modal.querySelector(".modal-box");
    if (!reduceMotion) {
      gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
      gsap.fromTo(box, { y: 22, scale: 0.98 }, { y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    }
    modal.querySelector("input, select, textarea")?.focus();
  };

  const close = (modal) => {
    if (!modal) return;
    const done = () => {
      modal.hidden = true;
      document.body.style.overflow = "";
    };
    if (reduceMotion) return done();
    gsap.to(modal, { autoAlpha: 0, duration: 0.2, onComplete: done });
  };

  document.querySelectorAll("[data-open-diag]").forEach((btn) => {
    btn.addEventListener("click", () => open("diag"));
  });
  document.querySelectorAll("[data-open-lead]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ctx = btn.dataset.ctx || "Site";
      const field = document.querySelector("[data-lead-secao]");
      const note = document.querySelector("[data-lead-ctx]");
      if (field) field.value = ctx;
      if (note) {
        note.textContent = `Interesse: ${ctx}. Deixe seu nome e WhatsApp que a gente chama você e mostra como fica na sua operação.`;
      }
      open("lead");
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => close(btn.closest(".modal")));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal:not([hidden])").forEach(close);
  });

  return { open, close };
}

function quickLead(modal) {
  const formEl = document.querySelector("[data-lead-form]");
  if (!formEl) return;
  const ok = document.querySelector("[data-lead-ok]");
  const waBtn = document.querySelector("[data-lead-wa]");

  const submit = (toWhatsapp) => {
    if (!formEl.reportValidity()) return;
    const lead = readForm(formEl, "implantacao");
    saveLead(lead);
    ok.hidden = false;

    if (toWhatsapp) {
      const text = [
        "Quero implementar na minha empresa",
        `Nome: ${lead.nome || "-"}`,
        `WhatsApp: ${lead.telefone || "-"}`,
        `Interesse: ${lead.secao || "-"}`,
      ].join("\n");
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }

    formEl.reset();
    window.setTimeout(() => {
      ok.hidden = true;
      modal.close(formEl.closest(".modal"));
    }, 2000);
  };

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(false);
  });
  waBtn?.addEventListener("click", () => submit(true));
}

function diagnostic(modal) {
  const formEl = document.querySelector("[data-diag-form]");
  if (!formEl) return;
  const ok = document.querySelector("[data-diag-ok]");
  const waBtn = document.querySelector("[data-diag-wa]");

  const submit = (toWhatsapp) => {
    if (!formEl.reportValidity()) return;
    const lead = readForm(formEl, "diagnostico");
    saveLead(lead);
    ok.hidden = false;

    if (toWhatsapp) {
      const text = [
        "Solicitação de diagnóstico",
        `Nome: ${lead.nome || "-"}`,
        `Empresa: ${lead.empresa || "-"}`,
        `WhatsApp: ${lead.telefone || "-"}`,
        `E-mail: ${lead.email || "-"}`,
        `Frente: ${lead.frente || "-"}`,
        `Faturamento: ${lead.faturamento || "-"}`,
        `Contexto: ${lead.contexto || "-"}`,
      ].join("\n");
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }

    formEl.reset();
    window.setTimeout(() => {
      ok.hidden = true;
      modal.close(formEl.closest(".modal"));
    }, 2200);
  };

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(false);
  });
  waBtn?.addEventListener("click", () => submit(true));
}

function autoflow() {
  const root = document.querySelector("[data-autoflow]");
  if (!root) return;
  const steps = [...root.querySelectorAll("[data-flow-steps] li")];
  let timer;
  let index = 0;

  const tick = () => {
    steps.forEach((step, i) => step.classList.toggle("is-on", i <= index));
    index = index + 1 > steps.length ? 0 : index + 1;
  };

  const play = () => {
    window.clearInterval(timer);
    index = 0;
    tick();
    timer = window.setInterval(tick, 1100);
  };

  if (reduceMotion) {
    steps.forEach((step) => step.classList.add("is-on"));
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: "top 75%",
    onEnter: play,
    onEnterBack: play,
    onLeave: () => window.clearInterval(timer),
    onLeaveBack: () => window.clearInterval(timer),
  });
}

function board() {
  const root = document.querySelector("[data-board]");
  if (!root) return;

  const nodes = [...root.querySelectorAll("[data-node]")];
  const wires = [...root.querySelectorAll("[data-wire]")];
  const feed = root.querySelector("[data-feed]");

  const clients = [
    ["Marina A.", "Orçamento"],
    ["Rodrigo P.", "Agendado"],
    ["Bianca L.", "Respondido"],
    ["Diego M.", "Venda"],
    ["Tatiane R.", "Follow-up"],
  ];

  const addRow = (i) => {
    const [name, status] = clients[i % clients.length];
    const li = document.createElement("li");
    li.className = "feed-row";
    const quem = document.createElement("span");
    quem.textContent = name;
    const etapa = document.createElement("span");
    etapa.textContent = status;
    li.append(quem, etapa);
    feed.appendChild(li);
    while (feed.children.length > 5) feed.children[1].remove();
    if (!reduceMotion) gsap.from(li, { autoAlpha: 0, x: 12, duration: 0.4 });
  };

  if (reduceMotion) {
    nodes.forEach((node) => node.classList.add("is-on"));
    wires.forEach((wire) => wire.classList.add("is-live"));
    clients.forEach((_, i) => addRow(i));
    return;
  }

  let count = 0;
  let timer;

  const boot = () => {
    const seq = [
      () => nodes[0].classList.add("is-on"),
      () => nodes[1].classList.add("is-on"),
      () => {
        root.querySelector(".wire-h1").classList.add("is-live");
        root.querySelector(".wire-v").classList.add("is-live");
      },
      () => nodes[2].classList.add("is-on"),
      () => root.querySelector(".wire-h2").classList.add("is-live"),
      () => nodes[3].classList.add("is-on"),
      () => {
        timer = window.setInterval(() => {
          addRow(count);
          count += 1;
        }, 1600);
        addRow(count);
        count += 1;
      },
    ];
    seq.forEach((step, i) => window.setTimeout(step, i * 480));
  };

  ScrollTrigger.create({
    trigger: root,
    start: "top 72%",
    once: true,
    onEnter: boot,
  });

  ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onLeave: () => window.clearInterval(timer),
    onLeaveBack: () => window.clearInterval(timer),
  });
}

function flow() {
  const root = document.querySelector("[data-flow]");
  if (!root) return;

  const grid = root.querySelector(".flow-grid");
  const parts = [...grid.children];
  const stats = [...root.querySelectorAll("[data-stat]")];

  const countUp = () => {
    stats.forEach((el) => {
      if (reduceMotion) {
        el.textContent = el.dataset.stat;
        return;
      }
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: Number(el.dataset.stat),
          duration: 1.2,
          snap: { textContent: 1 },
          ease: "power2.out",
        }
      );
    });
  };

  const light = (part) => {
    part.classList.add(part.classList.contains("wire") ? "is-live" : "is-on");
    if (part.classList.contains("f5")) countUp();
  };

  if (reduceMotion) {
    parts.forEach(light);
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: "top 72%",
    once: true,
    onEnter: () => parts.forEach((part, i) => window.setTimeout(() => light(part), i * 380)),
  });
}

function start() {
  nav();
  form();
  const modal = modals();
  diagnostic(modal);
  quickLead(modal);
  autoflow();
  board();
  flow();
  services();
  process();
  spy();
  preloader();
  spine();
  reveals();
  ScrollTrigger.refresh();
}

if (document.readyState === "complete") start();
else window.addEventListener("load", start);
