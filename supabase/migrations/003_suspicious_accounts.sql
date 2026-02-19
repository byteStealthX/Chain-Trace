-- ============================================================
-- Chain-Trace: suspicious_accounts table
-- Stores computed suspicion scores per account
-- ============================================================

CREATE TABLE IF NOT EXISTS suspicious_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id        TEXT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  suspicion_score   NUMERIC(5,2) NOT NULL CHECK (suspicion_score >= 0 AND suspicion_score <= 100),
  raw_score         NUMERIC(8,2) DEFAULT 0,       -- Pre-normalization score
  cycle_score       NUMERIC(5,2) DEFAULT 0,       -- Points from circular routing
  fanin_fanout_score NUMERIC(5,2) DEFAULT 0,      -- Points from smurfing
  shell_score       NUMERIC(5,2) DEFAULT 0,       -- Points from shell chains
  velocity_score    NUMERIC(5,2) DEFAULT 0,       -- Points from high tx velocity
  risk_label        TEXT NOT NULL
                    CHECK (risk_label IN ('clean','low','moderate','high','critical')),
  contributing_rings UUID[] DEFAULT '{}',          -- fraud_ring IDs this score derives from
  transaction_count INTEGER DEFAULT 0,
  total_volume      NUMERIC(18,2) DEFAULT 0,
  analysis_id       TEXT,                          -- Links to analysis run
  scored_at         TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_account_analysis UNIQUE (account_id, analysis_id)
);

CREATE INDEX IF NOT EXISTS idx_suspicious_score  ON suspicious_accounts(suspicion_score DESC);
CREATE INDEX IF NOT EXISTS idx_suspicious_label  ON suspicious_accounts(risk_label);
CREATE INDEX IF NOT EXISTS idx_suspicious_acct   ON suspicious_accounts(account_id);

ALTER TABLE suspicious_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on suspicious_accounts"
  ON suspicious_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on suspicious_accounts"
  ON suspicious_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow anon read on suspicious_accounts"
  ON suspicious_accounts FOR SELECT USING (auth.role() = 'anon');
