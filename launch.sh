#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  PantenolVisuals Launcher — запуск + автообновление
#  Открывается как ОТДЕЛЬНОЕ ПРИЛОЖЕНИЕ (своё окно, без
#  вкладок и адресной строки браузера, своя иконка в таскбаре)
# ═══════════════════════════════════════════════════════════
cd "$(dirname "$0")"
DIR="$(pwd)"
URL="file://$DIR/index.html"

BRANCH="arena/bc63aeac-pantenolvisuals"
REPO_ZIP="https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/$BRANCH"

# ── 1. Автообновление ──
echo "⟳ PantenolVisuals: проверка обновлений…"
if [ -d .git ] && command -v git >/dev/null 2>&1; then
  git fetch origin "$BRANCH" -q 2>/dev/null && \
  git reset --hard "origin/$BRANCH" -q 2>/dev/null && \
  echo "✔ Лаунчер обновлён до последней версии" || \
  echo "⚠ Обновление пропущено (нет сети), запускаю текущую версию"
elif command -v curl >/dev/null 2>&1; then
  TMP=$(mktemp -d)
  if curl -sL --max-time 20 "$REPO_ZIP" -o "$TMP/pv.zip" && [ -s "$TMP/pv.zip" ]; then
    unzip -qo "$TMP/pv.zip" -d "$TMP" 2>/dev/null || true
    SRC=$(find "$TMP" -maxdepth 1 -type d -name "PantenolVisuals-*" 2>/dev/null | head -1)
    if [ -n "$SRC" ] && [ -f "$SRC/index.html" ]; then
      cp -rf "$SRC/index.html" "$SRC/css" "$SRC/js" "$SRC/assets" "$SRC/launch.sh" ./ 2>/dev/null
      chmod +x ./launch.sh 2>/dev/null
      echo "✔ Лаунчер обновлён до последней версии"
    fi
  else
    echo "⚠ Обновление пропущено (нет сети), запускаю текущую версию"
  fi
  rm -rf "$TMP"
fi

# ── 2. Запуск как приложение ──
PROFILE="$HOME/.pantenolvisuals/profile"
mkdir -p "$PROFILE"

# Chromium-подобные: настоящий app-режим (окно без интерфейса браузера)
for B in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge microsoft-edge-stable vivaldi-stable yandex-browser yandex-browser-stable; do
  if command -v "$B" >/dev/null 2>&1; then
    echo "▶ Запуск в режиме приложения ($B)"
    exec "$B" --app="$URL" --class=PantenolVisuals --user-data-dir="$PROFILE" \
      --no-first-run --no-default-browser-check --disable-session-crashed-bubble \
      >/dev/null 2>&1 &
    exit 0
  fi
done

# Firefox — отдельное окно с профилем лаунчера
if command -v firefox >/dev/null 2>&1; then
  echo "▶ Запуск через Firefox"
  firefox --profile "$PROFILE" --new-window "$URL" >/dev/null 2>&1 &
  exit 0
fi

# Совсем нет браузеров — системный обработчик
echo "▶ Запуск через системный браузер"
xdg-open "$URL" 2>/dev/null || echo "Откройте в браузере: $URL"
