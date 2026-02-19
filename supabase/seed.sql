-- ============================================================
-- Chain-Trace Seed Data
-- Sample accounts and transactions for development / demo
-- ============================================================

-- Insert sample accounts
INSERT INTO accounts (account_id, account_name, account_type, risk_level, total_sent, total_received, transaction_count, first_seen, last_seen) VALUES
  ('ACC-001', 'Alice Johnson',   'individual', 'safe',     15000.00, 8000.00,  12, '2025-01-15', '2025-06-10'),
  ('ACC-002', 'Bob Martinez',    'individual', 'low',      22000.00, 18500.00, 25, '2025-01-20', '2025-06-12'),
  ('ACC-003', 'Shell Corp Ltd',  'shell',      'critical', 85000.00, 92000.00, 67, '2025-02-01', '2025-06-15'),
  ('ACC-004', 'Carol Nguyen',    'individual', 'medium',   45000.00, 38000.00, 34, '2025-02-10', '2025-06-14'),
  ('ACC-005', 'David Kim',       'individual', 'safe',     5000.00,  3200.00,  8,  '2025-03-01', '2025-06-08'),
  ('ACC-006', 'Phantom Holdings','business',   'high',     120000.00,115000.00,89, '2025-01-05', '2025-06-15'),
  ('ACC-007', 'Eva Petrov',      'individual', 'low',      9500.00,  7200.00,  15, '2025-03-15', '2025-06-11'),
  ('ACC-008', 'Frank Osei',      'individual', 'high',     65000.00, 60000.00, 45, '2025-02-20', '2025-06-15'),
  ('ACC-009', 'Grace Liu',       'individual', 'safe',     3000.00,  2100.00,  6,  '2025-04-01', '2025-06-05'),
  ('ACC-010', 'Helix Finance',   'business',   'critical', 200000.00,195000.00,120,'2025-01-01', '2025-06-15')
ON CONFLICT (account_id) DO NOTHING;

-- Insert sample transactions (normal + suspicious patterns)
INSERT INTO transactions (transaction_ref, sender_id, receiver_id, amount, currency, timestamp, description, risk_score, is_flagged, flag_reason) VALUES
  -- Normal transactions
  ('TXN-001', 'ACC-001', 'ACC-002', 500.00,   'USD', '2025-03-15 10:30:00+00', 'Freelance payment',       5.0,  FALSE, NULL),
  ('TXN-002', 'ACC-005', 'ACC-001', 1200.00,  'USD', '2025-03-16 14:00:00+00', 'Invoice settlement',      3.0,  FALSE, NULL),
  ('TXN-003', 'ACC-002', 'ACC-007', 800.00,   'USD', '2025-03-18 09:15:00+00', 'Service fee',             8.0,  FALSE, NULL),
  ('TXN-004', 'ACC-009', 'ACC-005', 250.00,   'USD', '2025-03-20 11:45:00+00', 'Reimbursement',           2.0,  FALSE, NULL),

  -- Suspicious rapid movements (money muling pattern)
  ('TXN-005', 'ACC-003', 'ACC-006', 15000.00, 'USD', '2025-04-01 02:10:00+00', 'Bulk transfer',           78.0, TRUE,  'rapid_movement'),
  ('TXN-006', 'ACC-006', 'ACC-008', 14500.00, 'USD', '2025-04-01 02:25:00+00', 'Forwarded funds',         82.0, TRUE,  'rapid_movement'),
  ('TXN-007', 'ACC-008', 'ACC-010', 14000.00, 'USD', '2025-04-01 02:40:00+00', 'Chain transfer',          88.0, TRUE,  'rapid_movement'),

  -- Circular flow pattern
  ('TXN-008', 'ACC-010', 'ACC-003', 12000.00, 'USD', '2025-04-02 03:00:00+00', 'Return payment',          92.0, TRUE,  'circular_flow'),
  ('TXN-009', 'ACC-003', 'ACC-010', 11500.00, 'USD', '2025-04-03 01:30:00+00', 'Investment return',       90.0, TRUE,  'circular_flow'),

  -- Structuring (breaking large amounts into small sub-$10k pieces)
  ('TXN-010', 'ACC-004', 'ACC-006', 9800.00,  'USD', '2025-04-05 08:00:00+00', 'Payment A',               65.0, TRUE,  'structuring'),
  ('TXN-011', 'ACC-004', 'ACC-006', 9700.00,  'USD', '2025-04-05 08:30:00+00', 'Payment B',               68.0, TRUE,  'structuring'),
  ('TXN-012', 'ACC-004', 'ACC-006', 9600.00,  'USD', '2025-04-05 09:00:00+00', 'Payment C',               70.0, TRUE,  'structuring'),

  -- Normal legitimate business
  ('TXN-013', 'ACC-007', 'ACC-009', 300.00,   'USD', '2025-04-10 15:00:00+00', 'Gift',                    4.0,  FALSE, NULL),
  ('TXN-014', 'ACC-001', 'ACC-004', 2500.00,  'USD', '2025-04-12 10:00:00+00', 'Contract payment',        12.0, FALSE, NULL),
  ('TXN-015', 'ACC-002', 'ACC-005', 600.00,   'USD', '2025-04-15 16:30:00+00', 'Monthly subscription',    6.0,  FALSE, NULL),

  -- High-risk single large transaction
  ('TXN-016', 'ACC-006', 'ACC-003', 50000.00, 'USD', '2025-05-01 23:45:00+00', 'Undisclosed transfer',    95.0, TRUE,  'high_risk'),

  -- Velocity anomaly
  ('TXN-017', 'ACC-008', 'ACC-004', 1000.00,  'USD', '2025-05-10 06:00:00+00', 'Tx burst 1',              55.0, TRUE,  'velocity_anomaly'),
  ('TXN-018', 'ACC-008', 'ACC-004', 1000.00,  'USD', '2025-05-10 06:05:00+00', 'Tx burst 2',              58.0, TRUE,  'velocity_anomaly'),
  ('TXN-019', 'ACC-008', 'ACC-004', 1000.00,  'USD', '2025-05-10 06:10:00+00', 'Tx burst 3',              60.0, TRUE,  'velocity_anomaly'),
  ('TXN-020', 'ACC-008', 'ACC-004', 1000.00,  'USD', '2025-05-10 06:15:00+00', 'Tx burst 4',              62.0, TRUE,  'velocity_anomaly')
ON CONFLICT (transaction_ref) DO NOTHING;

-- Insert fraud alerts for flagged transactions
INSERT INTO fraud_alerts (transaction_id, alert_type, severity, message, details) VALUES
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-005'), 'rapid_movement',    'high',     'Funds moved within 15 minutes of receipt',              '{"time_gap_minutes": 15, "amount": 15000}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-006'), 'rapid_movement',    'high',     'Immediate re-forwarding of received funds',             '{"time_gap_minutes": 15, "amount": 14500}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-007'), 'rapid_movement',    'critical', 'Chain of rapid transfers detected across 3 accounts',   '{"chain_length": 3, "total_amount": 43500}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-008'), 'circular_flow',     'critical', 'Circular money flow: ACC-010 → ACC-003 → ACC-006 → ACC-008 → ACC-010', '{"cycle_accounts": ["ACC-003","ACC-006","ACC-008","ACC-010"]}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-009'), 'circular_flow',     'critical', 'Repeated circular pattern between same accounts',       '{"cycle_count": 2}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-010'), 'structuring',       'high',     'Multiple transactions just below $10,000 reporting threshold', '{"count": 3, "total": 29100}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-011'), 'structuring',       'high',     'Continued structuring pattern from same sender',        '{"count": 3, "total": 29100}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-012'), 'structuring',       'high',     'Third structured payment in sequence',                  '{"count": 3, "total": 29100}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-016'), 'high_risk',         'critical', 'Large undisclosed transfer at unusual hour (23:45)',     '{"amount": 50000, "hour": 23}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-017'), 'velocity_anomaly',  'medium',   'Burst of 4 identical transactions in 15-minute window', '{"count": 4, "window_minutes": 15}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-018'), 'velocity_anomaly',  'medium',   'Part of velocity burst pattern',                        '{"count": 4, "window_minutes": 15}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-019'), 'velocity_anomaly',  'high',     'Escalating velocity burst',                             '{"count": 4, "window_minutes": 15}'),
  ((SELECT id FROM transactions WHERE transaction_ref = 'TXN-020'), 'velocity_anomaly',  'high',     'Final transaction in velocity burst cluster',            '{"count": 4, "window_minutes": 15}');

-- Insert a sample report
INSERT INTO reports (title, report_type, date_range_start, date_range_end, total_transactions, total_flagged, total_accounts, avg_risk_score, findings) VALUES
  ('Q2 2025 Fraud Analysis', 'summary', '2025-04-01', '2025-06-30', 20, 12, 10, 48.5,
   '[
     {"type": "circular_flow", "description": "Circular money flow detected between ACC-003, ACC-006, ACC-008, ACC-010", "severity": "critical"},
     {"type": "structuring", "description": "Structuring pattern: 3 sub-$10K transactions from ACC-004 to ACC-006", "severity": "high"},
     {"type": "velocity_anomaly", "description": "Velocity burst: 4 identical $1,000 transfers from ACC-008 in 15 minutes", "severity": "high"},
     {"type": "high_risk", "description": "Single $50,000 undisclosed transfer at 23:45 from ACC-006 to ACC-003", "severity": "critical"}
   ]'::jsonb);
