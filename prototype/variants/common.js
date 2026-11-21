/* Utilitários compartilhados pelas variantes. Só apresentação; nenhuma lógica dos módulos. */
window.EQ = (() => {
  const D = window.EQ_DATA;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const el = (tag, props = {}, kids = []) => {
    const { dataset, ...rest } = props, n = Object.assign(document.createElement(tag), rest);
    if (dataset) Object.assign(n.dataset, dataset);
    [].concat(kids).forEach(k => k != null && n.append(k)); return n;
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fam = m => D.families[m.family];
  const io = (fn, opt = { threshold: .2 }) => new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } }), opt);
  return { D, reduce, el, $, $$, fam, io, mods: D.modules, road: D.roadmap, links: D.links };
})();
