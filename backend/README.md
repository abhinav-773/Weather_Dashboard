# 🌤 Weather Dashboard — Architecture Documentation

> Production-grade full-stack Weather Dashboard built with React + Vite (frontend), Express.js (backend), PostgreSQL/Neon (database), and OpenWeatherMap API.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Folder Structure](#folder-structure)
4. [Backend Layer Responsibilities](#backend-layer-responsibilities)
5. [Database Schema](#database-schema)
6. [API Contracts](#api-contracts)
7. [Environment Variables](#environment-variables)
8. [Getting Started (Local)](#getting-started-local)
9. [Deployment Guide](#deployment-guide)
10. [Security Practices](#security-practices)

---

## Project Overview

| Layer      | Technology         | Hosting     |
|------------|--------------------|-------------|
| Frontend   | React 18 + Vite    | Vercel      |
| Backend    | Node.js + Express  | Render      |
| Database   | PostgreSQL (Neon)  | Neon        |
| Weather    | OpenWeatherMap API | External    |

**Core Principle**: The React frontend **never calls OpenWeatherMap directly**. All weather requests flow through the Express backend, keeping the API key secure.

---

## Architecture Diagram

```
┌───────────────────────────────────────────────┐
│               React Frontend (Vercel)         │
│    Search │ Weather Card │ Forecast │ History  │
└───────────────────┬───────────────────────────┘
                    │  HTTPS (VITE_API_BASE_URL)
                    ▼
┌───────────────────────────────────────────────┐
│           Express Backend (Render)            │
│                                               │
│  Routes → Validators → Controllers → Service │
│                                               │
│   /api/weather/*        /api/history/*        │
└──────────┬──────────────────────┬────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────┐
│  OpenWeatherMap  │   │  PostgreSQL / Neon    │
│   (External API) │   │  search_history table │
└──────────────────┘   └──────────────────────┘
```

---

## Folder Structure

```
Abhinav_Weather_Dashboard/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── weatherController.js   ← handles /api/weather/* requests
│   │   │   └── historyController.js   ← handles /api/history/* requests
│   │   │
│   │   ├── routes/
│   │   │   ├── weatherRoutes.js       ← route definitions + validator chaining
│   │   │   └── historyRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── weatherService.js      ← all OpenWeatherMap API calls
│   │   │
│   │   ├── db/
│   │   │   ├── pool.js                ← pg connection pool (SSL for Neon)
│   │   │   └── migrate.js             ← idempotent schema migrations
│   │   │
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        ← global error handler (no stack traces in prod)
│   │   │   └── requestValidation.js   ← express-validator rules per endpoint
│   │   │
│   │   ├── utils/
│   │   │   ├── responseFormatter.js   ← sendSuccess / sendError helpers
│   │   │   └── validators.js          ← pure validation functions (testable)
│   │   │
│   │   ├── app.js                     ← Express factory (middleware, routes, 404, errors)
│   │   └── server.js                  ← entry point (DB check → listen → graceful shutdown)
│   │
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                 ← Axios instance + per-endpoint functions
    │   ├── components/          ← Reusable UI components
    │   ├── hooks/               ← Custom hooks (useDebounce, useWeather, useGeolocation)
    │   ├── pages/               ← Page-level components
    │   ├── context/             ← React context (TemperatureUnit, etc.)
    │   ├── styles/              ← Global CSS / Tailwind base
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── .env.example
    └── package.json
```

---

## Backend Layer Responsibilities

### `services/weatherService.js`
- Single source of truth for all OpenWeatherMap calls.
- Holds the pre-configured Axios instance with `appid` & `units=metric`.
- Maps OWM HTTP errors (404, 401, 429, network) into structured `Error` objects with `statusCode`.
- **Exported methods:**
  - `getCurrentWeatherByCity(city)`
  - `getForecastByCity(city)`
  - `getCurrentWeatherByCoords(lat, lon)`
  - `getForecastByCoords(lat, lon)`
  - `getCitySuggestions(query, limit?)`

### `controllers/weatherController.js`
- Unpacks `req.query` params.
- Calls the service and returns `{ success: true, data }`.
- Passes errors to `next(error)` for the global handler.

### `controllers/historyController.js`
- Performs parameterized SQL queries via the pg pool.
- `getHistory` — returns last 20 searches ordered DESC.
- `saveHistory` — UPSERT pattern; bumps `searched_at` on duplicates.
- `clearHistory` — bulk DELETE.
- `deleteHistoryItem` — single record DELETE by UUID.

### `middleware/errorHandler.js`
- Last middleware in the chain.
- Reads `err.statusCode`, logs server errors (`>= 500`) with stack trace.
- Returns sanitized `{ success, message }` — never exposes stack in production.

### `middleware/requestValidation.js`
- `express-validator` rule arrays for every route.
- Returns `400 { success, message, errors: [{ field, message }] }` on failure.
- **Validators:** `validateCityQuery`, `validateCoordinates`, `validateSuggestionQuery`, `validateSaveHistory`, `validateHistoryId`.

### `db/pool.js`
- `pg.Pool` with `max: 10`, SSL enabled in production (required by Neon).
- `testConnection()` verifies connectivity on startup.

### `db/migrate.js`
- Standalone script: `node src/db/migrate.js`
- Creates `search_history` table and both indexes (`IF NOT EXISTS`).

---

## Database Schema

```sql
CREATE TABLE search_history (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name   VARCHAR(255)  NOT NULL,
    country     VARCHAR(100),
    latitude    NUMERIC(10,6),
    longitude   NUMERIC(10,6),
    searched_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_date ON search_history(searched_at DESC);
CREATE INDEX idx_city_name   ON search_history(city_name);
```

---

## API Contracts

### Weather Endpoints

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/weather/current` | `city` (required) | Current weather by city name |
| GET | `/api/weather/forecast` | `city` (required) | 5-day/3-hour forecast by city |
| GET | `/api/weather/location` | `lat`, `lon` (required) | Current + forecast by coordinates |
| GET | `/api/weather/suggestions` | `q` (required) | City autocomplete suggestions |

#### Success Response Shape
```json
{
  "success": true,
  "data": { /* OpenWeatherMap response */ }
}
```

#### Error Response Shape
```json
{
  "success": false,
  "message": "City not found. Please check the spelling and try again."
}
```

#### Validation Error Shape (400)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "city", "message": "City name is required." }
  ]
}
```

---

### History Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/history` | — | Fetch last 20 searches |
| POST | `/api/history` | `{ city_name, country?, latitude?, longitude? }` | Save a search |
| DELETE | `/api/history` | — | Clear all history |
| DELETE | `/api/history/:id` | — | Delete single record (UUID) |

#### POST /api/history — Request Body
```json
{
  "city_name": "London",
  "country": "GB",
  "latitude": 51.507351,
  "longitude": -0.127758
}
```

#### GET /api/history — Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "city_name": "London",
      "country": "GB",
      "latitude": "51.507351",
      "longitude": "-0.127758",
      "searched_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Health Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server uptime check |

```json
{
  "success": true,
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
OPENWEATHER_API_KEY=your_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

> ⚠️ **Never commit `.env` files.** Both are in `.gitignore`. Use `.env.example` as templates.

---

## Getting Started (Local)

### Prerequisites
- Node.js >= 18
- PostgreSQL or a Neon account
- OpenWeatherMap API key (free tier works)

### Backend Setup

```bash
cd backend
cp .env.example .env     # Fill in your values
npm install
node src/db/migrate.js   # Run once to create tables
npm run dev              # Starts on port 5000 with nodemon
```

### Frontend Setup (Phase 2)

```bash
cd frontend
cp .env.example .env     # Set VITE_API_BASE_URL
npm install
npm run dev              # Starts on port 5173
```

---

## Deployment Guide

### Backend → Render

1. Connect the `backend/` directory as a Render Web Service.
2. Build Command: `npm install`
3. Start Command: `node src/server.js`
4. Set all environment variables from `backend/.env.example` in the Render dashboard.
5. Run migration once: `node src/db/migrate.js` from Render shell.

### Frontend → Vercel

1. Connect the `frontend/` directory.
2. Framework preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set `VITE_API_BASE_URL` to your Render backend URL.

### Database → Neon

1. Create a free Neon project.
2. Copy the connection string to `DATABASE_URL` in both Render and local `.env`.
3. The connection string includes `?sslmode=require` — this is handled by the pool.

---

## Security Practices

| Practice | Implementation |
|----------|---------------|
| API key protection | Key lives only in backend `.env`, never in frontend |
| CORS whitelist | Only `CLIENT_URL` and localhost origins allowed |
| Rate limiting | 100 requests per IP per 15 minutes (`express-rate-limit`) |
| Security headers | `helmet` sets CSP, X-Frame-Options, HSTS, etc. |
| Input validation | `express-validator` on every route before controllers run |
| SQL injection | All queries use parameterized `$1, $2` placeholders |
| Error sanitization | Stack traces stripped in production error responses |
| Body size limit | JSON body capped at 10kb |
| UUID validation | History item IDs validated as proper UUIDs before DB query |
