<div align="center">

<img src="assets/logo.png" width="120" alt="PantenolVisuals logo">

# PantenolVisuals

**Красивый лаунчер Minecraft для Linux — своё окно, своя музыка, свои моды.**

[![Версия](https://img.shields.io/badge/версия-2.8.0-34d399?style=flat-square)](https://github.com/kpanics/PantenolVisuals)
[![Платформа](https://img.shields.io/badge/Linux-Electron-a78bfa?style=flat-square)](https://www.electronjs.org/)
[![Minecraft](https://img.shields.io/badge/Minecraft-Fabric%201.21.11→26.3-fbbf24?style=flat-square)](https://fabricmc.net/)
[![License](https://img.shields.io/badge/GPL--3.0-license-38bdf8?style=flat-square)](LICENSE)

<img src="assets/bg-hero.jpg" width="100%" alt="">

</div>

## 🚀 Установка одной командой

**Linux:**
```bash
curl -sL https://raw.githubusercontent.com/kpanics/PantenolVisuals/main/install.sh | bash
```

**Windows** (PowerShell):
```powershell
irm https://raw.githubusercontent.com/kpanics/PantenolVisuals/main/install.ps1 | iex
```

Установщик сам скачает лаунчер, **встроенный движок Electron** (~95 МБ, один раз — как у Discord) и добавит ярлык (меню приложений / рабочий стол). Дальше обновления подтягиваются с GitHub автоматически при каждом запуске.

## ✨ Возможности

| | |
|---|---|
| 🏠 **Главная** | выбор релиза **Fabric 1.21.11 → 26.3**, статистика, новости сети |
| ▶ **Играть** | анимированный запуск, быстрые серверы с пингом, карточки версий |
| 🌐 **Серверы** | аккаунт Pantenol ID работает онлайн на всех серверах сети, добавление своих серверов |
| 🧩 **Моды** | живой каталог **Modrinth** (только Fabric под выбранную версию), установка `.jar` прямо в папку `mods` выбранной версии |
| 🛒 **Магазин** | ресурспаки, конфиги блогеров и админов, **бесплатные кастомные 3D-модели** |
| 🎵 **Плеер** | встроенный **SoundCloud**: C418, Monstercat, свои ссылки, плейлист, громкость |
| 👤 **Pantenol ID** | вход и регистрация на отдельных страницах, личный кабинет с покупками |
| 🛡 **Админ-панель** | для владельца (KPanic): загрузка/удаление ресурспаков, автозагрузка паков игрокам, ранги (Игрок/Медиа/Модератор/Админ), настройки сети |
| ⬇ **Настоящий Minecraft** | ванильные релизы качаются с официальных серверов Mojang (клиент, библиотеки, ассеты, нативы) и запускаются через Java с выбранным объёмом RAM |
| 🔄 **Автообновление** | приложение само проверяет GitHub каждые 30 минут, скачивает новую версию в фоне и предлагает перезапуск — как Discord |

## 🖥 Приложение, а не вкладка браузера

Окно без рамки ОС со своими кнопками «свернуть / развернуть / закрыть», без системного меню и контекстных меню браузера. Данные (аккаунты, покупки, ранги, паки) хранятся в файле `~/.config/PantenolVisuals/pv-db.json` — никакого localStorage.

## 📦 Структура

```
├── index.html        # интерфейс лаунчера
├── css/styles.css    # дизайн-система
├── js/app.js         # логика (модули ES)
├── js/player.js      # SoundCloud-плеер
├── electron/         # нативное окно + IPC (моды, база данных)
├── assets/           # сгенерированная графика
├── install.sh        # установка Linux
├── install.ps1       # установка Windows
├── launch.sh         # запуск + автообновление (Linux)
└── launch.bat        # запуск + автообновление (Windows)
```

<div align="center">
<sub>Сделано с любовью к кубам. Не аффилировано с Mojang AB.</sub>
</div>
