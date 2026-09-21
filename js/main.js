gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
gsap.defaults({ ease: "power3.out", duration: 0.9 });

function cursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const el = document.querySelector(".cursor");
  const xTo = gsap.quickTo(el, "x", { duration: 0.22, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.22, ease: "power3" });
  window.addEventListener("mousemove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.querySelectorAll("a, button, input, select, textarea").forEach((node) => {
    node.addEventListener("mouseenter", () => el.classList.add("is-hover"));
    node.addEventListener("mouseleave", () => el.classList.remove("is-hover"));
  });
}

function intro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero-title .line span", { yPercent: 110, duration: 1.05, stagger: 0.08 })
    .from(".hero .reveal", { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, "-=0.55")
    .from(".nav-pill", { y: -28, autoAlpha: 0, duration: 0.7 }, 0);

  document.querySelectorAll("[data-count]").forEach((el) => {
    gsap.fromTo(
      el,
      { textContent: 0 },
      {
        textContent: Number(el.dataset.count),
        duration: 1.4,
        delay: 0.7,
        snap: { textContent: 1 },
        ease: "power2.out",
      }
    );
  });
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
  gsap.utils.toArray(".about, .services, .method, .work, .contact").forEach((section) => {
    gsap.from(section.querySelectorAll("h2, p, li, .work-card, .service-item, .media-frame, form"), {
      y: 28,
      autoAlpha: 0,
      stagger: 0.06,
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

function services() {
  const items = [...document.querySelectorAll(".service-item")];
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

function form() {
  const formEl = document.querySelector("[data-form]");
  const ok = document.querySelector("[data-form-ok]");
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    ok.hidden = false;
    formEl.reset();
  });
}

function start() {
  cursor();
  nav();
  form();
  services();
  preloader();
  spine();
  reveals();
  ScrollTrigger.refresh();
}

if (document.readyState === "complete") start();
else window.addEventListener("load", start);
