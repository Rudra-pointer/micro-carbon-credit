-- ============================================================
-- Neon.tech PostgreSQL Setup Script
-- ============================================================
-- 1. Create a free-tier project at https://neon.tech
-- 2. Copy the connection string into your .env as DATABASE_URL
--    Format: postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
-- 3. Run this script to bootstrap the schema (or let SQLAlchemy create_all handle it)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    consumer_number VARCHAR(100),
    household_size INTEGER DEFAULT 1,
    discom_name VARCHAR(150),
    baseline_monthly_avg FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount FLOAT NOT NULL,
    energy_consumed FLOAT NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    sanctioned_load FLOAT,
    has_solar_netmetering BOOLEAN DEFAULT FALSE,
    source VARCHAR(50),
    billing_month VARCHAR(20),
    image_url VARCHAR(500),
    ocr_raw_text TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount FLOAT NOT NULL,
    source VARCHAR(100),
    description VARCHAR(500),
    billing_month VARCHAR(20),
    units_saved FLOAT DEFAULT 0,
    saving_pct FLOAT DEFAULT 0,
    base_credits FLOAT DEFAULT 0,
    bonus_credits FLOAT DEFAULT 0,
    consistency_months INTEGER DEFAULT 0,
    consistency_multiplier FLOAT DEFAULT 1.0,
    equivalent_fan_hours FLOAT DEFAULT 0,
    equivalent_smartphone_charges FLOAT DEFAULT 0,
    equivalent_kg_co2_offset FLOAT DEFAULT 0,
    efficiency_grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redemptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    credits_redeemed FLOAT NOT NULL,
    amount_inr FLOAT NOT NULL,
    upi_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bills_user ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_month ON credits(billing_month);
