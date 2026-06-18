-- ============================================================
-- Weather Dashboard — PostgreSQL Schema
-- Compatible with: PostgreSQL 14+ / Neon Serverless Postgres
--
-- Usage (standalone):
--   psql $DATABASE_URL -f src/db/schema.sql
--
-- Usage (programmatic migration):
--   node src/db/migrate.js
-- ============================================================

-- Enable pgcrypto extension for gen_random_uuid()
-- (pre-enabled on Neon; included here for portability)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Main Table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_history (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name   VARCHAR(255)  NOT NULL,
    country     VARCHAR(100),
    latitude    NUMERIC(10,6),
    longitude   NUMERIC(10,6),
    searched_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- Primary access pattern: fetch latest N searches
CREATE INDEX IF NOT EXISTS idx_search_date
    ON search_history(searched_at DESC);

-- Lookup / deduplication by city name (UPSERT logic in historyController)
CREATE INDEX IF NOT EXISTS idx_city_name
    ON search_history(city_name);
