# ⚡ Быстрый старт - TMA CRM

## 🎯 Цель

Создать полноценную CRM систему в Telegram Mini App с:
- Управлением клиентами
- Визуализацией данных
- Синхронизацией с Google Sheets
- Real-time обновлениями

---

## 📋 Чек-лист установки

### ✅ Подготовка

- [ ] Установлен Node.js 18+
- [ ] Установлен Python 3.9+
- [ ] Установлен PostgreSQL 14+
- [ ] Создан Telegram бот через @BotFather
- [ ] Создан Google Service Account
- [ ] Создана Google таблица

### ✅ Frontend (tma-agile-bot)

```bash
cd tma-agile-bot

# Установка зависимостей
npm install

# Добавьте эти пакеты:
npm install @telegram-apps/sdk-react zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install recharts axios socket.io-client date-fns

# Создайте .env
echo 'VITE_API_URL=http://localhost:3000/api' > .env
echo 'VITE_WS_URL=ws://localhost:3000' >> .env
echo 'VITE_BOT_USERNAME=@YourBotUsername' >> .env

# Запуск
npm run dev
# Откроется на http://localhost:5173
```

### ✅ Backend (backend-api)

```bash
mkdir backend-api && cd backend-api

# package.json
npm init -y

# Установка зависимостей
npm install express cors dotenv @prisma/client socket.io
npm install googleapis node-telegram-bot-api winston zod pg
npm install -D typescript @types/node @types/express @types/cors
npm install -D ts-node nodemon prisma

# Создайте .env
cat > .env << 'EOF'
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_db
BOT_TOKEN=your_bot_token
TELEGRAM_SECRET=your_secret
GOOGLE_SHEETS_CREDENTIALS=./credentials/google-credentials.json
GOOGLE_SHEET_ID=your_sheet_id
CORS_ORIGIN=http://localhost:5173
EOF

# Prisma
npx prisma init
# Скопируйте schema из ARCHITECTURE.md
npx prisma migrate dev --name init
npx prisma generate

# Запуск
npm run dev
# Откроется на http://localhost:3000
```

### ✅ Bot (Clients)

```bash
cd Clients

# Виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Зависимости
pip install -r requirements.txt

# Если requirements.txt пустой:
pip install python-telegram-bot psycopg2-binary
pip install gspread oauth2client python-dotenv requests

# Создайте .env
cat > .env << 'EOF'
BOT_TOKEN=your_bot_token
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_db
GOOGLE_SHEETS_CREDENTIALS=./credentials/google-credentials.json
GOOGLE_SHEET_ID=your_sheet_id
API_URL=http://localhost:3000/api
EOF

# Запуск
python bot.py
```

---

## 📁 Файлы для копирования

### Из этого архива скопируйте:

#### В `tma-agile-bot/`:
- `App.tsx` → `src/App.tsx`
- `Dashboard.tsx` → `src/components/Dashboard.tsx`
- `api-client.ts` → `src/lib/api-client.ts`
- `useWebSocket.ts` → `src/hooks/useWebSocket.ts`
- `frontend-package.json` → `package.json` (объедините зависимости)

#### В `backend-api/`:
- `server.ts` → `src/server.ts`
- `auth.ts` → `src/middleware/auth.ts`
- `clients-routes.ts` → `src/routes/clients.ts`
- `backend-package.json` → `package.json`

---

## 🔑 Важные конфигурации

### 1. Google Sheets API

1. Перейдите на https://console.cloud.google.com/
2. Создайте проект
3. Включите Google Sheets API
4. Создайте Service Account
5. Скачайте JSON ключ
6. Положите в `backend-api/credentials/google-credentials.json`
7. Дайте доступ Service Account email к вашей таблице

### 2. Telegram Bot

1. Найдите @BotFather в Telegram
2. `/newbot` - создать бота
3. Сохраните токен
4. `/newapp` - создать Mini App
5. Укажите URL: https://your-domain.com (потом можно изменить)

### 3. PostgreSQL

```sql
-- Создайте базу
CREATE DATABASE crm_db;

-- Или с пользователем
CREATE USER crm_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
```

---

## 🚀 Запуск всех сервисов

### Терминал 1: Backend
```bash
cd backend-api
npm run dev
```

### Терминал 2: Bot
```bash
cd Clients
source venv/bin/activate
python bot.py
```

### Терминал 3: Frontend
```bash
cd tma-agile-bot
npm run dev
```

### Терминал 4: ngrok (для тестирования)
```bash
ngrok http 5173
# Получите URL: https://xxxx.ngrok-free.app
# Обновите в @BotFather: /editapp -> Edit URL
```

---

## ✅ Проверка работы

1. Откройте бота в Telegram
2. `/start`
3. Нажмите "Открыть приложение"
4. Должна загрузиться панель с дашбордом
5. Попробуйте добавить клиента
6. Проверьте что клиент появился в Google Sheets

---

## 🐛 Частые проблемы

### Frontend не загружается
- Проверьте `VITE_API_URL` в .env
- Проверьте что Backend запущен
- Откройте консоль браузера (F12)

### Backend не стартует
- Проверьте `DATABASE_URL`
- Убедитесь что PostgreSQL запущен: `pg_isready`
- Проверьте логи: `npm run dev`

### Bot не отвечает
- Проверьте `BOT_TOKEN`
- Проверьте логи Python
- Убедитесь что токен правильный

### Google Sheets не синхронизируется
- Проверьте путь к `google-credentials.json`
- Проверьте что Service Account имеет доступ к таблице
- Проверьте `GOOGLE_SHEET_ID`

---

## 📚 Следующие шаги

После установки:

1. Изучите [ARCHITECTURE.md](./ARCHITECTURE.md) - как все работает
2. Изучите [INSTALLATION.md](./INSTALLATION.md) - детальная установка
3. Добавьте свои компоненты в `src/components/`
4. Настройте аналитику
5. Кастомизируйте дизайн

---

## 🎯 Основные концепции

### Как работает аутентификация?

```typescript
// Frontend отправляет Telegram initData
headers: {
  'Authorization': `tma ${window.Telegram.WebApp.initData}`
}

// Backend валидирует подпись HMAC
// Если валидно - пропускает запрос
```

### Как работает Real-time?

```typescript
// Frontend подключается к WebSocket
const socket = io('ws://localhost:3000');

// Backend отправляет события
emitEvent('client:created', { client });

// Frontend слушает и обновляет UI
socket.on('client:created', (data) => {
  queryClient.invalidateQueries(['clients']);
});
```

### Как работает синхронизация с Sheets?

```
1. Новый клиент добавлен в Bot/TMA
2. Сохраняется в PostgreSQL
3. Backend отправляет данные в Google Sheets
4. Cron job каждые 5 минут проверяет изменения
5. Если есть изменения - обновляет БД
6. Отправляет WebSocket событие
7. TMA обновляет UI
```

---

## 📞 Помощь

Если что-то не работает:
1. Проверьте этот чек-лист
2. Посмотрите логи (консоль, терминалы)
3. Проверьте .env файлы
4. Создайте Issue на GitHub

---

**Удачи! 🚀**
