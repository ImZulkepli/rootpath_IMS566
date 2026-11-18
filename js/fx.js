/* ==========================================================
   fx.js - Visual effects shared by every page
   Particle network, cursor glow, count-up numbers, typing effect,
   scroll reveal and toast messages. Respects reduced-motion.
   ========================================================== */

const RT_REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function accentRGB() { return window.RT_ACCENTS[window.RT_ACCENT_KEY]; }
function accentA(alpha) { return "rgba(" + accentRGB() + "," + alpha + ")"; }
function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

/* Sun / moon button: saves the mode (optional localStorage extra) and reloads */
function createModeToggle(extraClass) {
  const light = window.RT_MODE === "light";
  const b = document.createElement("button");
  b.type = "button";
  b.className = "mode-toggle " + (extraClass || "");
  b.title = light ? "Switch to dark mode" : "Switch to light mode";
  b.setAttribute("aria-label", b.title);
  b.innerHTML = light
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  b.addEventListener("click", function () {
    try { localStorage.setItem("rt_mode", light ? "dark" : "light"); } catch (e) {}
    location.reload();
  });
  return b;
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* ---------- Particle network (login background) ---------- */
function startNetwork(canvas) {
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  let w, h, dpr, nodes;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(95, Math.floor((w * h) / 15000));
    nodes = Array.from({ length: count }, function () {
      return { x: Math.random() * w, y: Math.random() * h,
               vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 };
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const link = 130, reach = 170;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!RT_REDUCED) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.fillStyle = accentA(0.8);
      ctx.beginPath(); ctx.arc(n.x, n.y, 2.1, 0, Math.PI * 2); ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j], dx = n.x - m.x, dy = n.y - m.y, d = Math.hypot(dx, dy);
        if (d < link) {
          ctx.strokeStyle = accentA(0.38 * (1 - d / link));
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y, md = Math.hypot(mdx, mdy);
      if (md < reach) {
        ctx.strokeStyle = accentA(0.7 * (1 - md / reach));
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!RT_REDUCED) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
  frame();
}

/* Dot-grid background + cursor glow for inner pages (CSS draws the grid) */
function initBackdrop() {
  // WebGL shader background; if unavailable fall back to dot grid + cursor glow
  if (typeof startShader === "function" && startShader()) return;
  document.body.classList.add("has-grid");
  initCursorGlow();
}

function initCursorGlow() {
  if (RT_REDUCED || window.matchMedia("(pointer: coarse)").matches) return;
  const layer = document.createElement("div"); layer.className = "glow-layer";
  const glow = document.createElement("div"); glow.className = "cursor-glow";
  layer.appendChild(glow); document.body.prepend(layer);
  window.addEventListener("pointermove", function (e) { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });
}

/* ---------- Count-up number ---------- */
function countUp(el, to, suffix) {
  suffix = suffix || "";
  if (RT_REDUCED) { el.textContent = to + suffix; return; }
  const duration = 1200, t0 = performance.now();
  function frame(t) {
    const p = Math.min(1, (t - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * eased) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- Typing effect (terminal) ---------- */
async function typeLines(el, lines, speed) {
  speed = speed || 30;
  el.innerHTML = "";
  for (const ln of lines) {
    const div = document.createElement("div");
    div.className = ln.cls || "";
    el.appendChild(div);
    if (RT_REDUCED) { div.textContent = ln.text; continue; }
    const delay = ln.cls === "cmd" ? speed * 1.6 : speed;
    for (let i = 0; i < ln.text.length; i++) {
      div.textContent += ln.text[i];
      await sleep(delay);
    }
    await sleep(ln.cls === "cmd" ? 280 : 140);
  }
  const caret = document.createElement("span");
  caret.className = "caret";
  el.lastChild.appendChild(caret);
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal:not(.in)");
  if (RT_REDUCED || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const t = entry.target;
      t.classList.add("in");
      io.unobserve(t);
      setTimeout(function () { t.style.transitionDelay = ""; }, 1000);
    });
  }, { threshold: 0.1 });
  els.forEach(function (e, i) {
    e.style.transitionDelay = (i % 6) * 70 + "ms";
    io.observe(e);
  });
}

/* ---------- Toasts ---------- */
function toast(message, kind) {
  let box = document.getElementById("toasts");
  if (!box) {
    box = document.createElement("div");
    box.id = "toasts";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "rt-toast " + (kind || "");
  t.textContent = message;
  box.appendChild(t);
  setTimeout(function () {
    t.classList.add("out");
    setTimeout(function () { t.remove(); }, 400);
  }, 3800);
}
