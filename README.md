# Equatec Hub: redesenho (somente layout)

| Pasta | O que é |
|---|---|
| `prototype/` | Nova home (HTML/CSS/JS puro). Abrir com qualquer servidor estático: `cd prototype && python3 -m http.server 8000`. `?numeros=1` liga a seção de números reais (prévia). |
| `docs/superpowers/specs/` | Documento de design |
| `ops/` | Scripts de segurança e passagem para o Codex na VPS: `recon.sh` (somente leitura), `backup.sh`, `rollback.sh`, `verify-links.py`, `CODEX-PROMPT.md` |

Ordem: **backup → recon → aprovação → portagem em branch → verificação → publicação**. Rollback a qualquer momento com `ops/rollback.sh`.
O conteúdo editável (sistemas, textos, roadmap, números) está em `prototype/data/modules.js`.
