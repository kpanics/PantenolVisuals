#!/bin/bash
# ═══════════════════════════════════════════════════
#  PantenolVisuals Launcher — запуск + автообновление
#  При каждом запуске подтягивает свежую версию с GitHub
# ═══════════════════════════════════════════════════
cd "$(dirname "$0")"

BRANCH="arena/bc63aeac-pantenolvisuals"
REPO_ZIP="https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/$BRANCH"

echo "⟳ PantenolVisuals: проверка обновлений…"

if [ -d .git ] && command -v git >/dev/null 2>&1; then
  # Установлено через git — просто подтягиваем изменения
  git fetch origin "$BRANCH" -q 2>/dev/null && \
  git reset --hard "origin/$BRANCH" -q 2>/dev/null && \
  echo "✔ Лаунчер обновлён до последней версии" || \
  echo "⚠ Обновление пропущено (нет сети), запускаю текущую версию"
elif command -v curl >/dev/null 2>&1; then
  # Установлено из zip — качаем свежий архив с GitHub
  TMP=$(mktemp -d)
  if curl -sL --max-time 20 "$REPO_ZIP" -o "$TMP/pv.zip" && [ -s "$TMP/pv.zip" ]; then
    unzip -qo "$TMP/pv.zip" -d "$TMP" 2>/dev/null || true
    SRC=$(find "$TMP" -maxdepth 1 -type d -name "PantenolVisuals-*" 2>/dev/null | head -1)
    if [ -n "$SRC" ] && [ -f "$SRC/index.html" ]; then
      cp -rf "$SRC/index.html" "$SRC/css" "$SRC/js" "$SRC/assets" ./ 2>/dev/null
      echo "✔ Лаунчер обновлён до последней версии"
    fi
  else
    echo "⚠ Обновление пропущено (нет сети), запускаю текущую версию"
  fi
  rm -rf "$TMP"
fi

# Открываем лаунчер
xdg-open index.html 2>/dev/null || sensible-browser index.html 2>/dev/null || \
  echo "Откройте index.html в любом браузере: file://$(pwd)/index.html"
