#!/bin/bash
# ═══════════════════════════════════════════════════════
#  PantenolVisuals Launcher — установка одной командой:
#  curl -sL https://raw.githubusercontent.com/kpanics/PantenolVisuals/arena/bc63aeac-pantenolvisuals/install.sh | bash
#
#  Что делает:
#   · скачивает лаунчер и встроенный движок (Electron ~90 МБ)
#   · лаунчер = отдельное приложение, как Discord. Браузер НЕ нужен
#   · добавляет ярлык в меню приложений Linux
#   · обновления подтягиваются с GitHub при каждом запуске
# ═══════════════════════════════════════════════════════
set -e

REPO="https://github.com/kpanics/PantenolVisuals.git"
BRANCH="arena/bc63aeac-pantenolvisuals"
DEST="$HOME/PantenolVisuals"
EV="33.2.0"
RT_URL="https://github.com/electron/electron/releases/download/v$EV/electron-v$EV-linux-x64.zip"

echo "╔═══════════════════════════════════════╗"
echo "║   PantenolVisuals · установка v2.6    ║"
echo "╚═══════════════════════════════════════╝"

# ── 1. Файлы лаунчера ──
if command -v git >/dev/null 2>&1; then
  if [ -d "$DEST/.git" ]; then
    echo "⟳ Найдена установка — обновляю…"
    git -C "$DEST" remote set-url origin "$REPO" 2>/dev/null || true
    # явный refspec лечит старые single-branch клоны
    git -C "$DEST" fetch origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH" -q
    git -C "$DEST" reset --hard FETCH_HEAD -q
  else
    echo "⟳ Скачиваю лаунчер…"
    git clone -q --depth 1 -b "$BRANCH" "$REPO" "$DEST"
  fi
else
  echo "⟳ git не найден, скачиваю zip-архив…"
  mkdir -p "$DEST"
  curl -sL "https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/$BRANCH" -o /tmp/pv.zip
  unzip -qo /tmp/pv.zip -d /tmp
  SRC=$(find /tmp -maxdepth 1 -type d -name "PantenolVisuals-*" | head -1)
  cp -rf "$SRC"/. "$DEST/"
  rm -rf /tmp/pv.zip "$SRC"
fi
chmod +x "$DEST/launch.sh"

# ── 2. Встроенный движок Electron (один раз, как у Discord) ──
if [ ! -x "$DEST/.electron/bin/electron" ]; then
  echo "⬇ Скачиваю встроенный движок приложения (~90 МБ, один раз)…"
  TMPD=$(mktemp -d)
  if curl -L --retry 2 -o "$TMPD/electron.zip" "$RT_URL" && \
     unzip -qo "$TMPD/electron.zip" -d "$TMPD/bin"; then
    mkdir -p "$DEST/.electron"
    mv "$TMPD/bin" "$DEST/.electron/bin"
    chmod +x "$DEST/.electron/bin/electron"
    echo "✔ Движок установлен"
  else
    echo "⚠ Движок не скачался — он докачается при первом запуске launch.sh"
  fi
  rm -rf "$TMPD"
else
  echo "✔ Движок уже на месте"
fi

# ── 3. Ярлык в меню приложений Linux ──
APPS="$HOME/.local/share/applications"
ICONS="$HOME/.local/share/icons"
mkdir -p "$APPS" "$ICONS"
cp "$DEST/assets/logo.png" "$ICONS/pantenolvisuals.png"
cat > "$APPS/pantenolvisuals.desktop" << DESKTOP
[Desktop Entry]
Name=PantenolVisuals
Comment=Minecraft Launcher
Exec=$DEST/launch.sh
Icon=pantenolvisuals
Terminal=false
Type=Application
Categories=Game;
StartupWMClass=pantenolvisuals
DESKTOP
update-desktop-database "$APPS" 2>/dev/null || true
echo "✔ Ярлык добавлен в меню приложений (категория «Игры»)"

echo ""
echo "✔ Готово! Лаунчер установлен: $DEST"
echo "  Запуск — из меню приложений, как любая программа,"
echo "  или командой:  $DEST/launch.sh"
echo ""

"$DEST/launch.sh"
