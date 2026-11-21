#!/usr/bin/env bash
# Volta o Hub ao estado do backup. Troca "quase atômica" e reversível. Exige confirmação digitada.
# Uso: HUB_DIR=/caminho/do/hub bash ops/rollback.sh [pasta-do-backup]   (padrão: o último)
# Rode com o MESMO usuário/HOME do backup.sh (ele grava o usuário em META.txt).
set -euo pipefail
: "${HUB_DIR:?Informe HUB_DIR}"
HUB_DIR="$(readlink -f "$HUB_DIR")"
BK_ROOT="${BK_ROOT:-$HOME/hub-backups}"
SRC="${1:-$(cat "$BK_ROOT/LATEST")}"
[ -f "$SRC/hub-files.tar.gz" ] || { echo "Backup inválido: $SRC"; exit 1; }
( cd "$SRC" && sha256sum -c SHA256SUMS.txt --quiet ) || { echo "Checksum falhou. Abortando."; exit 1; }
BK_DIR="$(sed -n 's/^HUB_DIR=//p' "$SRC/META.txt")"; BK_BASE="$(sed -n 's/^HUB_BASENAME=//p' "$SRC/META.txt")"
[ "$BK_DIR" = "$HUB_DIR" ] || { echo "HUB_DIR atual ($HUB_DIR) difere do backup ($BK_DIR). Abortando."; exit 1; }

PARENT="$(dirname "$HUB_DIR")"; TS="$(date +%Y%m%d-%H%M%S)"
TMP="$PARENT/.restore-$TS"; OLD="${HUB_DIR}.falhou-$TS"
echo "Restaurar $HUB_DIR a partir de $SRC"
echo "AVISO: dados gravados DENTRO de $HUB_DIR depois do backup (uploads, sqlite/json local, logs) ficam só em $OLD."
echo "Pare o processo (ex.: pm2 stop <app>) ANTES de continuar."
read -r -p "Digite RESTAURAR para continuar: " ok; [ "$ok" = "RESTAURAR" ] || exit 1

mkdir -p "$TMP"
trap 'echo "Erro na restauração. Estado atual preservado."; rm -rf "$TMP"' ERR
tar -C "$TMP" -xzf "$SRC/hub-files.tar.gz"                      # 1) extrai ao lado, sem tocar no ativo
[ -d "$TMP/$BK_BASE" ] || { echo "Conteúdo inesperado no backup"; rm -rf "$TMP"; exit 1; }
if [ -f "$SRC/hub-git.bundle" ]; then                           # 2) restaura o .git do backup (não o do estado quebrado)
  git clone -q "$SRC/hub-git.bundle" "$TMP/_g" && mv "$TMP/_g/.git" "$TMP/$BK_BASE/.git"
  git -C "$TMP/$BK_BASE" checkout -q --detach "$(cat "$SRC/git-head.txt")" 2>/dev/null || true
fi
mv "$HUB_DIR" "$OLD"                                            # 3) troca (duas renomeações no mesmo diretório)
trap 'echo "Falha na troca. Desfazendo."; [ -d "$OLD" ] && [ ! -d "$HUB_DIR" ] && mv "$OLD" "$HUB_DIR"' ERR
mv "$TMP/$BK_BASE" "$HUB_DIR"; rm -rf "$TMP"; trap - ERR

echo "Restaurado. Próximos passos: (npm ci && npm run build) conforme o projeto, depois reiniciar (ex.: pm2 restart <app>)."
echo "node_modules NÃO foi copiado do estado quebrado. Configs de nginx/pm2 do backup estão em $SRC (restaure à mão se necessário)."
echo "Estado anterior preservado em $OLD (inclui dados gravados depois do backup)."
