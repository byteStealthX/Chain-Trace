-- ============================================================
-- Chain-Trace: fraud_rings table
-- Stores detected fraud patterns from the analyze-transactions
-- Edge Function (circular routing, smurfing, shell networks).
-- ============================================================

CREATE TABLE IF NOT EXISTS fraud_rings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ring_type       TEXT NOT NULL
                  CHECK (ring_type IN (
                    'circular_routing',
                    'smurfing_fan_in',
                    'smurfing_fan_out',
                    'layered_shell_network'
                  )),
  severity        TEXT NOT NULL
                  CHECK (severity IN ('low','medium','high','critical')),
  accounts        TEXT[] NOT NULL,               -- Array of account IDs involved
  transactions    UUID[] DEFAULT '{}',           -- Array of transaction UUIDs involved
  cycle_length    INTEGER,                       -- For circular routing: length of the cycle
  hop_count       INTEGER,                       -- For shell networks: number of hops
  window_hours    NUMERIC(6,1),                  -- Time window in which pattern occurred
  total_amount    NUMERIC(18,2) DEFAULT 0,       -- Total money moved in the pattern
  description     TEXT NOT NULL,
  details         JSONB DEFAULT '{}',            -- Full pattern metadata
  detected_at     TIMESTAMPTZ DEFAULT NOW(),
  is_resolved     BOOLEAN DEFAULT FALSE,
  resolved_at     TIMESTAMPTZ,
  resolved_by     TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fraud_rings_type     ON fraud_rings(ring_type);
CREATE INDEX IF NOT EXISTS idx_fraud_rings_severity ON fraud_rings(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_rings_detected ON fraud_rings(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_rings_resolved ON fraud_rings(is_resolved);

-- RLS
ALTER TABLE fraud_rings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on fraud_rings"
  ON fraud_rings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert on fraud_rings"
  ON fraud_rings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on fraud_rings"
  ON fraud_rings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anon read on fraud_rings"
  ON fraud_rings FOR SELECT USING (auth.role() = 'anon');
