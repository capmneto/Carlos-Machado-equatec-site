#!/usr/bin/env bash
# Backup completo do Hub ANTES de qualquer alteração. Não altera nada no Hub, no git nem no pm2.
# Uso: HUB_DIR=/caminho/do/hub bash ops/backup.sh      (rode com o MESMO usuário que roda o Hub)
# O backup contém .env (segredos): fica SOMENTE na VPS, permissão 600. Nunca vai para o git.
set -euo pipefail
: "${HUB_DIR:?Informe HUB_DIR}"
HUB_DIR="$(readlink -f "$HUB_DIR")"            # resolve symlink (ex.: /srv/hub -> releases/v3)
[ -d "$HUB_DIR" ] || { echo "HUB_DIR inválido: $HUB_DIR"; exit 1; }
BK_ROOT="${BK_ROOT:-$HOME/hub-backups}"
TS="$(date +%Y%m%d-%H%M%S)"
DEST="$BK_ROOT/hub-$TS"
mkdir -p "$DEST"; chmod 700 "$BK_ROOT" "$DEST"
fail(){ echo "FALHOU: $1"; rm -f "$BK_ROOT/LATEST.novo"; exit 1; }

echo "[1/5] Código + .env + build (exceto node_modules e .git)"
tar -C "$(dirname "$HUB_DIR")" --exclude='node_modules' --exclude='.git' \
    -czf "$DEST/hub-files.tar.gz" "$(basename "$HUB_DIR")" || fail "tar"

echo "[2/5] Histórico git (se houver), sem alterar o repositório"
if [ -d "$HUB_DIR/.git" ]; then
  git -C "$HUB_DIR" bundle create "$DEST/hub-git.bundle" --all >/dev/null 2>&1 || fail "git bundle"
  git -C "$HUB_DIR" rev-parse HEAD > "$DEST/git-head.txt" || fail "git rev-parse"
  git -C "$HUB_DIR" status --short > "$DEST/git-status.txt" || true
fi
ls "$HUB_DIR"/package-lock.json "$HUB_DIR"/pnpm-lock.yaml "$HUB_DIR"/yarn.lock 2>/dev/null || echo "ATENÇÃO: sem lockfile"

echo "[3/5] Configuração do servidor (cópia, sem 'pm2 save')"
[ -f "$HOME/.pm2/dump.pm2" ] && cp "$HOME/.pm2/dump.pm2" "$DEST/pm2-dump.pm2" || true
command -v pm2 >/dev/null && pm2 jlist > "$DEST/pm2-jlist.json" 2>/dev/null || true
for d in /etc/nginx/sites-available /etc/nginx/conf.d /etc/caddy; do
  [ -d "$d" ] && tar -czf "$DEST/$(echo "$d" | tr / _)-conf.tar.gz" "$d" 2>/dev/null || true
done

echo "[4/5] Metadados e checksums"
{ echo "HUB_DIR=$HUB_DIR"; echo "HUB_BASENAME=$(basename "$HUB_DIR")"; echo "USER=$(id -un)"; echo "HOME=$HOME"; date -Is; } > "$DEST/META.txt"
( cd "$DEST" && sha256sum -- * > SHA256SUMS.txt )
chmod 600 "$DEST"/*

echo "[5/5] Verificação do backup"
tar -tzf "$DEST/hub-files.tar.gz" >/dev/null || fail "tar ilegível"
( cd "$DEST" && sha256sum -c SHA256SUMS.txt --quiet ) || fail "checksum"
echo "$DEST" > "$BK_ROOT/LATEST"
echo "OK: $DEST"
