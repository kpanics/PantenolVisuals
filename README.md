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

## Отдельное приложение, как у Discord

`launch.sh` при первом запуске сам скачивает **встроенный движок Electron** (~90 МБ, один раз) — дальше лаунчер работает как полностью самостоятельное приложение со своим окном без рамки браузера, своими кнопками «свернуть / развернуть / закрыть» и иконкой в панели задач. **Firefox/Chrome не нужен.** `install.sh` добавляет лаунчер в **меню приложений** Linux.

## Стек

HTML/CSS/JS-интерфейс + встроенный рантайм Electron (окно без `<webview>`, своя отрисовка через Chromium внутри приложения).
