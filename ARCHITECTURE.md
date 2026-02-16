# 🏗️ Архитектура TMA CRM системы

## 📊 Общая схема

```
┌────────────────────────────────────────────────────────────────┐
│                      ПОЛЬЗОВАТЕЛЬ                              │
│                    (Telegram User)                             │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          ├──── Общение с ботом
                          │
                          └──── Открывает Mini App
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                   TELEGRAM MINI APP (TMA)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frontend (React + TypeScript + Vite)                      │ │
│  │  ├── Dashboard - Обзор метрик                              │ │
│  │  ├── Client List - Список всех клиентов                    │ │
│  │  ├── Client Card - Детальная карточка                      │ │
│  │  ├── Analytics - Графики и аналитика                       │ │
│  │  ├── Timeline - История взаимодействий                     │ │
│  │  └── Forms - Добавление/редактирование                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ REST API / WebSocket
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Express.js + TypeScript                                   │ │
│  │  ├── /api/clients - CRUD операции                          │ │
│  │  ├── /api/interactions - История взаимодействий            │ │
│  │  ├── /api/analytics - Аналитика                            │ │
│  │  ├── /api/sync - Синхронизация с Google Sheets            │ │
│  │  └── WebSocket - Real-time уведомления                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────┬──────────────────────┬─────────────────────────────────┘
          │                      │
          ▼                      ▼
┌───────────────────┐  ┌──────────────────────────────────────┐
│  CRM BOT (Python) │  │    GOOGLE SHEETS API                 │
│                   │  │                                       │
│  ├── Commands     │  │  ├── Чтение данных клиентов          │
│  ├── Webhooks     │  │  ├── Запись новых клиентов           │
│  ├── Messages     │  │  ├── Обновление существующих         │
│  └── Callbacks    │  │  └── Sync каждые 5 минут             │
└─────────┬─────────┘  └──────────────────────────────────────┘
          │                      │
          │                      │
          ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                   PostgreSQL / MongoDB                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Таблицы:                                                  │ │
│  │  ├── clients (id, name, phone, email, status, ...)        │ │
│  │  ├── interactions (id, client_id, type, message, date)    │ │
│  │  ├── users (telegram_id, role, permissions)               │ │
│  │  └── settings (sync_interval, notifications)              │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Поток данных

### 1. Новый клиент через бота

```
Пользователь пишет боту
    ↓
Бот получает сообщение
    ↓
Бот сохраняет в Database
    ↓
Бот отправляет в Google Sheets
    ↓
Бот отправляет WebSocket событие в TMA
    ↓
TMA обновляет список клиентов в реальном времени
```

### 2. Редактирование через TMA

```
Пользователь редактирует клиента в TMA
    ↓
TMA отправляет PUT /api/clients/:id
    ↓
Backend обновляет Database
    ↓
Backend синхронизирует с Google Sheets
    ↓
Backend отправляет WebSocket событие
    ↓
Все открытые TMA получают обновление
```

### 3. Синхронизация с Google Sheets

```
Cron Job (каждые 5 минут)
    ↓
Backend читает Google Sheets
    ↓
Сравнивает с Database
    ↓
Обновляет изменения
    ↓
Отправляет WebSocket событие
```

---

## 🎨 Компоненты TMA

### Dashboard
```typescript
// Показывает:
- Общее количество клиентов
- Новых клиентов за последние 7 дней
- Конверсию
- График активности
- Топ источников клиентов
```

### ClientList
```typescript
// Функции:
- Поиск по имени/телефону/email
- Фильтрация по статусу (новый, в работе, завершен)
- Сортировка (по дате, имени, статусу)
- Бесконечная прокрутка (lazy loading)
- Swipe-to-action (позвонить, написать, удалить)
```

### ClientCard
```typescript
// Отображает:
- Полную информацию о клиенте
- Историю всех взаимодействий
- Заметки менеджера
- Файлы/документы
- Кнопки быстрых действий
```

### Analytics
```typescript
// Графики:
- Воронка продаж
- Динамика клиентов по дням/неделям/месяцам
- Источники трафика
- Конверсия по статусам
- Топ менеджеров
```

---

## 🔌 API Endpoints

### Клиенты

```
GET    /api/clients              # Получить список клиентов
GET    /api/clients/:id          # Получить клиента по ID
POST   /api/clients              # Создать нового клиента
PUT    /api/clients/:id          # Обновить клиента
DELETE /api/clients/:id          # Удалить клиента
GET    /api/clients/search?q=    # Поиск клиентов
```

### Взаимодействия

```
GET    /api/interactions/:clientId     # История взаимодействий
POST   /api/interactions                # Добавить взаимодействие
```

### Аналитика

```
GET    /api/analytics/dashboard          # Данные для дашборда
GET    /api/analytics/funnel             # Воронка продаж
GET    /api/analytics/sources            # Источники клиентов
GET    /api/analytics/timeline?days=30   # Динамика за период
```

### Синхронизация

```
POST   /api/sync/google-sheets          # Запустить синхронизацию
GET    /api/sync/status                 # Статус последней синхронизации
```

---

## 📱 Telegram Bot команды

```
/start        - Приветствие и показ меню
/addclient    - Добавить нового клиента
/list         - Показать последних 5 клиентов
/search <query> - Поиск клиента
/stats        - Статистика
/open_app     - Открыть Mini App
```

---

## 🔐 Аутентификация

TMA использует Telegram Init Data для аутентификации:

```typescript
// Frontend отправляет initData в каждом запросе
const headers = {
  'Authorization': `tma ${window.Telegram.WebApp.initData}`
}

// Backend проверяет подпись
const validateTelegramData = (initData: string) => {
  // Валидация через crypto
  // Проверка hash
  // Извлечение user_id
}
```

---

## 🗄️ Структура базы данных

### Таблица: clients

```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new', -- new, in_progress, completed, lost
  source VARCHAR(100), -- bot, manual, import
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by BIGINT, -- telegram_id менеджера
  assigned_to BIGINT -- telegram_id ответственного
);
```

### Таблица: interactions

```sql
CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  type VARCHAR(50), -- call, message, meeting, note
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by BIGINT
);
```

### Таблица: users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'manager', -- admin, manager, viewer
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Развертывание

### Frontend (TMA)

```bash
# Build
npm run build

# Deploy на GitHub Pages / Vercel / Netlify
# Важно: должен быть доступен по HTTPS
```

### Backend API

```bash
# Docker
docker build -t crm-api .
docker run -p 3000:3000 crm-api

# Или PM2
pm2 start dist/server.js --name crm-api
```

### CRM Bot

```bash
# Docker
docker build -t crm-bot .
docker run crm-bot

# Или PM2
pm2 start bot.py --name crm-bot --interpreter python3
```

---

## 🔧 Переменные окружения

### Frontend (.env)

```env
VITE_API_URL=https://api.yourproject.com
VITE_WS_URL=wss://api.yourproject.com
VITE_BOT_USERNAME=@YourCRMBot
```

### Backend (.env)

```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/crm
BOT_TOKEN=your_telegram_bot_token
TELEGRAM_SECRET=your_secret_for_validation
GOOGLE_SHEETS_CREDENTIALS=path/to/credentials.json
GOOGLE_SHEET_ID=your_sheet_id
CORS_ORIGIN=https://your-tma-url.com
```

### Bot (.env)

```env
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://user:pass@localhost:5432/crm
GOOGLE_SHEETS_CREDENTIALS=path/to/credentials.json
GOOGLE_SHEET_ID=your_sheet_id
API_URL=https://api.yourproject.com
```

---

## 📊 Интеграция с Google Sheets

### Структура Google таблицы

```
| ID | Имя | Телефон | Email | Статус | Источник | Дата создания | Ответственный |
|----|-----|---------|-------|--------|----------|---------------|---------------|
| 1  | ... | ...     | ...   | ...    | ...      | ...           | ...           |
```

### Синхронизация

1. **Односторонняя (Bot → Sheets):**
   - Новый клиент в боте → добавляется в таблицу
   
2. **Двусторонняя:**
   - Изменения в таблице → обновляются в базе
   - Изменения в базе → обновляются в таблице
   - Conflict resolution: последнее изменение побеждает

---

## 🎯 Roadmap

### Фаза 1 (MVP) - 2 недели
- ✅ Базовая структура TMA
- ✅ CRUD клиентов
- ✅ Интеграция с ботом
- ✅ Синхронизация с Google Sheets

### Фаза 2 - 2 недели
- 📊 Дашборд с аналитикой
- 📈 Графики и визуализация
- 🔍 Расширенный поиск
- 💬 История взаимодействий

### Фаза 3 - 2 недели
- 🔔 Push-уведомления
- 📅 Календарь встреч
- 📁 Загрузка файлов
- 👥 Управление командой

### Фаза 4 - 1 неделя
- 🌙 Темная тема
- 🌐 Мультиязычность
- 📱 PWA поддержка
- 🚀 Оптимизация производительности
