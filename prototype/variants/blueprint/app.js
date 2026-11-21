(() => {
  const { reduce, el, $, $$, io, mods, road, fam } = EQ;
  const NS = "http://www.w3.org/2000/svg", svg = $("#plant");
  const sv = (t, a = {}, k = []) => { const n = document.createElementNS(NS, t); Object.entries(a).forEach(([x, v]) => n.setAttribute(x, v)); k.forEach(c => n.append(c)); return n; };
  const P = (d, c = "s") => sv("path", { d, class: c + " dr", pathLength: 1 });

  /* ---------- planta (traços técnicos) ---------- */
  const g = sv("g");
  const parts = [
    "M20 478H780",                                               // solo
    "M70 478V250C70 238 190 238 190 250V478M70 250C70 262 190 262 190 250",   // tanque 1
    "M215 478V300C215 290 305 290 305 300V478M215 300C215 310 305 310 305 300M215 360H305M215 420H305",   // tanque 2 com costuras
    "M190 440H215M305 440H440M305 410H640M305 425H640",           // linhas de tubulação
    "M330 478V380H450V478M330 380L390 350L450 380M355 478V430H385V478",   // casa de controle
    "M470 478V398C470 388 560 388 560 398V478M470 398C470 408 560 408 560 398",   // vaso horizontal / pulmão
    "M640 478L650 130H690L700 478M646 200H694M643 300H697M640 400H700",      // chaminé
    "M380 478V90M380 90L250 140M380 90L520 128M250 140V160M520 128V160M380 130L330 150M380 130L430 142",  // guindaste
    "M600 478V455M610 478V455M597 455H613M605 430a7 7 0 1 1 .1 0M605 437V455M598 444H612",  // operador
    "M80 478V430M120 478V430M80 430H120M95 478V452",              // canteiro / contêiner
    "M735 478V380M735 380H775V410H735",                           // bandeira
    "M95 270V470M102 270V470M95 300H102M95 330H102M95 360H102M95 390H102M95 420H102M95 450H102"   // escada
  ];
  parts.forEach((d, i) => { const p = P(d); p.style.animationDelay = (i * 0.12) + "s"; g.append(p); });
  g.append(P("M20 500H780M20 506V494M780 506V494", "s d"));
  svg.append(g);

  /* marcadores: posição de cada sistema na planta */
  const pos = { canteiro:[380,96], rdo:[390,365], gestorrt:[670,160], ssma:[98,282], aso:[605,424], ferramentaria:[420,418], rtm:[560,412], qualidade:[265,358], treinamentos:[100,420], convite:[755,395] };
  const marks = mods.map((m, i) => {
    const [x, y] = pos[m.id] || [400, 300];
    const n = sv("g", { class: "mk", tabindex: "0", role: "button", "aria-label": `${i + 1}. ${m.name}`, transform: `translate(${x} ${y})` }, [
      sv("circle", { class: "halo", r: 20 }), sv("circle", { r: 11 }), sv("text", {}, [])]);
    n.lastChild.textContent = i + 1; n.style.animationDelay = (1.2 + i * .1) + "s";
    n.addEventListener("mouseenter", () => show(i)); n.addEventListener("focus", () => show(i)); n.addEventListener("click", () => show(i, true));
    svg.append(n); return n;
  });

  /* carimbo (title block) com o detalhe do sistema ativo */
  const tb = $("#tb");
  function show(i, go) {
    const m = mods[i];
    marks.forEach((k, j) => k.classList.toggle("on", j === i));
    $$("#bom tr").forEach((r, j) => r.classList.toggle("on", j === i));
    tb.replaceChildren(
      el("div", { className: "wide" }, [el("small", { textContent: "SISTEMA " + String(i + 1).padStart(2, "0") }), el("b", { textContent: m.name }), el("br"), document.createTextNode(m.what)]),
      el("div", {}, [el("small", { textContent: "FAMÍLIA" }), document.createTextNode(fam(m))]),
      el("div", {}, [el("small", { textContent: "ACESSO" }), el("a", { href: m.url, textContent: m.cta + " →" })]));
    if (go && matchMedia("(hover:none)").matches) tb.scrollIntoView({ block: "nearest", behavior: reduce.matches ? "auto" : "smooth" });
  }

  /* lista de materiais */
  const bom = $("#bom");
  mods.forEach((m, i) => { const tr = el("tr", {}, [
    el("td", { className: "n", textContent: String(i + 1).padStart(2, "0") }), el("td", { className: "nm", textContent: m.name }),
    el("td", { className: "f", textContent: fam(m) }), el("td", { className: "w", textContent: m.problem }),
    el("td", {}, [el("a", { href: m.url, textContent: m.cta + " →" })])]);
    tr.addEventListener("mouseenter", () => show(i)); bom.append(tr); });

  /* revisões planejadas */
  const revs = $("#revs"), letters = "BCDEF";
  road.forEach((r, i) => revs.append(el("li", { className: "reveal" }, [
    el("span", { className: "rv mono", textContent: "REV. " + letters[i] + " · PLANEJADO" }), el("h3", { textContent: r.name }),
    el("span", { className: "sub mono", textContent: r.sub }), el("p", { textContent: r.text }),
    el("div", { className: "chips mono" }, r.tags.map(t => el("span", { textContent: t })))])));
  const rv = io(n => n.classList.add("in")); $$(".reveal").forEach(n => rv.observe(n));
  show(0);

  /* retículo com coordenadas (só com mouse) */
  if (matchMedia("(hover:hover)").matches && !reduce.matches) {
    const xh = $("#xh"), [h, v, lab] = xh.children;
    addEventListener("pointermove", e => { xh.style.opacity = 1; h.style.top = e.clientY + "px"; v.style.left = e.clientX + "px"; lab.style.left = e.clientX + "px"; lab.style.top = e.clientY + "px"; lab.textContent = `X ${String(e.clientX).padStart(4, "0")} · Y ${String(Math.round(e.clientY + scrollY)).padStart(4, "0")}`; });
    document.addEventListener("pointerleave", () => { xh.style.opacity = 0; });
  }
})();
