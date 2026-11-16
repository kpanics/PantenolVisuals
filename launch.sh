#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  PantenolVisuals Launcher — запуск как отдельного приложения
#
#  Как Discord: внутри свой встроенный движок (Electron/Chromium),
#  внешний браузер НЕ нужен. При первом запуске скрипт сам скачает
#  рантайм Electron (~90 МБ, один раз) — дальше запуск мгновенный.
# ═══════════════════════════════════════════════════════════════
cd "$(dirname "$0")"
DIR="$(pwd)"

BRANCH="main"
REPO_ZIP="https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/$BRANCH"

EV="33.2.0"
RT="$DIR/.electron/bin"
RT_URL="https://github.com/electron/electron/releases/download/v$EV/electron-v$EV-linux-x64.zip"

# ── 1. Автообновление файлов лаунчера ──
echo "⟳ PantenolVisuals: проверка обновлений…"
UPDATED=0
if [ -d .git ] && command -v git >/dev/null 2>&1; then
  git config --global --add safe.directory "$DIR" 2>/dev/null || true  # лечит "dubious ownership"
  git remote set-url origin https://github.com/kpanics/PantenolVisuals.git 2>/dev/null || true
  # явный refspec: чинит старые установки, склонированные с --depth 1 -b <ветка>
  if GIT_ERR=$(git fetch origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH" 2>&1); then
    git reset --hard FETCH_HEAD -q 2>/dev/null && { echo "✔ Лаунчер обновлён до последней версии"; UPDATED=1; }
  else
    echo "⚠ git: $(echo "$GIT_ERR" | tail -1)"
  fi
fi
if [ "$UPDATED" = "0" ] && command -v curl >/dev/null 2>&1; then
  echo "⚠ git-обновление не вышло — пробую через zip…"
  TMP=$(mktemp -d)
  if curl -sL --max-time 25 "$REPO_ZIP" -o "$TMP/pv.zip" && [ -s "$TMP/pv.zip" ]; then
    unzip -qo "$TMP/pv.zip" -d "$TMP" 2>/dev/null || true
    SRC=$(find "$TMP" -maxdepth 1 -type d -name "PantenolVisuals-*" 2>/dev/null | head -1)
    if [ -n "$SRC" ] && [ -f "$SRC/index.html" ]; then
      cp -rf "$SRC/index.html" "$SRC/css" "$SRC/js" "$SRC/assets" "$SRC/electron" "$SRC/package.json" ./ 2>/dev/null
      echo "✔ Лаунчер обновлён до последней версии"
    fi
  else
    echo "⚠ Нет сети — запускаю текущую версию"
  fi
  rm -rf "$TMP"
fi

# ── 2. Рантайм Electron: скачивается один раз ──
if [ ! -x "$RT/electron" ]; then
  if command -v curl >/dev/null 2>&1 && command -v unzip >/dev/null 2>&1; then
    echo "⬇ Первая настройка: скачиваю встроенный движок приложения (~90 МБ, один раз)…"
    TMPD=$(mktemp -d)
    if curl -L --retry 2 -o "$TMPD/electron.zip" "$RT_URL" && \
       unzip -qo "$TMPD/electron.zip" -d "$TMPD/bin"; then
      mkdir -p "$DIR/.electron"
      rm -rf "$RT.tmp"
      mv "$TMPD/bin" "$RT.tmp" && mv "$RT.tmp" "$RT"
      chmod +x "$RT/electron" "$RT/chrome-sandbox" 2>/dev/null
      echo "✔ Движок установлен"
    else
      echo "⚠ Не удалось скачать движок (проверьте интернет)"
    fi
    rm -rf "$TMPD"
  else
    echo "⚠ Для первой установки нужны curl и unzip"
  fi
fi

# ── 3. Запуск ──
if [ -x "$RT/electron" ]; then
  echo "▶ Запуск PantenolVisuals (нативное окно)"
  exec "$RT/electron" "$DIR" --no-sandbox >/dev/null 2>&1 &
  exit 0
fi

# Запасной вариант, если движок скачать не вышло
echo "⚠ Резервный запуск через системный браузер в режиме приложения"
URL="file://$DIR/index.html"
PROFILE="$HOME/.pantenolvisuals/profile"
mkdir -p "$PROFILE"
for B in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge vivaldi-stable yandex-browser yandex-browser-stable; do
  if command -v "$B" >/dev/null 2>&1; then
    exec "$B" --app="$URL" --class=PantenolVisuals --user-data-dir="$PROFILE" \
      --no-first-run --no-default-browser-check >/dev/null 2>&1 &
    exit 0
  fi
done
xdg-open "$URL" 2>/dev/null || echo "Откройте в браузере: $URL"
