(() => {
  const { D, reduce, el, $, $$, io, mods, road, fam } = EQ;
  /* ---------- cartões ---------- */
  const rail = $("#rail");
  mods.forEach((m, i) => rail.append(el("li", { className: "card reveal", dataset: { i: String(i) } }, [
    el("span", { className: "ix mono", textContent: String(i + 1).padStart(2, "0") + " · " + fam(m) }),
    el("h3", { textContent: m.name }), el("p", { textContent: m.what }),
    el("a", { href: m.url, textContent: m.cta + " →" })
  ])));
  const ghosts = $("#ghosts");
  road.forEach(r => ghosts.append(el("li", { className: "reveal" }, [
    el("span", { className: "ring" }),
    el("div", {}, [el("h3", { textContent: r.name }), el("span", { className: "sub mono", textContent: r.sub }), el("p", { textContent: r.text }),
      el("div", { className: "chips" }, r.tags.map(t => el("span", { textContent: t })))])
  ])));
  const rv = io(n => n.classList.add("in")); $$(".reveal").forEach(n => rv.observe(n));

  /* ---------- constelação 3D (canvas, sem bibliotecas) ---------- */
  const cv = $("#sky"), ctx = cv.getContext("2d"), stage = $("#stage");
  let W, H, dpr, yaw = .6, pit = .35, vy = reduce.matches ? 0 : .0016, vp = 0, dragging = false, px = 0, py = 0, focus = -1, hover = -1, scrollP = 0, moved = 0;
  const N = mods.length, G = road.length, golden = Math.PI * (3 - Math.sqrt(5));
  const onSphere = (k, n, r) => { const y = 1 - (k / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), t = k * golden; return [Math.cos(t) * rr * r, y * r, Math.sin(t) * rr * r]; };
  const nodes = mods.map((m, i) => ({ p: onSphere(i, N, 1), m, i }));
  const ghost = road.map((r, i) => ({ p: onSphere(i + .5, G, 1.55), r, i }));
  const dust = Array.from({ length: 240 }, () => { const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), r = .5 + Math.random() * 1.5; return [r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)]; });
  let proj = [], gproj = [];

  function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener("resize", size); size();

  function project(p, cx, cy, S) {
    const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pit), sP = Math.sin(pit);
    let x = p[0] * cY - p[2] * sY, z = p[0] * sY + p[2] * cY, y = p[1] * cP - z * sP; z = p[1] * sP + z * cP;
    const k = 3.4 / (3.4 + z); return { x: cx + x * S * k, y: cy + y * S * k, z, k };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const r = stage.getBoundingClientRect();
    const wide = innerWidth > 900;
    const cx = wide ? r.left + r.width / 2 : W / 2, cy = wide ? r.top + r.height / 2 : Math.max(r.top + r.height / 2, 200);
    const S = Math.min(r.width, r.height) * (wide ? .36 : .3);
    const fade = Math.max(.12, 1 - scrollP * 1.4);
    ctx.globalAlpha = fade;
    dust.forEach(d => { const q = project(d, cx, cy, S); ctx.fillStyle = "#6c7bff"; ctx.globalAlpha = fade * (.15 + .45 * q.k * .6); ctx.fillRect(q.x, q.y, 1.4 * q.k, 1.4 * q.k); });
    ctx.globalAlpha = fade;
    const hub = project([0, 0, 0], cx, cy, S);
    proj = nodes.map(n => ({ ...project(n.p, cx, cy, S), n }));
    gproj = ghost.map(g => ({ ...project(g.p, cx, cy, S), g }));
    proj.forEach(q => { const on = q.n.i === focus || q.n.i === hover; ctx.strokeStyle = on ? "#ffb454" : "#6c7bff"; ctx.globalAlpha = fade * (on ? .9 : .16 + .14 * q.k); ctx.lineWidth = on ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(hub.x, hub.y); ctx.lineTo(q.x, q.y); ctx.stroke(); });
    ctx.globalAlpha = fade;
    gproj.forEach(q => { ctx.strokeStyle = "#6c7bff"; ctx.globalAlpha = fade * .35 * q.k; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(q.x, q.y, 7 * q.k, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); });
    ctx.fillStyle = "#ffb454"; ctx.globalAlpha = fade; ctx.beginPath(); ctx.arc(hub.x, hub.y, 7, 0, 6.283); ctx.fill();
    ctx.globalAlpha = fade * .25; ctx.beginPath(); ctx.arc(hub.x, hub.y, 18 + 4 * Math.sin(performance.now() / 500), 0, 6.283); ctx.stroke();
    [...proj].sort((a, b) => b.z - a.z).forEach(q => {
      const on = q.n.i === focus || q.n.i === hover, rad = (on ? 9 : 5.5) * q.k + 1;
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad * 4); g.addColorStop(0, on ? "rgba(255,180,84,.9)" : "rgba(160,170,255,.6)"); g.addColorStop(1, "transparent");
      ctx.globalAlpha = fade * (.5 + .5 * q.k * .8); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, rad * 4, 0, 6.283); ctx.fill();
      ctx.globalAlpha = fade; ctx.fillStyle = on ? "#ffb454" : "#eceaff"; ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 6.283); ctx.fill();
      if (on || q.z < -.1) { ctx.font = "12px 'JetBrains Mono', monospace"; ctx.globalAlpha = fade * (on ? 1 : .55); ctx.fillStyle = on ? "#ffb454" : "#cfd0ff"; ctx.fillText(q.n.m.short, q.x + rad + 8, q.y + 4); }
    });
    ctx.globalAlpha = 1;
  }

  let raf = 0, last = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!dragging) { yaw += vy; pit += vp; vp *= .94; if (Math.abs(vy) > .0016) vy *= .96; else if (!reduce.matches) vy += (.0016 - vy) * .02; }
    pit = Math.max(-1.1, Math.min(1.1, pit));
    draw();
  }
  document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(loop); });
  raf = requestAnimationFrame(loop);
  addEventListener("scroll", () => { scrollP = Math.min(1, scrollY / (innerHeight * .9)); }, { passive: true });

  /* interação: arrastar gira; clique abre; hover acende */
  const pick = (x, y) => { let best = -1, bd = 26; proj.forEach(q => { const d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = q.n.i; } }); return best; };
  stage.addEventListener("pointerdown", e => { dragging = true; moved = 0; px = e.clientX; py = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", e => {
    if (dragging) { const dx = e.clientX - px, dy = e.clientY - py; moved += Math.abs(dx) + Math.abs(dy); yaw += dx * .006; pit += dy * .006; vy = dx * .0004; vp = dy * .0004; px = e.clientX; py = e.clientY; }
    else { hover = pick(e.clientX, e.clientY); stage.style.cursor = hover >= 0 ? "pointer" : "grab"; }
  });
  stage.addEventListener("pointerup", e => { dragging = false; if (moved < 6) { const i = pick(e.clientX, e.clientY); if (i >= 0) openSheet(i); } });
  stage.addEventListener("pointerleave", () => { hover = -1; });
  $$(".card").forEach(c => { const i = +c.dataset.i; c.addEventListener("mouseenter", () => { focus = i; }); c.addEventListener("mouseleave", () => { focus = -1; }); c.addEventListener("focusin", () => { focus = i; }); c.addEventListener("focusout", () => { focus = -1; }); });

  /* folha de detalhe */
  const sheet = $("#sheet"), body = $("#sh-body");
  function openSheet(i) {
    const m = mods[i];
    body.replaceChildren(el("p", { className: "mono", style: "color:#ffb454;font-size:.8rem", textContent: m.host }), el("h3", { id: "sh-t", textContent: m.name }), el("p", { textContent: m.what }),
      el("dl", {}, [el("dt", { className: "mono", textContent: "o problema" }), el("dd", { textContent: m.problem }), el("dt", { className: "mono", textContent: "o que faz" }), el("dd", { textContent: m.does })]),
      el("p", { className: "row" }, [el("a", { className: "btn solid", href: m.url, textContent: m.cta + " →" })]));
    sheet.showModal();
  }
  sheet.addEventListener("click", e => { if (e.target === sheet) sheet.close(); });
  setTimeout(() => { const h = $("#hint"); if (h) h.style.opacity = .0; }, 9000);
})();
