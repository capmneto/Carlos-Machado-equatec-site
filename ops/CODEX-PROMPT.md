# Instruções para o Codex (execução na VPS)

Contexto: vamos substituir **somente o layout** da página inicial pública do Equatec Hub. Nada de lógica, rotas, autenticação, APIs, bancos ou módulos pode mudar. O protótipo está em `prototype/` neste repositório (HTML/CSS/JS puro, sem build). Decisões em `docs/superpowers/specs/2026-11-21-hub-redesign-design.md`.

## Etapa 0: segurança primeiro (obrigatória)
1. `git clone` este repositório numa pasta temporária (NÃO dentro do diretório do Hub).
2. Descubra o diretório do Hub: `bash ops/recon.sh` (lista candidatos) e depois `HUB_DIR=<pasta> bash ops/recon.sh | tee recon-hub.txt`.
3. **Backup:** `HUB_DIR=<pasta> bash ops/backup.sh`. Confirme a mensagem `OK:` e guarde o caminho. Se falhar, PARE.
4. Cole a saída de `recon-hub.txt` (ela não contém segredos) em `ops/recon-hub.txt` no repo e faça commit. Assim o planejamento da portagem é feito com base no código real.

## Etapa 1: portar (só depois da aprovação do Carlos)
- Trabalhe em uma **branch nova** do repositório do Hub (`redesign-home`), nunca direto na principal.
- Alvo: apenas a home pública (`app/page.*` ou equivalente), seus componentes e estilos globais. **Não toque** em `/login`, `/cadastro`, middleware, API routes, `.env`, banco.
- Converta `prototype/index.html` + `data/modules.js` em componentes, mantendo o conteúdo no módulo de dados. O canvas roda só no cliente. Fontes: copie `prototype/assets/fonts/` para `public/` (sem CDN).
- Rode `python3 ops/verify-links.py` (adaptando o caminho) e confirme que **todas** as URLs/rotas continuam as mesmas.
- `npm run build` deve passar sem erro novo. Rode os testes existentes, se houver.

## Etapa 2: publicar e reverter
- Publique com o mesmo processo que o Hub já usa (ex.: `pm2 restart <app>`).
- Valide: `/`, `/login`, `/cadastro` respondem 200; cada link de módulo abre; mobile sem rolagem horizontal.
- **Rollback imediato** se algo falhar: `HUB_DIR=<pasta> bash ops/rollback.sh` (restaura o último backup; o estado quebrado fica preservado em `<pasta>.falhou-<data>`).

## Regras
- Nunca imprimir, commitar ou enviar o conteúdo de `.env`, senhas ou tokens. O backup contém segredos e fica **só na VPS** (permissão 600).
- Não desativar testes, não reescrever histórico git, não apagar o backup.
- Em dúvida sobre qualquer arquivo de lógica: pare e pergunte.
