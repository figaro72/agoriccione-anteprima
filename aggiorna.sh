#!/usr/bin/env bash
# Rigenera la home statica (index.html) dal tema nuovo "AgoRiccione - nuovo" (Horizon, id 207689384270).
# Scarica la home renderizzata dal negozio in anteprima, la pulisce con build.js. Poi: controllare, commit, push.
set -euo pipefail
cd "$(dirname "$0")"
THEME=207689384270
J=$(mktemp)
curl -fsSL -c "$J" -b "$J" -A 'Mozilla/5.0' -o raw.html "https://agoriccione.myshopify.com/?preview_theme_id=$THEME"
rm -f "$J"
grep -q "\"id\":$THEME" raw.html || { echo "raw.html non è il tema $THEME: controlla l'id" >&2; exit 1; }
node build.js
