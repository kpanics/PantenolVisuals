# PantenolVisuals

Красивый лаунчер Minecraft для Linux: вкладки **Главная / Играть / Моды / Магазин / Настройки**, экран входа и регистрации, выбор релизов и аккаунтов, магазин ресурспаков и конфигов блогеров/админов.

## Установка одной командой

```bash
curl -sL https://raw.githubusercontent.com/kpanics/PantenolVisuals/arena/bc63aeac-pantenolvisuals/install.sh | bash
```

Или через git:

```bash
git clone -b arena/bc63aeac-pantenolvisuals https://github.com/kpanics/PantenolVisuals.git
cd PantenolVisuals
./launch.sh
```

`launch.sh` при каждом запуске автоматически подтягивает свежую версию с GitHub — обновления применяются сами.

## Стек

Чистый HTML/CSS/JS (без зависимостей) — легко оборачивается в десктоп-приложение через Tauri/Electron.
