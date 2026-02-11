#!/bin/sh
# Replaces furycloud registry tarballs with the default npmjs registry
# in pnpm-lock.yaml so that production builds fetch from the public registry.

LOCKFILE="pnpm-lock.yaml"

if [ ! -f "$LOCKFILE" ]; then
  echo "[fix-lockfile-registry] $LOCKFILE not found, skipping."
  exit 0
fi

echo "[fix-lockfile-registry] Replacing furycloud registry with npmjs in $LOCKFILE..."

sed -i.bak \
  's|https://npm.artifacts.furycloud.io/repository/all/|https://registry.npmjs.org/|g' \
  "$LOCKFILE"

rm -f "${LOCKFILE}.bak"

echo "[fix-lockfile-registry] Done."
