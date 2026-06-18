<div align="center">
  <img src="https://openweathermap.org/img/wn/02d@4x.png" alt="WeatherMind Logo" width="120" />
  <h1>WeatherMind</h1>
  <p>A production-grade, full-stack weather dashboard featuring real-time data, 5-day forecasting, geolocation, and search analytics.</p>
</div>

---

## 📖 Project Overview

WeatherMind is a robust, full-stack weather application built as a developer assessment submission. It goes beyond a simple API wrapper by implementing a clean backend architecture, proxying OpenWeatherMap requests to securely hide API keys, and persisting search history with advanced analytics using PostgreSQL.

The frontend is a beautifully designed, highly responsive React application utilizing dynamic glassmorphism and real-time transitioning CSS backgrounds that match the current weather conditions.

---

## 🎯 Features

- **Real-Time Weather:** Live weather fetching with temperature, humidity, wind, pressure, and visibility.
- **5-Day Forecast:** 3-hour interval data condensed into an elegant 5-day daily forecast.
- **Geolocation:** "Use My Location" detection via the browser Geolocation API.
- **Search History & Analytics:** PostgreSQL-backed search history with aggregated analytics (most searched, total counts).
- **Dynamic UI:** 12 different transitioning CSS gradients based on live weather conditions (Clear, Rain, Snow, Thunderstorm, etc.) and time of day.
- **Premium UX:** Skeleton loaders, debounced autocomplete suggestions, light/dark mode toggling, and fully responsive layouts.

---

## 🛠️ Tech Stack

**Frontend:**
- **React 18** + **Vite** (Functional components & Custom Hooks)
- **TailwindCSS** (Custom glassmorphism design system)
- **Axios** (API client)

**Backend:**
- **Node.js** + **Express.js** (REST API)
- **PostgreSQL** (`pg` connection pool)
- **Security Middleware:** `helmet`, `cors`, `express-rate-limit`, `express-validator`

**Deployment / Infrastructure:**
- Frontend: **Vercel**
- Backend: **Render**
- Database: **Neon** (Serverless Postgres)
- Weather Data: **OpenWeatherMap API**

---

## 🏗️ Architecture

```mermaid
graph LR
    subgraph Frontend [React Frontend (Vercel)]
        UI[React UI Components]
        Hooks[Custom Hooks]
        Context[Global Contexts]
        UI <--> Hooks
        Hooks <--> Context
    end

    subgraph Backend [Node.js / Express Backend (Render)]
        Router[Express Routes]
        Controller[Controllers]
        Service[Weather Service]
        Validator[express-validator]
        Router --> Validator
        Validator --> Controller
        Controller --> Service
    end

    subgraph Database [Neon PostgreSQL]
        DB[(Search History)]
    end

    subgraph External [External APIs]
        OWM[OpenWeatherMap API]
    end

    Hooks -- "REST API / JSON" --> Router
    Controller <--> DB
    Service <--> OWM
```

---

## 🌐 API Endpoints

### Weather Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/weather/dashboard?city={name}` | Returns both current weather & 5-day forecast in a single network call. |
| `GET` | `/api/weather/current?city={name}` | Returns current weather for a specified city. |
| `GET` | `/api/weather/forecast?city={name}` | Returns 5-day forecast for a specified city. |
| `GET` | `/api/weather/location?lat={lat}&lon={lon}` | Returns dashboard data via GPS coordinates. |
| `GET` | `/api/weather/suggestions?q={query}` | Returns city autocomplete suggestions. |

### History Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history?limit={10}` | Returns the latest search history. |
| `GET` | `/api/history/stats` | Returns aggregate search analytics. |
| `POST`| `/api/history` | Saves or updates a search entry (UPSERT). |
| `DELETE`| `/api/history/:id` | Deletes a specific history record. |
| `DELETE`| `/api/history` | Clears all search history. |

---

## 🗄️ Database Schema

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
CREATE INDEX idx_city_name ON search_history(city_name);
```
*(Uses an `ON CONFLICT DO NOTHING` + `UPDATE` pattern to bump `searched_at` rather than duplicating rows for identical city searches).*

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or a Neon database string)
- OpenWeatherMap API Key

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Abhinav_Weather_Dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory (see Environment Variables section).

Run the database migration to set up the tables:
```bash
node src/db/migrate.js
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory (see Environment Variables section).

Start the frontend development server:
```bash
npm run dev
```

---

## 🔐 Environment Variables

### `backend/.env`
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5001
```

---

## 🚀 Deployment Steps

### 1. Database (Neon)
1. Create a project at [Neon.tech](https://neon.tech).
2. Copy the connection string provided (ensure it ends with `?sslmode=require`).

### 2. Backend (Render)
1. Push your repository to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your repository.
4. Set the Root Directory to `backend`.
5. Set Build Command: `npm install`
6. Set Start Command: `node src/server.js`
7. Add Environment Variables: `DATABASE_URL`, `OPENWEATHER_API_KEY`, `CLIENT_URL` (set to your Vercel domain later).
8. Once deployed, run your migration script once via the Render shell: `node src/db/migrate.js`.

### 3. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and import your repository.
2. Set the Root Directory to `frontend`.
3. The framework preset should automatically detect **Vite**.
4. Add Environment Variable: `VITE_API_BASE_URL` pointing to your new Render backend URL.
5. Deploy.

*(Don't forget to update the `CLIENT_URL` in your Render backend environment variables to point to your new Vercel domain to avoid CORS issues!)*

---

## 📸 Screenshots

| Light Mode Dashboard | Dark Mode Dashboard |
|:---:|:---:|
| <!-- Add screenshot here --> <br> *(Placeholder: Light Mode)* | <!-- Add screenshot here --> <br> *(Placeholder: Dark Mode)* |

| Search Autocomplete & Skeletons | History & Analytics |
|:---:|:---:|
| <!-- Add screenshot here --> <br> *(Placeholder: Autocomplete)* | <!-- Add screenshot here --> <br> *(Placeholder: Analytics)* |

---

## 🧠 Assumptions Made During Development

1. **Modern Browser Support:** It is assumed the user is running a modern browser supporting CSS grid, backdrop-filter, and the Geolocation API.
2. **API Rate Limits:** The OpenWeatherMap free tier allows 60 calls/minute. It is assumed the user's traffic will not exceed this limit during local testing or evaluation.
3. **Database Concurrency:** The PostgreSQL upsert mechanism assumes typical user search behavior where identical city searches should simply bump the `searched_at` timestamp rather than creating duplicate history entries.
4. **Environment Consistency:** It is assumed that the Render backend and Vercel frontend will have their environment variables correctly configured to mirror the provided `.env.example` configurations.

---

## 🔮 Future Improvements

If given more time, the following enhancements could be implemented:
1. **Unit and Integration Testing:** Implement full coverage using Jest (Backend) and Vitest + React Testing Library (Frontend).
2. **Redis Caching:** Cache the OpenWeatherMap API responses for 10-15 minutes on the backend to reduce API usage limits and improve latency.
3. **PWA Support:** Add a service worker and manifest to allow users to install WeatherMind as a native-feeling app on their mobile devices.
4. **Interactive Weather Maps:** Integrate Leaflet.js to display radar and precipitation maps based on the searched coordinates.
