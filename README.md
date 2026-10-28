# Mobile Prototype Stage v2

`Mobile Prototype Stage v2` создаёт или адаптирует кликабельные мобильные прототипы. На телефоне пользователь видит интерфейс приложения, на компьютере — сцену с настройками сценариев и режим презентации с мокапом устройства. Внутри мокапа работает сам прототип: можно нажимать кнопки, вводить данные и проходить пользовательский сценарий.

## Как подготовить проект

1. Откройте в Codex проект, в котором нужно собрать или доработать прототип.
2. Опишите сервис, основной пользовательский сценарий и состояния, которые нужно показать: например, загрузку, успешную оплату или ошибку.
3. Приложите доступные макеты, референсы и материалы продукта. Если интерфейс уже реализован, укажите нужные экраны.
4. Укажите платформу и размер сцены, если они отличаются от начальных настроек. По умолчанию используются iOS, светлая тема и размер 393 × 852 px.

Запустите навык:

```text
Используй $mobile-prototype-stage-v2 для этого проекта.
Собери кликабельный прототип оформления заказа с состояниями:
корзина, оплата, успех и ошибка.
```

Для макета в Figma:

```text
Собери прототип по макету <ссылка на макет в Figma>.
Для оболочки
используй $mobile-prototype-stage-v2.
```

## Что будет на выходе

В узком окне прототип занимает доступную ширину, а сверху всегда есть кнопка «Презентация». В презентации доступны «К сцене», «Настройки» и «Превью»; настройки открываются выдвижной панелью. Руки и 3D-телефон доступны при любой ширине окна.

На компьютере доступны три режима:

- **Сцена** — мобильный интерфейс без корпуса телефона, переключатели сценариев, iOS/Android, светлой/тёмной темы, размера и скругления сцены.
- **Презентация** — живой интерфейс внутри мокапа, фон и панель настройки композиции справа. Доступны три ракурса: «Под наклоном» с касанием правой рукой, «Прямо» с вертикальным телефоном и «В ладони» с третьей рукой и отдельным передним слоем пальцев. Между всеми видами работают плавные переходы. Переключатель «С руками» убирает руки, сохраняя положение живого телефона. Композиция статична.
- **Превью** — презентация со скрытыми настройками. Выйти можно кнопкой «Выйти из превью» или клавишей Esc.

Переходы между режимами сохраняют состояние прототипа, прокрутку и выбранные настройки. Варианты сценариев хранятся отдельно от компонентов интерфейса.

В iPhone-презентации используется присланная GLB-модель, отрисованная через локальный Three.js, с графитовым или серым корпусом. Автор модели — [Pro Animator](https://sketchfab.com/Riju.mandal), [исходная модель](https://sketchfab.com/3d-models/iphone-18-pro-max-high-quality-3d-model-5e40716caa274a789de5b17798ee2e78), лицензия [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Изменены материалы корпуса и размещение; исходная подставка и готовый экран не отображаются.

### Local background folder

Run `python scripts/serve-local.py` from the project folder. Open http://127.0.0.1:8765/skills/mobile-prototype-stage-v2/assets/starter/. The local server reads image files from the sibling `../bg-image` folder. Choose Background → Image to refresh the gallery, or use its Refresh button. PNG, JPEG, WebP, AVIF, GIF and SVG are supported. Gallery removal hides a folder entry for the current page session and never deletes the original file. This folder integration requires the custom local server; a static deployment retains manual file upload.

Background preset behavior (current): five user-provided images are bundled under `backgrounds/presets/`, available on static hosting without the folder endpoint. Preset thumbnails have no delete controls. Uploaded images replace the visible preset gallery while any uploads exist; deleting the last upload restores presets. Local folder refresh updates the preset collection without exposing it during custom upload mode. This supersedes the earlier per-preset deletion behavior.
