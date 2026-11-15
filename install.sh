#!/bin/bash
# ═══════════════════════════════════════════════════════
#  PantenolVisuals Launcher — установка одной командой:
#  curl -sL https://raw.githubusercontent.com/kpanics/PantenolVisuals/arena/bc63aeac-pantenolvisuals/install.sh | bash
#
#  После установки лаунчер:
#   · открывается как ОТДЕЛЬНОЕ ПРИЛОЖЕНИЕ (своё окно)
#   · появляется в меню приложений Linux с иконкой
#   · обновляется автоматически при каждом запуске
# ═══════════════════════════════════════════════════════
set -e

REPO="https://github.com/kpanics/PantenolVisuals.git"
BRANCH="arena/bc63aeac-pantenolvisuals"
DEST="$HOME/PantenolVisuals"

echo "╔═══════════════════════════════════════╗"
echo "║   PantenolVisuals · установка v2.4    ║"
echo "╚═══════════════════════════════════════╝"

if command -v git >/dev/null 2>&1; then
  if [ -d "$DEST/.git" ]; then
    echo "⟳ Найдена установка — обновляю…"
    git -C "$DEST" fetch origin "$BRANCH" -q
    git -C "$DEST" reset --hard "origin/$BRANCH" -q
  else
    echo "⟳ Скачиваю лаунчер…"
    git clone -q --depth 1 -b "$BRANCH" "$REPO" "$DEST"
  fi
elif command -v curl >/dev/null 2>&1; then
  echo "⟳ git не найден, скачиваю zip-архив…"
  mkdir -p "$DEST"
  curl -sL "https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/$BRANCH" -o /tmp/pv.zip
  unzip -qo /tmp/pv.zip -d /tmp
  SRC=$(find /tmp -maxdepth 1 -type d -name "PantenolVisuals-*" | head -1)
  cp -rf "$SRC/index.html" "$SRC/css" "$SRC/js" "$SRC/assets" "$SRC/launch.sh" "$DEST/"
  rm -rf /tmp/pv.zip "$SRC"
else
  echo "✖ Нужен git или curl для установки"; exit 1
fi

chmod +x "$DEST/launch.sh"

# ── Ярлык в меню приложений Linux ──
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
StartupWMClass=PantenolVisuals
DESKTOP
update-desktop-database "$APPS" 2>/dev/null || true
echo "✔ Ярлык добавлен в меню приложений (категория «Игры»)"

echo ""
echo "✔ Готово! Лаунчер: $DEST"
echo "  Запуск:   из меню приложений или  $DEST/launch.sh"
echo "  Обновления подтягиваются с GitHub при каждом запуске."
echo ""
echo "  Опционально (нативное окно через Electron):"
echo "    cd $DEST && npm install && npm start"
echo ""

"$DEST/launch.sh"
