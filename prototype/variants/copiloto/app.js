(() => {
  const { reduce, el, $, $$, io, mods, road, fam } = EQ;
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const stop = new Set("de do da dos das e o a os as um uma para por com em no na nos nas que quero preciso controlar gerenciar ver ter".split(" "));
  const toks = s => norm(s).split(/[^a-z0-9]+/).filter(t => t.length > 2 && !stop.has(t));

  /* índice de busca: só o conteúdo público do Hub, tudo local */
  const idx = [
    ...mods.map(m => ({ kind: "mod", m, text: norm([m.name, m.what, m.problem, m.does, m.tags.join(" "), fam(m), m.short].join(" ")) })),
    ...road.map(r => ({ kind: "soon", r, text: norm([r.name, r.sub, r.text, r.tags.join(" ")].join(" ")) }))
  ];
  const syn = { obra: "obras rdo canteiro", exame: "aso exames ocupacionais", exames: "aso exames", seguranca: "ssma seguranca", ferramenta: "ferramentaria ferramentas calibracao", solda: "soldagem qualidade", soldagem: "soldagem qualidade", treinamento: "treinamentos certificados turmas", certificado: "certificados treinamentos", art: "art crea responsabilidade", crea: "art crea", ponto: "ponto rdo horas", horas: "ponto rdo horas", evento: "convites", festa: "convites", crm: "crm leads venda", ia: "ia agentes inteligencia", indicador: "indicadores bi", chamado: "chamados predial", predial: "predial manutencao chamados" };
  function search(q) {
    let t = toks(q); t = t.flatMap(w => [w, ...(syn[w] ? syn[w].split(" ") : [])]);
    if (!t.length) return [];
    return idx.map(e => ({ e, s: t.reduce((a, w) => a + (e.text.includes(w) ? 1 + (norm(e.kind === "mod" ? e.m.name : e.r.name).includes(w) ? 2 : 0) : 0), 0) }))
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(x => x.e);
  }

  /* resposta em streaming (local) */
  const ans = $("#answer"), glow = $("#glow"); let timer = 0;
  function say(q) {
    clearInterval(timer); ans.replaceChildren();
    const hits = search(q); const box = el("div", { className: "ans" }); ans.append(box);
    const live = hits.find(h => h.kind === "mod"), soon = hits.find(h => h.kind === "soon");
    const segs = !hits.length ? [["Não achei um sistema com essa descrição. Tente: ", 0], ["RDO, exames, ferramentas, treinamentos, qualidade", 1], [" ou me chame no WhatsApp.", 0]]
      : live ? [["Para isso, o caminho é o ", 0], [live.m.name, 1], [". " + live.m.does, 0]]
      : [["Isso ainda não está em produção, mas vem aí: ", 0], [soon.r.name, 1], [". " + soon.r.text, 0]];
    const out = el("p", { className: "stream caret" }); box.append(out);
    const full = segs.map(s => s[0]).join(""); let i = 0;
    const render = n => { out.replaceChildren(); let left = n; segs.forEach(([txt, b]) => { if (left <= 0) return; const part = txt.slice(0, left); left -= txt.length; out.append(b ? el("b", { textContent: part }) : document.createTextNode(part)); }); };
    const finish = () => { clearInterval(timer); out.classList.remove("caret"); glow.classList.remove("busy");
      if (hits.length) box.append(el("div", { className: "hits" }, hits.map(h => h.kind === "mod"
        ? el("a", { className: "hit", href: h.m.url }, [el("div", {}, [el("strong", { textContent: h.m.name }), el("span", { textContent: h.m.what })]), el("em", { textContent: h.m.cta + " →" })])
        : el("a", { className: "hit soon", href: "#proximos" }, [el("div", {}, [el("strong", { textContent: h.r.name }), el("span", { textContent: h.r.sub })]), el("em", { textContent: "em breve" })])))); };
    glow.classList.add("busy");
    if (reduce.matches) { render(full.length); finish(); return; }
    timer = setInterval(() => { i += 3; render(i); if (i >= full.length) finish(); }, 16);
  }
  $("#ask").addEventListener("submit", e => { e.preventDefault(); const q = $("#q").value.trim(); if (q) say(q); });
  const sugg = ["Controlar RDO e horas da obra", "Exames ocupacionais vencendo", "Ferramentas e calibração", "Certificados de treinamento", "Soldagem e qualidade", "CRM e gestão de contratos com IA"];
  sugg.forEach(s => $("#chips").append(el("li", {}, el("button", { type: "button", textContent: s, onclick: () => { $("#q").value = s; say(s); } }))));
  addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#q").focus(); $("#q").select(); } });

  /* bento: cada sistema com um micro-visual próprio */
  const bars = a => `<svg viewBox="0 0 200 90" preserveAspectRatio="none">${a.map((h, i) => `<rect class="b" x="${6 + i * 24}" y="${90 - h}" width="16" height="${h}" rx="3"/>`).join("")}</svg>`;
  const line = `<svg viewBox="0 0 200 90" preserveAspectRatio="none"><path class="l" d="M0 70 L30 55 L60 62 L90 30 L120 40 L150 15 L200 22"/></svg>`;
  const dots = `<svg viewBox="0 0 200 90">${Array.from({ length: 40 }, (_, i) => `<circle class="dot" cx="${12 + (i % 10) * 19}" cy="${14 + Math.floor(i / 10) * 20}" r="4"/>`).join("")}</svg>`;
  const ring = `<svg viewBox="0 0 200 90"><circle cx="100" cy="45" r="32" fill="none" stroke="#24242e" stroke-width="9"/><circle class="l" cx="100" cy="45" r="32" fill="none" stroke-width="9" stroke-dasharray="130 200" transform="rotate(-90 100 45)"/></svg>`;
  const viz = { canteiro: bars([30, 44, 38, 60, 52, 74, 86]), rdo: line, gestorrt: dots, ssma: dots, aso: ring, ferramentaria: dots, rtm: line, qualidade: bars([60, 40, 70, 50, 82, 64, 90]), treinamentos: ring, convite: dots };
  const bento = $("#bento");
  mods.forEach(m => bento.append(el("a", { className: "tile reveal", href: m.url }, [
    el("div", { className: "viz", innerHTML: viz[m.id] || dots }), el("p", { className: "mono", style: "font-size:.72rem;color:var(--ac2)", textContent: fam(m) }),
    el("h3", { textContent: m.name }), el("p", { textContent: m.what }), el("p", { className: "more", textContent: "Resolve: " + m.problem })])));
  /* pipeline dos próximos módulos */
  const pipe = $("#pipe");
  road.forEach((r, i) => pipe.append(el("li", { className: "reveal" }, [
    el("span", { className: "st mono", textContent: "em planejamento · 0" + (i + 1) }), el("h3", { textContent: r.name }),
    el("span", { className: "sub mono", textContent: r.sub }), el("p", { textContent: r.text }), el("div", { className: "t mono" }, r.tags.map(t => el("span", { textContent: t })))])));
  const rv = io(n => n.classList.add("in"), { threshold: .12 }); $$(".reveal").forEach(n => rv.observe(n));
})();
