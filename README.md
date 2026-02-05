# Yesteryear

---

## Русский

**Yesteryear** — оболочка для ведения коллекции на основе картинок и JSON. Работает полностью локально, не требует сервера. Данные хранятся в `data/data.json`, изображения — в папке `img/`.

### Что это

Инструмент для каталогизации коллекций (модели, игрушки, фото и т.п.): просмотр в виде галереи, редактирование в таблице, инфографика по годам выпуска. Можно экспортировать JSON и подменять им текущий файл данных.

### Возможности

- **Каталог** — галерея карточек с фото, поиск, сортировка, избранное
- **Редактор** — табличное редактирование, добавление фото, копирование/скачивание JSON
- **Инфографика** — таблица «модель × год», столбцовая диаграмма, поповеры и модалки по годам
- Тёмная/светлая тема
- Языки: RU, EN, PT

### Запуск

Откройте `index.html` в браузере или поднимите локальный сервер:

```bash
python3 -m http.server 8000
```

Затем откройте http://localhost:8000

### Формат данных

`data/data.json` — массив объектов:

```json
{
  "name": "Название модели",
  "year": "1966-1974",
  "code": "Y-13",
  "image": "0.jpg",
  "link": "https://..."
}
```

- `year` — год или диапазон (например, `1979-1982`)
- `image` — имя файла в папке `img/`
- `link` — необязательная ссылка

### Обновление данных

1. Редактируйте в режиме «Редактор»
2. Нажмите «Скачать JSON» и сохраните файл
3. Замените `data/data.json` скачанным файлом

Или загрузите свой JSON через «Загрузить JSON» (если доступно).

### Структура проекта

```
├── index.html
├── css/           — стили
├── js/            — скрипты
├── data/          — data.json
├── img/           — изображения
├── push.sh        — пуш в main (macOS/Linux)
└── push.bat       — пуш в main (Windows)
```

---

## English

**Yesteryear** is a shell for managing collections based on images and JSON. It runs entirely locally and requires no server. Data is stored in `data/data.json`, images in the `img/` folder.

### What it is

A tool for cataloging collections (models, toys, photos, etc.): gallery view, table editor, and infographic by production year. You can export JSON and use it to replace the current data file.

### Features

- **Catalog** — card gallery with photos, search, sorting, favorites
- **Editor** — table editing, add photos, copy/download JSON
- **Infographic** — model × year grid, bar chart, popovers and modals by year
- Dark/light theme
- Languages: RU, EN, PT

### Running

Open `index.html` in a browser or start a local server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

### Data format

`data/data.json` is an array of objects:

```json
{
  "name": "Model name",
  "year": "1966-1974",
  "code": "Y-13",
  "image": "0.jpg",
  "link": "https://..."
}
```

- `year` — single year or range (e.g. `1979-1982`)
- `image` — filename in the `img/` folder
- `link` — optional URL

### Updating data

1. Edit in the Editor mode
2. Click "Download JSON" and save the file
3. Replace `data/data.json` with the downloaded file

Or load your own JSON via "Load JSON" (when available).

### Project structure

```
├── index.html
├── css/           — styles
├── js/            — scripts
├── data/          — data.json
├── img/           — images
├── push.sh        — push to main (macOS/Linux)
└── push.bat       — push to main (Windows)
```

---

## Português

**Yesteryear** é uma interface para gerenciar coleções baseadas em imagens e JSON. Funciona totalmente localmente, sem servidor. Os dados ficam em `data/data.json`, as imagens na pasta `img/`.

### O que é

Ferramenta para catalogar coleções (modelos, brinquedos, fotos etc.): visualização em galeria, edição em tabela e infográfico por ano de produção. É possível exportar JSON e usá-lo para substituir o arquivo de dados atual.

### Recursos

- **Catálogo** — galeria de cartões com fotos, busca, ordenação, favoritos
- **Editor** — edição em tabela, adicionar fotos, copiar/baixar JSON
- **Infográfico** — grade modelo × ano, gráfico de barras, popovers e modais por ano
- Tema escuro/claro
- Idiomas: RU, EN, PT

### Execução

Abra `index.html` no navegador ou inicie um servidor local:

```bash
python3 -m http.server 8000
```

Depois acesse http://localhost:8000

### Formato dos dados

`data/data.json` é um array de objetos:

```json
{
  "name": "Nome do modelo",
  "year": "1966-1974",
  "code": "Y-13",
  "image": "0.jpg",
  "link": "https://..."
}
```

- `year` — ano único ou intervalo (ex.: `1979-1982`)
- `image` — nome do arquivo na pasta `img/`
- `link` — URL opcional

### Atualizando os dados

1. Edite no modo Editor
2. Clique em "Baixar JSON" e salve o arquivo
3. Substitua `data/data.json` pelo arquivo baixado

Ou carregue seu JSON via "Carregar JSON" (quando disponível).

### Estrutura do projeto

```
├── index.html
├── css/           — estilos
├── js/            — scripts
├── data/          — data.json
├── img/           — imagens
├── push.sh        — push para main (macOS/Linux)
└── push.bat       — push para main (Windows)
```
