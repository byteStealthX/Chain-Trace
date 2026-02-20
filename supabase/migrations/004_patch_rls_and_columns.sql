-- ============================================================
-- Chain-Trace: Migration 004 – Patch RLS + Column Aliases
-- Fixes two critical issues:
--   1. Adds service_role INSERT/UPDATE policies so Supabase
--      Edge Functions (which run as service_role) can write
--      to fraud_rings and suspicious_accounts.
--   2. Adds a `created_at` generated column to fraud_rings
--      (maps to detected_at) so legacy queries still work.
-- ============================================================

-- ── 1. fraud_rings: add created_at alias column ─────────────
ALTER TABLE fraud_rings
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ
  GENERATED ALWAYS AS (detected_at) STORED;

-- ── 2. suspicious_accounts: add created_at alias column ─────
ALTER TABLE suspicious_accounts
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ
  GENERATED ALWAYS AS (scored_at) STORED;

-- ── 3. service_role policies for fraud_rings ─────────────────
-- Edge functions use the service_role key, which bypasses RLS
-- by default ONLY when using the service_role client.
-- Adding explicit policies as a safety net for restricted setups.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fraud_rings'
      AND policyname = 'Allow service_role full access on fraud_rings'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Allow service_role full access on fraud_rings"
        ON fraud_rings FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
    $policy$;
  END IF;
END
$$;

-- ── 4. service_role policies for suspicious_accounts ─────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'suspicious_accounts'
      AND policyname = 'Allow service_role full access on suspicious_accounts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Allow service_role full access on suspicious_accounts"
        ON suspicious_accounts FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
    $policy$;
  END IF;
END
$$;

-- ── 5. service_role policies for core tables ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'transactions'
      AND policyname = 'Allow service_role full access on transactions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Allow service_role full access on transactions"
        ON transactions FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'accounts'
      AND policyname = 'Allow service_role full access on accounts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Allow service_role full access on accounts"
        ON accounts FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
    $policy$;
  END IF;
END
$$;
