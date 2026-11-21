/* Equatec Hub: comportamento da página. Sem dependências. Não altera nenhuma lógica dos módulos. */
(() => {
  "use strict";
  const D = window.EQ_DATA;
  if (!D || !Array.isArray(D.modules)) { document.documentElement.classList.remove("js"); return; }  // sem dados: mostra o HTML estático
  D.modules.forEach(m => { m.tags = m.tags || []; });
  D.numbers = D.numbers || [];
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, props = {}, kids = []) => {
    const { dataset, ...rest } = props;
    const n = Object.assign(document.createElement(tag), rest);
    if (dataset) Object.assign(n.dataset, dataset);
    [].concat(kids).forEach(k => n.append(k));
    return n;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fmt = n => n.toLocaleString("pt-BR");
  const showNumbers = D.showNumbers === true && D.numbers.length > 0;   // números só entram quando o dono publicar em modules.js

  /* ---------- lista de sistemas + painel de detalhe ---------- */
  const list = $("#modlist"), detail = $("#detail");
  const holder = el("li", { className: "detail-holder" });
  const lis = () => list.querySelectorAll(":scope > li:not(.detail-holder)");
  let active = 0;

  D.modules.forEach((m, i) => {
    const btn = el("button", { className: "mod-btn", type: "button" }, [
      el("span", { className: "ix", textContent: String(i + 1).padStart(2, "0") }),
      el("span", { className: "nm", textContent: m.name }),
      el("span", { className: "fam", textContent: D.families[m.family] })
    ]);
    btn.addEventListener("click", () => select(i, true));
    btn.addEventListener("mouseenter", () => matchMedia("(hover:hover)").matches && select(i));
    btn.addEventListener("focus", () => select(i));
    list.append(el("li", {}, btn));
  });

  function renderDetail(m) {
    detail.replaceChildren(
      el("p", { className: "host mono", textContent: m.host }),
      el("h3", { textContent: m.name }),
      el("p", { className: "what", textContent: m.what }),
      el("dl", {}, [
        el("div", {}, [el("dt", { textContent: "o problema" }), el("dd", { textContent: m.problem })]),
        el("div", {}, [el("dt", { textContent: "o que o sistema faz" }), el("dd", { textContent: m.does })])
      ]),
      el("ul", { className: "chips" }, m.tags.map(t => el("li", { textContent: t }))),
      el("a", { className: "btn solid", href: m.url, textContent: m.cta + " →" })
    );
    detail.classList.remove("swap"); void detail.offsetWidth;
    if (!reduce.matches) detail.classList.add("swap");
  }

  function select(i, scroll) {
    active = i;
    lis().forEach((li, j) => j === i ? li.firstChild.setAttribute("aria-current", "true") : li.firstChild.removeAttribute("aria-current"));
    renderDetail(D.modules[i]);
    placeDetail();
    graph && graph.focus(i);
    if (scroll && !wide.matches) detail.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "nearest" });
  }

  const wide = matchMedia("(min-width: 961px)");
  function placeDetail() {   // no mobile, o painel abre logo abaixo do item ativo
    const split = $(".split");
    if (wide.matches) { holder.remove(); if (detail.parentNode !== split) split.append(detail); return; }
    lis()[active].after(holder); holder.append(detail);
  }
  wide.addEventListener("change", placeDetail);

  /* ---------- método, roadmap, números ---------- */
  const steps = $("#steps");
  D.method.forEach(s => steps.append(el("li", {}, [el("b", { textContent: s.t }), el("span", { textContent: s.d })])));
  const road = $("#roadmap");
  D.roadmap.forEach(r => road.append(el("li", {}, [el("h3", { textContent: r.name }), el("p", { textContent: r.text })])));

  if (showNumbers) {
    $("#resultados").hidden = false;
    $("#asof").textContent = "dados de produção em " + D.numbersAsOf;
    D.numbers.forEach(n => $("#numbers").append(el("div", {}, [
      el("dt", { textContent: n.label }), el("dd", { textContent: fmt(n.value), dataset: { to: String(n.value) } })
    ])));
  } else {
    document.querySelectorAll("[data-numbers]").forEach(a => a.remove());
  }

  /* legenda do hero */
  const legend = $(".viz-legend");
  D.modules.forEach(m => legend.append(el("li", { textContent: m.short })));

  /* ---------- menu mobile ---------- */
  const menuBtn = $(".menu-btn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.textContent = open ? "Fechar" : "Menu";
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.textContent = "Menu"; } });
  addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { menuBtn.click(); menuBtn.focus(); } });

  /* ---------- reveal, contadores, progresso do método ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    e.target.querySelectorAll("[data-to]").forEach(count);
  }), { threshold: .15 });
  document.querySelectorAll(".reveal").forEach(n => io.observe(n));

  function count(n) {
    const to = +n.dataset.to;
    if (reduce.matches) return;
    const t0 = performance.now(), dur = 1400;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      n.textContent = fmt(Math.round(to * e));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  const items = [...steps.children];
  function stepProgress() {
    const r = steps.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .3)));
    steps.style.setProperty("--p", p.toFixed(3));
    items.forEach((li, i) => li.classList.toggle("on", p > (i + .4) / items.length));
  }
  addEventListener("scroll", stepProgress, { passive: true }); stepProgress();

  /* ---------- diagrama vivo (canvas) ---------- */
  let graph = null;
  try { graph = makeGraph($("#graph")); } catch (e) { console.warn("diagrama indisponível", e); }

  function makeGraph(canvas) {
    const ctx = canvas.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const C = { accent: css.getPropertyValue("--accent").trim(), ink: css.getPropertyValue("--ink").trim(), line: css.getPropertyValue("--line-2").trim(), faint: css.getPropertyValue("--faint").trim() };
    const mods = D.modules;
    const fams = [...new Set(mods.map(m => m.family))];
    // ordena por família para que irmãos fiquem vizinhos no anel
    const order = mods.map((m, i) => i).sort((a, b) => fams.indexOf(mods[a].family) - fams.indexOf(mods[b].family));
    const nodes = order.map((idx, k) => ({ idx, ang: (k / mods.length) * Math.PI * 2 - Math.PI / 2, ph: Math.random() * 6.28, x: 0, y: 0, glow: 0 }));
    const edges = nodes.map((_, i) => [-1, i]);                      // hub -> nó
    nodes.forEach((n, i) => { const j = (i + 1) % nodes.length; if (mods[n.idx].family === mods[nodes[j].idx].family) edges.push([i, j]); });
    const pulses = [];
    let W = 0, H = 0, dpr = 1, running = false, visible = true, focusIdx = -1, mouse = null, last = 0, spawn = 0, raf = 0;

    function size() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(0);
    }
    new ResizeObserver(size).observe(canvas);

    const pos = (n, t) => {
      const R = Math.min(W, H) * .37, w = reduce.matches ? 0 : 1;
      const a = n.ang + w * Math.sin(t * .0003 + n.ph) * .05;
      const r = R * (1 + w * Math.sin(t * .0005 + n.ph * 2) * .04);
      let x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r * .92;
      if (mouse) { x += (mouse.x - W / 2) * .015; y += (mouse.y - H / 2) * .015; }
      return [x, y];
    };

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const hub = [W / 2 + (mouse ? (mouse.x - W / 2) * .01 : 0), H / 2 + (mouse ? (mouse.y - H / 2) * .01 : 0)];
      nodes.forEach(n => { [n.x, n.y] = pos(n, t); });
      const pt = i => (i < 0 ? hub : [nodes[i].x, nodes[i].y]);

      // arestas
      edges.forEach(([a, b]) => {
        const [x1, y1] = pt(a), [x2, y2] = pt(b);
        const on = b >= 0 && (nodes[b].idx === focusIdx || (a >= 0 && nodes[a].idx === focusIdx));
        ctx.strokeStyle = on ? C.accent : C.line; ctx.globalAlpha = on ? .9 : (a < 0 ? .55 : .3);
        ctx.lineWidth = on ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // pulsos de dado
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.t += p.v; if (p.t >= 1) { pulses.splice(i, 1); continue; }
        if (p.t < 0) continue;
        const [a, b] = edges[p.e], [x1, y1] = pt(a), [x2, y2] = pt(b);
        const k = p.rev ? 1 - p.t : p.t, x = x1 + (x2 - x1) * k, y = y1 + (y2 - y1) * k;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, C.accent); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.28); ctx.fill();
      }

      // nós
      ctx.font = `${W < 420 ? 10 : 12}px "JetBrains Mono", monospace`; ctx.textBaseline = "middle";
      nodes.forEach(n => {
        const f = n.idx === focusIdx; n.glow += ((f ? 1 : 0) - n.glow) * .15;
        let near = 0; if (mouse) near = Math.max(0, 1 - Math.hypot(mouse.x - n.x, mouse.y - n.y) / 90);
        const g = Math.max(n.glow, near);
        if (g > .02) { const rg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 28); rg.addColorStop(0, C.accent); rg.addColorStop(1, "transparent"); ctx.globalAlpha = g * .45; ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(n.x, n.y, 28, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1; }
        ctx.fillStyle = "#06080a"; ctx.strokeStyle = g > .4 ? C.accent : C.faint; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(n.x, n.y, 5 + g * 2.5, 0, 6.28); ctx.fill(); ctx.stroke();
        ctx.fillStyle = g > .4 ? C.accent : C.ink; ctx.globalAlpha = g > .4 ? 1 : .72;
        const right = Math.cos(n.ang) >= -0.01, lbl = mods[n.idx].short;
        ctx.textAlign = right ? "left" : "right"; ctx.fillText(lbl, n.x + (right ? 14 : -14), n.y); ctx.globalAlpha = 1;
      });

      // hub
      const pulse = reduce.matches ? 0 : (Math.sin(t * .002) + 1) / 2;
      ctx.strokeStyle = C.accent; ctx.globalAlpha = .25 + pulse * .25; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hub[0], hub[1], 22 + pulse * 8, 0, 6.28); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(hub[0], hub[1], 8, 0, 6.28); ctx.fill();
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText("hub", hub[0], hub[1] + 40);
    }

    function frame(t) {
      raf = 0; if (!running) return;
      const dt = t - last; last = t; spawn -= dt;
      if (spawn <= 0) { pulses.push({ e: (Math.random() * edges.length) | 0, t: 0, v: .006 + Math.random() * .006, rev: Math.random() < .5 }); spawn = 260 + Math.random() * 380; }
      draw(t); raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce.matches || !visible || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    reduce.addEventListener("change", () => { stop(); draw(0); start(); });

    canvas.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; if (!running) draw(performance.now()); });
    canvas.addEventListener("pointerleave", () => { mouse = null; if (!running) draw(performance.now()); });
    canvas.addEventListener("click", e => {
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const hit = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 22);
      if (hit) select(hit.idx, true);
    });

    return {
      focus(i) { focusIdx = i; const k = nodes.findIndex(n => n.idx === i); if (k >= 0) { const e = edges.findIndex(([a, b]) => a < 0 && b === k); if (running && pulses.length < 40) for (let j = 0; j < 3; j++) pulses.push({ e, t: -j * .22, v: .012, rev: false }); } if (!running) { nodes.forEach(n => { n.glow = n.idx === i ? 1 : 0; }); draw(performance.now()); } }
    };
  }

  select(0);
})();
