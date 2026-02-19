-- ============================================================
-- Chain-Trace Database Schema
-- Complete schema for financial crime detection platform
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ACCOUNTS TABLE
-- Represents bank accounts / wallet addresses in the network
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id    TEXT UNIQUE NOT NULL,          -- External account identifier
  account_name  TEXT,
  account_type  TEXT DEFAULT 'individual',     -- individual | business | shell
  risk_level    TEXT DEFAULT 'safe'
                CHECK (risk_level IN ('safe','low','medium','high','critical')),
  total_sent    NUMERIC(18,2) DEFAULT 0,
  total_received NUMERIC(18,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  first_seen    TIMESTAMPTZ,
  last_seen     TIMESTAMPTZ,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TRANSACTIONS TABLE
-- Individual money transfers between accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_ref TEXT UNIQUE,                   -- External reference ID
  sender_id       TEXT NOT NULL,
  receiver_id     TEXT NOT NULL,
  amount          NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency        TEXT DEFAULT 'USD',
  timestamp       TIMESTAMPTZ NOT NULL,
  description     TEXT,
  risk_score      NUMERIC(5,2) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  is_flagged      BOOLEAN DEFAULT FALSE,
  flag_reason     TEXT,
  batch_id        UUID,                          -- Links to upload batch
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign keys to accounts (soft — linked by account_id text)
  CONSTRAINT fk_sender   FOREIGN KEY (sender_id)   REFERENCES accounts(account_id) ON DELETE CASCADE,
  CONSTRAINT fk_receiver FOREIGN KEY (receiver_id)  REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- ============================================================
-- 3. FRAUD_ALERTS TABLE
-- Detected fraud signals and anomalies
-- ============================================================
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  alert_type      TEXT NOT NULL
                  CHECK (alert_type IN (
                    'high_risk','suspicious_pattern','rapid_movement',
                    'circular_flow','structuring','velocity_anomaly'
                  )),
  severity        TEXT NOT NULL
                  CHECK (severity IN ('low','medium','high','critical')),
  message         TEXT NOT NULL,
  details         JSONB DEFAULT '{}',
  is_resolved     BOOLEAN DEFAULT FALSE,
  resolved_at     TIMESTAMPTZ,
  resolved_by     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. UPLOAD_BATCHES TABLE
-- Tracks CSV upload sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS upload_batches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename        TEXT NOT NULL,
  rows_total      INTEGER DEFAULT 0,
  rows_parsed     INTEGER DEFAULT 0,
  rows_inserted   INTEGER DEFAULT 0,
  rows_failed     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','completed','failed')),
  errors          JSONB DEFAULT '[]',
  uploaded_by     TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ============================================================
-- 5. REPORTS TABLE
-- Generated analysis reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  report_type     TEXT NOT NULL
                  CHECK (report_type IN ('summary','detailed','network_analysis','risk_assessment')),
  date_range_start TIMESTAMPTZ,
  date_range_end   TIMESTAMPTZ,
  total_transactions INTEGER DEFAULT 0,
  total_flagged    INTEGER DEFAULT 0,
  total_accounts   INTEGER DEFAULT 0,
  avg_risk_score   NUMERIC(5,2) DEFAULT 0,
  findings         JSONB DEFAULT '[]',
  generated_by     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. GRAPH_SNAPSHOTS TABLE
-- Pre-computed graph data for visualization
-- ============================================================
CREATE TABLE IF NOT EXISTS graph_snapshots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id        UUID REFERENCES upload_batches(id) ON DELETE SET NULL,
  nodes           JSONB NOT NULL DEFAULT '[]',
  links           JSONB NOT NULL DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES — Performance optimization
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_sender     ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver   ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp  ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_flagged    ON transactions(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_transactions_risk       ON transactions(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_batch      ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_txn        ON fraud_alerts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity   ON fraud_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_type       ON fraud_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_accounts_risk           ON accounts(risk_level);
CREATE INDEX IF NOT EXISTS idx_accounts_account_id     ON accounts(account_id);

-- ============================================================
-- FUNCTIONS — Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- Basic public-readable policies (tighten per your auth model)
-- ============================================================
ALTER TABLE accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust as needed)
CREATE POLICY "Allow authenticated read on accounts"      ON accounts       FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on accounts"    ON accounts       FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on accounts"    ON accounts       FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read on transactions"  ON transactions   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on transactions" ON transactions  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read on fraud_alerts"  ON fraud_alerts   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on fraud_alerts" ON fraud_alerts  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on fraud_alerts" ON fraud_alerts  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on upload_batches" ON upload_batches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all on reports"        ON reports        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all on graph_snapshots" ON graph_snapshots FOR ALL USING (auth.role() = 'authenticated');

-- Also allow anon (service role) for edge functions
CREATE POLICY "Allow anon read on accounts"      ON accounts       FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow anon read on transactions"  ON transactions   FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow anon read on fraud_alerts"  ON fraud_alerts   FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow anon read on reports"       ON reports        FOR SELECT USING (auth.role() = 'anon');
