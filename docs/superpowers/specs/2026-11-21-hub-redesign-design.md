# Redesenho do Equatec Hub: design

Data: 2026-11-21 · Autor da decisão: Carlos Machado · Status: **protótipo para aprovação**

## Intenção e porquê
O Hub público parece uma landing page genérica gerada por IA e não transmite que 10 sistemas reais estão em produção, nem quem os construiu. Objetivo: um Hub escuro, tecnológico, minimalista e **vivo**, que mostre desenvolvimento de sistemas, IA e futuro, apresente melhor o Carlos e dê contexto a cada solução.

## Regra de ouro (restrição inegociável)
**Só layout muda.** Nenhuma rota, URL, autenticação, API, banco ou comportamento dos módulos é alterado. `ops/verify-links.py` compara os links do protótipo com a linha de base do site atual (`ops/baseline-links.txt`).

## Metas / não-metas / anti-metas
- Metas: contexto por sistema (problema, o que faz, status), prova com números reais, apresentação pessoal forte, movimento com propósito, mobile de primeira, acessibilidade.
- Não-metas: mexer nos módulos (RDO, SSMA, etc.), trocar framework, criar CMS, alterar login/cadastro do Hub.
- Anti-metas (falha mesmo que "funcione"): visual de template (gradiente em palavra, grade de cards iguais, numeração decorativa, ciano neon), animação que atrapalha leitura ou performance, dado sensível exposto.

## Escopo (decisões do Carlos)
Saem do Hub público: EAP Contratos, SIGT, Obras, FACILMART, Mind Map AI.
Ficam 10: RDO, Gestor de RT, Gestão Integrada de Obras, Ferramentas SSMA, ASO, SGAF, RTM, Qualidade e RTM, Treinamentos/SGT, Convites.
*Minha suposição:* "Obras" = `obras.equatec-eng.com.br`; `gestaoobras.` permanece. Para inverter, mudar `data/modules.js`.

## Abordagens consideradas
1. **Refino de tema** (paleta/tipografia, mesma estrutura): baixo risco, mas segue "catálogo de cards".
2. **Reposicionamento com diagrama vivo + lista/detalhe (escolhida):** nova estrutura de conteúdo e hero interativo; conteúdo em um arquivo de dados; sem dependências.
3. **Reconstrução completa (CMS, páginas por módulo):** excesso para o estágio atual.
*Escolhida pela direção do Carlos: tecnológico, vivo, IA/futuro, sem site estático.*

## Decisões de design (minhas, ajustáveis)
- Cor: preto profundo `#06080a` + **um** acento fósforo `#5cffa0` (token `--accent`).
- Tipografia: Space Grotesk (texto/títulos) + JetBrains Mono (dados/hosts), auto-hospedadas (woff2), sem CDN.
- Hero: diagrama em canvas, Hub ao centro e 10 nós por família, pulsos de dados, reage ao mouse e ao item selecionado na lista. Pausa fora da tela/aba oculta; estático com `prefers-reduced-motion`.
- Sistemas: lista numerada + painel de detalhe (desktop) / acordeão inline (mobile).
- Números reais **fora do bundle público**: `modules.js` tem `numbers: []` e `showNumbers:false`. O valor de teste fica em `data/numbers.local.js` (ignorado pelo git e só carregado em localhost com `?numeros=1`). Para publicar: o Carlos autoriza e os valores são movidos para `modules.js`.
- Roadmap reduzido a 3 itens (Document AI, PMOC AI, Agentes), rotulado "em desenvolvimento".
- Seção "Sobre": só fatos já públicos no site atual; trajetória por competências (sem inventar empresas). **Pendente: Carlos completar** credenciais (CREA, formação) e cases.

## Deixado ao implementador
Portar para o stack real do Hub (provavelmente Next.js/Tailwind), mantendo os arquivos de conteúdo em um único módulo de dados, SSR da estrutura e canvas só no cliente.

## Notas de portagem (revisão independente)
- Dados como módulo ES (não `window.EQ_DATA`); sem `window/document/matchMedia` no topo do módulo (SSR).
- Canvas em componente `"use client"` com `useEffect` que devolve `destroy()` (ResizeObserver, IntersectionObserver, listeners, rAF). Funciona com StrictMode.
- Painel de detalhe renderizado por estado + breakpoint em React, **sem mover nós do DOM** como faz o protótipo (`placeDetail`).
- Não ler `?numeros` no servidor (erro de hidratação).
- Contraste: `--faint` ajustado para ≥4,5:1; sem `aria-live` no painel.

## Riscos
Divergência entre protótipo e stack real (mitigado: recon antes); números sensíveis (flag desligada); desempenho do canvas em celular fraco (DPR ≤ 2, pausa fora da tela).
