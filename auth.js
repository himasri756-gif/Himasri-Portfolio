// ─── Auth + Interactive Portfolio ─────────────────────────
(() => {
  "use strict";

  const cfg  = window.PORTFOLIO_AUTH_CONFIG;
  const supa = window.supabase;
  const $    = id => document.getElementById(id);

  const gate      = $("login-gate");
  const portfolio = $("portfolio");
  const msg       = $("auth-message");

  let client = null;

  /* ── Helpers ──────────────────────────────────────── */

  function info(text, type) {
    msg.textContent = text || "";
    msg.className   = "login-msg" + (type ? " " + type : "");
  }

  function showPortfolio() {
    gate.classList.add("out");
    setTimeout(() => {
      gate.hidden      = true;
      portfolio.hidden = false;
      initPortfolioInteractions();
    }, 700);
  }

  function showLogin() {
    gate.hidden = false;
    gate.classList.remove("out");
    portfolio.hidden = true;
  }

  function localUrl(p) { return new URL(p, location.href).href; }
  function report(e) { info(e?.message || "Something went wrong.", "error"); }

  /* ── Particle canvas (login background) ──────────── */

  (function initParticles() {
    const canvas = $("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];

    function resize() {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2,
        dx: (Math.random() - .5) * .4,
        dy: (Math.random() - .5) * .4,
        o: .15 + Math.random() * .35
      });
    }

    function draw() {
      if (gate.hidden) return;
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.o})`;
        ctx.fill();
      });

      // Lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${.08 * (1 - dist / 120)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ── Password toggle ─────────────────────────────── */

  $("toggle-pw").addEventListener("click", () => {
    const inp  = $("auth-password");
    const icon = $("toggle-pw").querySelector("i");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    icon.className = show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
  });

  /* ── Supabase guard ──────────────────────────────── */

  if (!supa?.createClient || !cfg?.supabaseUrl ||
      !cfg?.supabasePublishableKey ||
      cfg.supabaseUrl.includes("YOUR_PROJECT_ID") ||
      cfg.supabasePublishableKey.includes("YOUR_PUBLISHABLE_KEY")) {
    info("Set your Supabase URL and key in auth-config.js first.", "error");
    return;
  }

  client = supa.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);

  /* ── Session check on load ───────────────────────── */

  async function checkSession() {
    try {
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) { showLogin(); return; }
      showPortfolio();
    } catch { showLogin(); }
  }

  /* ── Login ───────────────────────────────────────── */

  $("auth-login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const btn     = $("login-submit");
    const content = btn.querySelector(".btn-content");
    const loader  = btn.querySelector(".btn-loader");

    info(""); content.hidden = true; loader.hidden = false; btn.disabled = true;

    const email    = $("auth-email").value.trim();
    const password = $("auth-password").value;
    const { error } = await client.auth.signInWithPassword({ email, password });

    content.hidden = false; loader.hidden = true; btn.disabled = false;

    if (error) return report(error);
    info("Welcome! Loading portfolio…", "success");
    setTimeout(showPortfolio, 600);
  });

  /* ── Register ────────────────────────────────────── */

  $("auth-register").addEventListener("click", async () => {
    const email    = $("auth-email").value.trim();
    const password = $("auth-password").value;
    if (!email || password.length < 8) {
      return info("Enter email + password (≥8 chars).", "error");
    }
    info("Creating account…");
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { emailRedirectTo: localUrl("index.html") }
    });
    if (error) return report(error);
    if (data.session) {
      info("Account created!", "success");
      setTimeout(showPortfolio, 600);
    } else {
      info("Confirmation email sent — check your inbox.", "success");
    }
  });

  /* ── Google OAuth ────────────────────────────────── */

  $("auth-google").addEventListener("click", async () => {
    info("Redirecting to Google…");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: localUrl("index.html") }
    });
    if (error) report(error);
  });

  /* ── Logout ──────────────────────────────────────── */

  $("auth-logout-link").addEventListener("click", async e => {
    e.preventDefault();
    await client.auth.signOut();
    showLogin();
  });

  client.auth.onAuthStateChange(event => {
    if (event === "SIGNED_OUT") showLogin();
  });

  /* ── Init ────────────────────────────────────────── */
  checkSession();


  /* ═══════════════════════════════════════════════════
     PORTFOLIO INTERACTIONS
     ═══════════════════════════════════════════════════ */

  function initPortfolioInteractions() {

    // ── Hamburger menu ──────────────────────────────
    const hamburger = $("hamburger");
    const navMenu   = $("nav-menu");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("open");
      });
      navMenu.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          navMenu.classList.remove("open");
        });
      });
    }

    // ── Sticky header shadow ────────────────────────
    const header = $("site-header");
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 60);
    });

    // ── Active nav on scroll ────────────────────────
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
      });
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active");
      });
    });

    // ── Scroll-reveal ───────────────────────────────
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });
    reveals.forEach(el => observer.observe(el));

    // ── Typing tagline ──────────────────────────────
    const taglineEl = $("hero-tagline");
    const phrases = [
      "Web Development Enthusiast 💻",
      "AI & Machine Learning Explorer 🤖",
      "Software Engineering Student 🎓",
      "Problem Solver & Innovator 💡"
    ];
    let phraseIdx = 0, charIdx = 0, deleting = false;

    function typeLoop() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        taglineEl.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(typeLoop, 2000);
          return;
        }
      } else {
        taglineEl.textContent = current.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(typeLoop, deleting ? 35 : 70);
    }
    typeLoop();

    // ── Counter animation ───────────────────────────
    document.querySelectorAll(".stat-num").forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isFloat = target % 1 !== 0;
      const duration = 1600;
      const start = performance.now();

      function animate(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = ease * target;
        el.textContent = isFloat ? value.toFixed(2) : Math.round(value);
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });

    // ── Skill bars & progress bars ──────────────────
    setTimeout(() => {
      document.querySelectorAll(".skill-bar").forEach(bar => {
        bar.style.width = bar.dataset.width + "%";
      });
      document.querySelectorAll(".progress-fill").forEach(fill => {
        fill.style.width = fill.dataset.width + "%";
      });
    }, 400);

    // ── Tilt on skill cards ─────────────────────────
    document.querySelectorAll("[data-tilt]").forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - .5;
        const y = (e.clientY - rect.top)  / rect.height - .5;
        card.style.transform = `translateY(-10px) scale(1.03) perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    // ── Scroll to top ───────────────────────────────
    const scrollBtn = $("scroll-top");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // ── Hero particles (subtle dots) ────────────────
    const heroPC = $("hero-particles");
    if (heroPC) {
      for (let i = 0; i < 20; i++) {
        const dot = document.createElement("div");
        dot.style.cssText = `
          position:absolute;
          width:${2 + Math.random() * 3}px;
          height:${2 + Math.random() * 3}px;
          background:rgba(56,189,248,${.1 + Math.random() * .2});
          border-radius:50%;
          left:${Math.random() * 100}%;
          top:${Math.random() * 100}%;
          animation: heroDot ${5 + Math.random() * 8}s ease-in-out infinite alternate;
        `;
        heroPC.appendChild(dot);
      }
      // Inject keyframe
      const style = document.createElement("style");
      style.textContent = `@keyframes heroDot { 0% { transform: translate(0,0); opacity:.3; } 100% { transform: translate(${Math.random()>0.5?'':'-'}30px, ${Math.random()>0.5?'':'-'}30px); opacity:.6; } }`;
      document.head.appendChild(style);
    }
  }
})();
