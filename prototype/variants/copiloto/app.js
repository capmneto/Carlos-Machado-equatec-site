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
  mods.filter(m => m.id !== EQ.D.featured.id).forEach(m => bento.append(el("a", { className: "tile reveal", href: m.url }, [
    el("div", { className: "viz", innerHTML: viz[m.id] || dots }), el("p", { className: "mono", style: "font-size:.72rem;color:var(--ac2)", textContent: fam(m) }),
    el("h3", { textContent: m.name }), el("p", { textContent: m.what }), el("p", { className: "more", textContent: "Resolve: " + m.problem })])));
  /* próximos módulos: linhas, não cartões idênticos */
  const pipe = $("#pipe");
  road.forEach((r, i) => pipe.append(el("li", { className: "reveal" }, [
    el("span", { className: "st mono", textContent: "em planejamento" }),
    el("div", {}, [el("h3", { textContent: r.name }), el("span", { className: "sub mono", textContent: r.sub })]),
    el("div", {}, [el("p", { textContent: r.text }), el("div", { className: "t mono" }, r.tags.map(t => el("span", { textContent: t })))])])));

  /* destaque: Canteiro (gráficos ilustrativos; troque por telas reais em assets/canteiro-1.png) */
  const F = EQ.D.featured;
  F.points.forEach(p => $("#fpoints").append(el("li", { textContent: p })));
  $("#fgo").href = F.url;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">${inner}</svg>`;
  const grid = (w, h, n) => Array.from({ length: n }, (_, i) => `<line class="gr" x1="0" x2="${w}" y1="${(h / n) * i + 10}" y2="${(h / n) * i + 10}"/>`).join("");
  const T = [
    { k: "Avanço", t: "Avanço físico: planejado x realizado", c: "Curva S da obra, atualizada a cada medição.", v() { return `<div class="kpis"><div><small>físico (ex.)</small><b>61,4%</b></div><div><small>planejado (ex.)</small><b>66,0%</b></div><div><small>desvio (ex.)</small><b>-4,6 p.p.</b></div></div>` + svg(400, 190, grid(400, 190, 4) + `<path class="pl" d="M10 175 C90 170 140 130 200 95 S320 28 390 18"/><path class="rl" d="M10 175 C90 172 140 138 200 108 S270 68 300 58"/><circle cx="300" cy="58" r="4" fill="#a78bfa"/><text class="lb" x="12" y="14">planejado</text><text class="lb" x="12" y="28" fill="#a78bfa" style="fill:#c4b5fd">realizado</text>`); } },
    { k: "Cronograma", t: "Cronograma por frente de serviço", c: "Barras de prazo com o avanço sobre o planejado.", v() { const rows = [["Fundação", 10, 150, 100], ["Estrutura", 90, 200, 70], ["Montagem", 170, 210, 40], ["Tubulação", 220, 150, 15], ["Comissionamento", 300, 90, 0]]; return svg(400, 190, rows.map((r, i) => `<text class="lb" x="0" y="${28 + i * 34}">${r[0]}</text><rect class="gb" x="${100 + r[1] * .7}" y="${14 + i * 34}" width="${r[2] * .7}" height="14" rx="3"/><rect class="gp" x="${100 + r[1] * .7}" y="${14 + i * 34}" width="${r[2] * .7 * r[3] / 100}" height="14" rx="3" style="animation-delay:${i * .12}s"/>`).join("")); } },
    { k: "Custos", t: "Orçado x realizado por pacote", c: "Comparativo de custo para decidir antes de estourar.", v() { const d = [[70, 64], [90, 98], [60, 52], [80, 71], [50, 55]], nm = ["Civil", "Mecânica", "Elétrica", "Tubulação", "Pintura"]; return svg(400, 200, grid(400, 170, 4) + d.map((x, i) => `<rect class="bar2" x="${20 + i * 76}" y="${170 - x[0] * 1.5}" width="26" height="${x[0] * 1.5}" rx="3"/><rect class="bar" x="${50 + i * 76}" y="${170 - x[1] * 1.5}" width="26" height="${x[1] * 1.5}" rx="3" style="animation-delay:${i * .1}s"/><text class="lb" x="${22 + i * 76}" y="192">${nm[i]}</text>`).join("")); } },
    { k: "Compras", t: "Compras do pedido à entrega", c: "Cada requisição no estágio em que está.", v() { return `<div class="kan"><div><h4>cotação</h4><p>Tubo 6" SCH40</p><p>Eletrodo E7018</p></div><div><h4>aprovado</h4><p>Locação de andaime</p></div><div><h4>entregue</h4><p>Chapa A-36 12 mm</p><p>EPI da equipe</p></div></div>`; } },
    { k: "Documentos", t: "Documentos e relatórios da obra", c: "Vigência controlada para não descobrir na auditoria.", v() { return `<ul class="docs"><li class="ok"><span>ART da obra</span><em>vigente</em></li><li class="warn"><span>Procedimento de soldagem</span><em>vence em 12 dias</em></li><li class="ok"><span>Relatório semanal 47</span><em>enviado</em></li><li><span>Medição de novembro</span><em>em revisão</em></li></ul>`; } }
  ];
  const tabs = $("#ftabs"), panel = $("#fpanel"); let cur = 0, auto = 0, hold = false;
  T.forEach((x, i) => tabs.append(el("button", { type: "button", role: "tab", id: "tb" + i, textContent: x.k, onclick: () => { hold = true; show(i); } })));
  function show(i) {
    cur = i; [...tabs.children].forEach((b, j) => { b.setAttribute("aria-selected", j === i); b.tabIndex = j === i ? 0 : -1; });
    panel.setAttribute("aria-labelledby", "tb" + i);
    panel.replaceChildren(el("h3", { textContent: T[i].t }), el("p", { className: "cap", textContent: T[i].c }), el("div", { innerHTML: T[i].v() }));
    panel.style.animation = "none"; void panel.offsetWidth; panel.style.animation = "";
  }
  tabs.addEventListener("keydown", e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { hold = true; show((cur + d + T.length) % T.length); tabs.children[cur].focus(); } });
  show(0);
  const vizEl = $(".feat-viz"); let vis = false;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(vizEl);
  if (!reduce.matches) setInterval(() => { if (vis && !hold && !document.hidden) show((cur + 1) % T.length); }, 5200);
  vizEl.addEventListener("pointerenter", () => { hold = true; });
  /* tela real: se existir assets/canteiro-1.png, substitui os gráficos ilustrativos */
  const shot = new Image(); shot.onload = () => { $("#fimg").src = shot.src; $("#fshot").hidden = false; $("#ftabs").hidden = $("#fpanel").hidden = $("#fnote").hidden = true; }; shot.src = "../../assets/canteiro-1.png";
  const rv = io(n => n.classList.add("in"), { threshold: .12 }); $$(".reveal").forEach(n => rv.observe(n));
})();
