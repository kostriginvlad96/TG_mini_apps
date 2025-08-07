# 🚀 Настройка и запуск проекта "БАБКИН ВНУК"

## 📋 Предварительные требования

- Node.js 18+ 
- npm или yarn
- Git
- Telegram Bot Token (получить у @BotFather)
- Telegram Payment Token (для платежей)

## 🔧 Установка и настройка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd BV_mini_app_TG
```

### 2. Настройка Frontend

```bash
cd frontend
npm install
```

Создайте файл `.env` в папке `frontend`:

```env
VITE_API_URL=http://localhost:3001
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 3. Настройка Backend

```bash
cd ../backend
npm install
```

Создайте файл `.env` в папке `backend`:

```env
# Настройки сервера
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# База данных (для разработки используется SQLite)
DATABASE_URL=sqlite://./database.sqlite

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_PAYMENT_TOKEN=your_telegram_payment_token_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Безопасность
CORS_ORIGIN=http://localhost:3000

# Логирование
LOG_LEVEL=info
```

### 4. Настройка базы данных

```bash
cd backend
npm run migrate
npm run seed
```

## 🚀 Запуск приложения

### Разработка

1. **Запуск Backend:**
```bash
cd backend
npm run dev
```
Сервер будет доступен по адресу: http://localhost:3001

2. **Запуск Frontend:**
```bash
cd frontend
npm run dev
```
Приложение будет доступно по адресу: http://localhost:3000

### Production

1. **Сборка Frontend:**
```bash
cd frontend
npm run build
```

2. **Запуск Backend:**
```bash
cd backend
npm start
```

## 🔑 Получение Telegram токенов

### 1. Создание бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен

### 2. Настройка платежей (опционально)

1. Отправьте @BotFather команду `/mybots`
2. Выберите вашего бота
3. Перейдите в "Payments"
4. Выберите платежного провайдера
5. Получите Payment Token

## 📱 Настройка Telegram Mini App

### 1. Создание Mini App

1. Отправьте @BotFather команду `/newapp`
2. Выберите вашего бота
3. Укажите название и описание
4. Получите ссылку на Mini App

### 2. Настройка Webhook

После деплоя backend, установите webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

## 🗄 База данных

### SQLite (разработка)

База данных автоматически создается в файле `backend/database.sqlite`

### PostgreSQL (production)

1. Создайте базу данных PostgreSQL
2. Обновите `DATABASE_URL` в `.env`
3. Запустите миграции:
```bash
npm run migrate
npm run seed
```

## 🔒 Безопасность

### Переменные окружения

- `JWT_SECRET` - используйте длинную случайную строку
- `TELEGRAM_BOT_TOKEN` - держите в секрете
- `TELEGRAM_PAYMENT_TOKEN` - для обработки платежей

### HTTPS

В production обязательно используйте HTTPS для всех соединений.

## 📊 Мониторинг

### Логи

Backend логирует все запросы и ошибки в консоль.

### Health Check

Проверьте статус API:
```bash
curl http://localhost:3001/health
```

## 🧪 Тестирование

### Frontend тесты

```bash
cd frontend
npm run test
```

### Backend тесты

```bash
cd backend
npm test
```

## 🚀 Деплой

### Frontend (Vercel)

1. Подключите репозиторий к Vercel
2. Укажите папку `frontend`
3. Настройте переменные окружения
4. Деплой произойдет автоматически

### Backend (Railway/Render)

1. Подключите репозиторий к Railway/Render
2. Укажите папку `backend`
3. Настройте переменные окружения
4. Укажите команду запуска: `npm start`

### База данных (Neon/Supabase)

1. Создайте PostgreSQL базу данных
2. Обновите `DATABASE_URL`
3. Запустите миграции

## 🔧 Устранение неполадок

### Проблемы с подключением к базе данных

1. Проверьте `DATABASE_URL` в `.env`
2. Убедитесь, что база данных запущена
3. Проверьте права доступа

### Проблемы с Telegram API

1. Проверьте правильность `TELEGRAM_BOT_TOKEN`
2. Убедитесь, что бот не заблокирован
3. Проверьте webhook URL

### Проблемы с CORS

1. Проверьте `CORS_ORIGIN` в backend `.env`
2. Убедитесь, что frontend URL правильный

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в консоли
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус API: `http://localhost:3001/health`
4. Обратитесь к документации или создайте issue

## 🎯 Следующие шаги

После успешного запуска:

1. Настройте Telegram Mini App в @BotFather
2. Протестируйте все функции
3. Настройте мониторинг и логирование
4. Подготовьте к production деплою
5. Настройте CI/CD pipeline

---

**Удачной разработки! 🚀**

## 📋 Подробная инструкция по настройке Cursor + Git

### 1. Проверка установки Git

Сначала убедитесь, что Git правильно установлен:

```bash
git --version
```

Если Git не найден, скачайте его с [git-scm.com](https://git-scm.com/)

### 2. Настройка Git в Cursor

Cursor имеет встроенную поддержку Git. Вот как настроить интеграцию:

#### Шаг 1: Откройте Cursor
- Запустите Cursor
- Убедитесь, что у вас есть аккаунт и вы авторизованы

#### Шаг 2: Настройте Git конфигурацию
Откройте терминал в Cursor (Ctrl+` или View → Terminal) и выполните:

```bash
<code_block_to_apply_changes_from>
```

### 3. Клонирование репозитория в Cursor

#### Способ 1: Через интерфейс Cursor (рекомендуется)

1. **Откройте Cursor**
2. **Нажмите Ctrl+Shift+P** (или Cmd+Shift+P на Mac) для открытия командной палитры
3. **Введите "Git: Clone"** и выберите эту команду
4. **Вставьте URL вашего репозитория**, например:
   ```
   https://github.com/username/BV_mini_app_TG.git
   ```
   или для SSH:
   ```
   git@github.com:username/BV_mini_app_TG.git
   ```
5. **Выберите папку** для клонирования
6. **Дождитесь завершения** клонирования

#### Способ 2: Через терминал в Cursor

1. **Откройте терминал** в Cursor (Ctrl+`)
2. **Перейдите в нужную папку**:
   ```bash
   cd C:\Users\Vladislav\Documents\Projects
   ```
3. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/username/BV_mini_app_TG.git
   ```
4. **Откройте проект** в Cursor:
   - File → Open Folder
   - Выберите папку `BV_mini_app_TG`

### 4. Настройка SSH ключей (для приватных репозиториев)

Если ваш репозиторий приватный, настройте SSH:

#### Генерация SSH ключа:
```bash
ssh-keygen -t ed25519 -C "ваш.email@example.com"
```

#### Добавление ключа в SSH агент:
```bash
# Запуск SSH агента
eval "$(ssh-agent -s)"

# Добавление ключа
ssh-add ~/.ssh/id_ed25519
```

#### Копирование публичного ключа:
```bash
# Windows
cat ~/.ssh/id_ed25519.pub | clip

# Или откройте файл и скопируйте содержимое
notepad ~/.ssh/id_ed25519.pub
```

#### Добавление ключа в GitHub/GitLab:
1. Перейдите в настройки аккаунта
2. SSH and GPG keys → New SSH key
3. Вставьте скопированный ключ

### 5. Работа с Git в Cursor

#### Основные Git операции через интерфейс:

1. **Source Control панель** (Ctrl+Shift+G):
   - Просмотр изменений
   - Stage/Unstage файлов
   - Commit изменений
   - Push/Pull

2. **Горячие клавиши**:
   - `Ctrl+Shift+G` - открыть Source Control
   - `Ctrl+Enter` - commit (после ввода сообщения)
   - `Ctrl+Shift+P` → "Git: Push" - отправить изменения
   - `Ctrl+Shift+P` → "Git: Pull" - получить изменения

#### Работа через терминал:
```bash
# Проверка статуса
git status

# Добавление файлов
git add .

# Commit
git commit -m "Описание изменений"

# Push
git push origin main

# Pull
git pull origin main
```

### 6. Настройка .gitignore

Убедитесь, что у вас есть файл `.gitignore` в корне проекта. Создайте его, если отсутствует:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# Database
*.sqlite
*.db

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 7. Первоначальная настройка проекта

После клонирования выполните настройку согласно вашему `SETUP.md`:

```bash
# Установка зависимостей frontend
cd frontend
npm install

# Установка зависимостей backend
cd ../backend
npm install

# Создание .env файлов (согласно инструкции в SETUP.md)
# Настройка базы данных
npm run migrate
npm run seed
```

### 8. Полезные расширения для Git в Cursor

Cursor уже включает много Git функциональности, но можно добавить:

1. **GitLens** - расширенная информация о Git
2. **Git Graph** - визуализация истории Git
3. **Git History** - просмотр истории файлов

### 9. Проверка настройки

После завершения настройки проверьте:

```bash
# Проверка Git статуса
git status

# Проверка удаленного репозитория
git remote -v

# Проверка веток
git branch -a
```

### 10. Первый коммит и push

```bash
# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: project setup"

# Push в удаленный репозиторий
git push -u origin main
```

## 🎯 Следующие шаги

После успешного запуска:

1. Настройте Telegram Mini App в @BotFather
2. Протестируйте все функции
3. Настройте мониторинг и логирование
4. Подготовьте к production деплою
5. Настройте CI/CD pipeline

---

**Удачной разработки! 🚀**
