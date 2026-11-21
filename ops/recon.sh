#!/usr/bin/env bash
# Somente leitura. Mapeia onde o Hub vive na VPS e como é servido.
# Uso: HUB_DIR=/caminho/do/hub bash ops/recon.sh | tee recon-hub.txt
# NÃO imprime conteúdo de .env nem senhas: só os NOMES das variáveis.
set -u
HUB_DIR="${HUB_DIR:-}"
echo "== data: $(date -Is) | host: $(hostname)"
if [ -z "$HUB_DIR" ]; then
  echo "== HUB_DIR não informado. Candidatos (package.json com next):"
  find / -maxdepth 5 -name package.json -not -path '*/node_modules/*' -not -path '/proc/*' 2>/dev/null \
    | xargs -r grep -l '"next"' 2>/dev/null | head -20
  echo "Rode de novo com HUB_DIR=<pasta>"; exit 0
fi
cd "$HUB_DIR" || exit 1
echo "== pasta: $(pwd)"; echo "== git:"; git rev-parse --short HEAD 2>&1 | head -1; git status --short 2>/dev/null | head -20
echo "== package.json (scripts/deps principais):"
node -e 'const p=require("./package.json");console.log(JSON.stringify({name:p.name,scripts:p.scripts,deps:p.dependencies},null,1))'
echo "== estrutura (3 níveis, sem node_modules/.next):"
find . -maxdepth 3 -not -path './node_modules*' -not -path './.next*' -not -path './.git/*' | sort | head -120
echo "== arquivos da home e layout:"
ls -la app/page.* app/layout.* src/app/page.* src/app/layout.* 2>/dev/null
echo "== estilos globais:"; ls -la app/globals.* src/app/globals.* tailwind.config.* postcss.config.* 2>/dev/null
echo "== NOMES das variáveis de ambiente (sem valores):"
for f in .env .env.local .env.production; do [ -f "$f" ] && { echo "-- $f"; sed -E 's/=.*/=<oculto>/' "$f" | grep -v '^#' | head -40; }; done
echo "== processos / proxy:"
command -v pm2 >/dev/null && pm2 jlist 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{JSON.parse(s).forEach(p=>console.log(p.name,p.pm2_env.status,p.pm2_env.pm_cwd))}catch(e){}})'
systemctl list-units --type=service 2>/dev/null | grep -iE 'hub|next|node' | head
grep -rl "hub.equatec-eng.com.br" /etc/nginx /etc/caddy /etc/apache2 2>/dev/null | head
