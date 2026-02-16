# 🚀 Пошаговая установка и настройка

## Шаг 1: Подготовка окружения

### 1.1 Установите необходимое ПО

```bash
# Node.js 18+ (для TMA и Backend)
# Проверка:
node --version  # должна быть v18 или выше

# Python 3.9+ (для CRM бота)
python3 --version

# PostgreSQL 14+
psql --version

# Git
git --version
```

---

## Шаг 2: Настройка TMA (Frontend)

### 2.1 Клонируйте репозиторий

```bash
git clone https://github.com/olegus471-pixel/tma-agile-bot.git
cd tma-agile-bot
```

### 2.2 Установите зависимости

```bash
npm install
```

### 2.3 Установите дополнительные пакеты

```bash
# Telegram Web App SDK
npm install @telegram-apps/sdk-react

# Управление состоянием
npm install zustand
npm install @tanstack/react-query

# Формы и валидация
npm install react-hook-form zod @hookform/resolvers

# Графики
npm install recharts

# UI компоненты (если не установлены)
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge

# Даты
npm install date-fns

# HTTP клиент
npm install axios

# WebSocket
npm install socket.io-client

# TypeScript типы
npm install -D @types/node
```

### 2.4 Создайте .env файл

```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_BOT_USERNAME=@YourCRMBot
EOF
```

### 2.5 Обновите vite.config.ts

Этот файл уже должен существовать, проверьте что он содержит:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

---

## Шаг 3: Настройка Backend API

### 3.1 Создайте директорию backend

```bash
cd ..
mkdir backend-api
cd backend-api
```

### 3.2 Инициализируйте проект

```bash
npm init -y
```

### 3.3 Установите зависимости

```bash
# Core
npm install express cors dotenv

# TypeScript
npm install -D typescript @types/node @types/express @types/cors
npm install -D ts-node nodemon

# Database
npm install pg prisma @prisma/client
# ИЛИ для MongoDB:
# npm install mongoose

# WebSocket
npm install socket.io

# Telegram
npm install node-telegram-bot-api
npm install -D @types/node-telegram-bot-api

# Google Sheets
npm install googleapis

# Валидация
npm install zod

# Логирование
npm install winston
```

### 3.4 Создайте tsconfig.json

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
```

### 3.5 Создайте .env файл

```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_db

# Telegram
BOT_TOKEN=your_bot_token_here
TELEGRAM_SECRET=your_secret_key

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS=./credentials/google-credentials.json
GOOGLE_SHEET_ID=your_google_sheet_id

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key
EOF
```

### 3.6 Обновите package.json

Добавьте скрипты:

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

---

## Шаг 4: Настройка базы данных

### 4.1 Создайте базу данных PostgreSQL

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу
CREATE DATABASE crm_db;

# Создайте пользователя (опционально)
CREATE USER crm_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;

# Выйдите
\q
```

### 4.2 Инициализируйте Prisma (если используете)

```bash
cd backend-api
npx prisma init
```

### 4.3 Обновите schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          Int      @id @default(autoincrement())
  telegramId  BigInt   @unique
  username    String?
  firstName   String?
  lastName    String?
  role        String   @default("manager")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  clients     Client[]
  interactions Interaction[]
}

model Client {
  id          Int      @id @default(autoincrement())
  telegramId  BigInt?
  name        String
  phone       String?
  email       String?
  status      String   @default("new")
  source      String   @default("manual")
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  createdById Int?
  createdBy   User?   @relation(fields: [createdById], references: [id])
  
  interactions Interaction[]
}

model Interaction {
  id        Int      @id @default(autoincrement())
  clientId  Int
  client    Client   @relation(fields: [clientId], references: [id])
  type      String
  content   String
  createdAt DateTime @default(now())
  
  createdById Int?
  createdBy   User?  @relation(fields: [createdById], references: [id])
}
```

### 4.4 Запустите миграцию

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Шаг 5: Настройка CRM бота

### 5.1 Перейдите в репозиторий Clients

```bash
cd ../Clients
```

### 5.2 Создайте виртуальное окружение

```bash
python3 -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

### 5.3 Установите зависимости

```bash
pip install -r requirements.txt

# Если requirements.txt не полный, установите:
pip install python-telegram-bot
pip install psycopg2-binary  # для PostgreSQL
pip install gspread oauth2client  # для Google Sheets
pip install python-dotenv
pip install requests
```

### 5.4 Создайте .env файл

```bash
cat > .env << 'EOF'
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_db
GOOGLE_SHEETS_CREDENTIALS=./credentials/google-credentials.json
GOOGLE_SHEET_ID=your_google_sheet_id
API_URL=http://localhost:3000/api
EOF
```

---

## Шаг 6: Настройка Google Sheets API

### 6.1 Создайте проект в Google Cloud

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект
3. Включите Google Sheets API
4. Создайте Service Account
5. Скачайте JSON ключ

### 6.2 Сохраните credentials

```bash
# Создайте папку credentials во всех проектах
mkdir -p ../backend-api/credentials
mkdir -p credentials

# Скопируйте скачанный JSON файл
cp ~/Downloads/your-credentials.json ./credentials/google-credentials.json
cp ~/Downloads/your-credentials.json ../backend-api/credentials/google-credentials.json
```

### 6.3 Создайте Google таблицу

1. Создайте новую таблицу в Google Sheets
2. Дайте доступ вашему Service Account email (из JSON)
3. Скопируйте ID таблицы из URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```
4. Добавьте заголовки:
   ```
   ID | Имя | Телефон | Email | Статус | Источник | Дата создания | Ответственный
   ```

---

## Шаг 7: Создание Telegram бота

### 7.1 Создайте бота через @BotFather

1. Откройте Telegram и найдите @BotFather
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Сохраните токен бота

### 7.2 Настройте Mini App

1. Отправьте `/newapp` в @BotFather
2. Выберите вашего бота
3. Введите название приложения
4. Введите описание
5. Загрузите иконку (640x360 PNG)
6. Загрузите GIF демонстрацию
7. Введите URL вашего TMA (например: https://your-tma.vercel.app)
8. Введите short name (например: `crm`)

### 7.3 Получите URL для Mini App

```
https://t.me/YourBotUsername/crm
```

---

## Шаг 8: Запуск всех сервисов

### 8.1 Запустите Backend API

```bash
cd backend-api
npm run dev
```

Должно вывести:
```
🚀 Server running on port 3000
✅ Database connected
🔌 WebSocket server ready
```

### 8.2 Запустите CRM Bot

```bash
cd Clients
source venv/bin/activate
python bot.py
```

Должно вывести:
```
✅ Bot started: @YourBotUsername
✅ Database connected
✅ Google Sheets connected
```

### 8.3 Запустите TMA Frontend

```bash
cd tma-agile-bot
npm run dev
```

Должно вывести:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

## Шаг 9: Тестирование через ngrok (для разработки)

### 9.1 Установите ngrok

```bash
# macOS
brew install ngrok

# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

### 9.2 Запустите ngrok для TMA

```bash
ngrok http 5173
```

Получите URL: `https://xxxx-xx-xx-xxx.ngrok-free.app`

### 9.3 Обновите Mini App URL в @BotFather

```
/editapp -> выберите бота -> Edit URL -> вставьте ngrok URL
```

---

## Шаг 10: Первый запуск

### 10.1 Откройте бота в Telegram

```
1. Найдите вашего бота: @YourBotUsername
2. Отправьте /start
3. Нажмите "Открыть приложение" или отправьте /open_app
```

### 10.2 Проверьте функционал

1. ✅ Dashboard загружается
2. ✅ Можно добавить клиента
3. ✅ Клиент появляется в списке
4. ✅ Клиент сохраняется в базу
5. ✅ Клиент появляется в Google Sheets

---

## 🐛 Решение проблем

### TMA не загружается

```bash
# Проверьте консоль браузера
# Проверьте что API доступен
curl http://localhost:3000/api/health

# Проверьте CORS настройки в backend
```

### Ошибка подключения к базе

```bash
# Проверьте что PostgreSQL запущен
pg_isready

# Проверьте DATABASE_URL в .env
# Проверьте что база создана
psql -U postgres -l
```

### Бот не отвечает

```bash
# Проверьте логи бота
# Проверьте что токен правильный
# Проверьте что бот запущен без ошибок
```

### Google Sheets не синхронизируется

```bash
# Проверьте credentials файл
# Проверьте что Service Account имеет доступ к таблице
# Проверьте SHEET_ID
```

---

## ✅ Чеклист готовности

- [ ] Node.js 18+ установлен
- [ ] Python 3.9+ установлен
- [ ] PostgreSQL установлен и запущен
- [ ] База данных создана
- [ ] Все зависимости установлены
- [ ] .env файлы настроены
- [ ] Google Service Account создан
- [ ] Google Sheets таблица создана
- [ ] Telegram бот создан
- [ ] Mini App настроен
- [ ] Backend запущен (порт 3000)
- [ ] Bot запущен
- [ ] TMA запущен (порт 5173)
- [ ] ngrok настроен
- [ ] Тестовый клиент добавлен

---

## 🎉 Готово!

Теперь у вас полностью рабочая CRM система в Telegram!

### Следующие шаги:

1. Изучите код в `src/components/`
2. Настройте аналитику
3. Добавьте кастомные поля для клиентов
4. Настройте уведомления
5. Деплойте на продакшн
