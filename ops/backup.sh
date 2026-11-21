#!/usr/bin/env bash
# Backup completo do Hub ANTES de qualquer alteração. Nada é apagado nem modificado.
# Uso: HUB_DIR=/caminho/do/hub bash ops/backup.sh
# O backup contém .env (segredos): fica SOMENTE na VPS, permissão 600. Nunca vai para o git.
set -euo pipefail
: "${HUB_DIR:?Informe HUB_DIR}"
BK_ROOT="${BK_ROOT:-$HOME/hub-backups}"
TS="$(date +%Y%m%d-%H%M%S)"
DEST="$BK_ROOT/hub-$TS"
mkdir -p "$DEST"; chmod 700 "$BK_ROOT" "$DEST"

echo "[1/5] Código + .env + build (exceto node_modules)"
tar -C "$(dirname "$HUB_DIR")" --exclude='node_modules' --exclude='.git' \
    -czf "$DEST/hub-files.tar.gz" "$(basename "$HUB_DIR")"

echo "[2/5] Histórico git (se houver)"
if [ -d "$HUB_DIR/.git" ]; then
  git -C "$HUB_DIR" bundle create "$DEST/hub-git.bundle" --all 2>/dev/null || true
  git -C "$HUB_DIR" rev-parse HEAD > "$DEST/git-head.txt" 2>/dev/null || true
  git -C "$HUB_DIR" status --short > "$DEST/git-status.txt" 2>/dev/null || true
  git -C "$HUB_DIR" tag -f "pre-redesign-$TS" 2>/dev/null || true
fi

echo "[2b/5] Dependências (travadas por lockfile, não copiadas)"
ls "$HUB_DIR"/package-lock.json "$HUB_DIR"/pnpm-lock.yaml "$HUB_DIR"/yarn.lock 2>/dev/null || echo "ATENÇÃO: sem lockfile"

echo "[3/5] Configuração do servidor"
( command -v pm2 >/dev/null && pm2 save >/dev/null 2>&1 && cp "$HOME/.pm2/dump.pm2" "$DEST/pm2-dump.pm2" ) || true
for d in /etc/nginx/sites-available /etc/nginx/conf.d /etc/caddy; do
  [ -d "$d" ] && tar -czf "$DEST/$(basename "$d")-conf.tar.gz" "$d" 2>/dev/null || true
done

echo "[4/5] Checksums e metadados"
echo "HUB_DIR=$HUB_DIR" > "$DEST/META.txt"; date -Is >> "$DEST/META.txt"
( cd "$DEST" && sha256sum * > SHA256SUMS.txt )
chmod 600 "$DEST"/*

echo "[5/5] Teste de leitura do backup"
tar -tzf "$DEST/hub-files.tar.gz" >/dev/null && echo "OK: $DEST"
echo "$DEST" > "$BK_ROOT/LATEST"
