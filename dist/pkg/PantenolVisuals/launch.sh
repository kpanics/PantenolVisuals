#!/bin/bash
# PantenolVisuals Launcher — запуск под Linux
# Открывает лаунчер в браузере по умолчанию
cd "$(dirname "$0")"
xdg-open index.html 2>/dev/null || sensible-browser index.html 2>/dev/null || echo "Откройте index.html в браузере"
