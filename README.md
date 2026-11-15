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

## Это приложение, а не вкладка браузера

`launch.sh` открывает лаунчер в **режиме приложения** (`--app`): отдельное окно без вкладок, адресной строки и закладок браузера, со своей иконкой в панели задач. `install.sh` дополнительно добавляет лаунчер в **меню приложений Linux** (категория «Игры»).

Для полностью нативного окна есть опциональный режим Electron:

```bash
cd ~/PantenolVisuals && npm install && npm start
```

## Стек

Чистый HTML/CSS/JS (без зависимостей) + опциональная обёртка Electron.
