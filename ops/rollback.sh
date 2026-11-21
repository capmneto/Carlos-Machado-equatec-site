#!/usr/bin/env bash
# Volta o Hub ao estado do backup. Exige confirmação digitada.
# Uso: HUB_DIR=/caminho/do/hub bash ops/rollback.sh [pasta-do-backup]   (padrão: o último)
set -euo pipefail
: "${HUB_DIR:?Informe HUB_DIR}"
BK_ROOT="${BK_ROOT:-$HOME/hub-backups}"
SRC="${1:-$(cat "$BK_ROOT/LATEST")}"
[ -f "$SRC/hub-files.tar.gz" ] || { echo "Backup inválido: $SRC"; exit 1; }
( cd "$SRC" && sha256sum -c SHA256SUMS.txt --quiet ) || { echo "Checksum falhou. Abortando."; exit 1; }
echo "Vai restaurar $HUB_DIR a partir de $SRC"
read -r -p "Digite RESTAURAR para continuar: " ok; [ "$ok" = "RESTAURAR" ] || exit 1
TS="$(date +%Y%m%d-%H%M%S)"
mv "$HUB_DIR" "${HUB_DIR}.falhou-$TS"                  # preserva o estado atual, não apaga
tar -C "$(dirname "$HUB_DIR")" -xzf "$SRC/hub-files.tar.gz"
cd "$HUB_DIR"
[ -d "${HUB_DIR}.falhou-$TS/node_modules" ] && mv "${HUB_DIR}.falhou-$TS/node_modules" ./node_modules
[ -d "${HUB_DIR}.falhou-$TS/.git" ] && mv "${HUB_DIR}.falhou-$TS/.git" ./.git
echo "Reinstale/reconstrua conforme o projeto (ex.: npm ci && npm run build) e reinicie (ex.: pm2 restart <app>)."
echo "Estado anterior preservado em ${HUB_DIR}.falhou-$TS"
