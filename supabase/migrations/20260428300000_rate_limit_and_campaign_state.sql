-- ============================================================
-- Bump rate limit (10 → 100/min) and add campaign-state kill switch
-- ============================================================

-- 1. Single-row state table (CHECK constraint enforces only one row)
CREATE TABLE IF NOT EXISTS lottery_campaign_state (
  id            integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_active     boolean NOT NULL DEFAULT true,
  ended_at      timestamptz,
  ended_reason  text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lottery_campaign_state ENABLE ROW LEVEL SECURITY;
-- No policies = deny all direct access; only RPC reads it.

-- 2. Seed the single row (idempotent)
INSERT INTO lottery_campaign_state (id, is_active)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Revoke direct anon access (defense in depth)
REVOKE SELECT, INSERT, UPDATE, DELETE ON lottery_campaign_state FROM anon, authenticated;

-- 4. Replace the RPC with: 100/min rate limit + campaign-state check
DROP FUNCTION IF EXISTS redeem_lottery_code(text, text, text, text, text);

CREATE OR REPLACE FUNCTION redeem_lottery_code(
  p_code       text,
  p_first_name text,
  p_last_name  text,
  p_phone      text,
  p_venue      text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_row    lottery_codes%ROWTYPE;
  v_test_row    lottery_test_codes%ROWTYPE;
  v_campaign    lottery_campaign_state%ROWTYPE;
  v_entry_id    uuid;
  v_clean_code  text;
  v_clean_phone text;
  v_clean_venue text;
BEGIN
  v_clean_code  := upper(trim(p_code));
  v_clean_phone := trim(p_phone);
  v_clean_venue := trim(p_venue);

  -- 1) TEST CODE OVERRIDE — bypasses everything (campaign state, rate limit, etc.)
  --    so QA can keep validating both "lottery active" and "lottery ended" paths.
  SELECT * INTO v_test_row
  FROM lottery_test_codes
  WHERE code = v_clean_code AND is_active = true;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'entry_id', NULL,
      'prize_amount', v_test_row.prize_amount,
      'is_test', true
    );
  END IF;

  -- 2) CAMPAIGN STATE — short-circuit if the lottery has ended.
  SELECT * INTO v_campaign FROM lottery_campaign_state WHERE id = 1;
  IF NOT FOUND OR NOT v_campaign.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'CAMPAIGN_ENDED');
  END IF;

  -- 3) FORMAT CHECKS
  IF length(v_clean_code) != 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CODE_FORMAT');
  END IF;

  IF trim(p_first_name) = '' OR trim(p_last_name) = '' OR v_clean_phone = '' OR v_clean_venue = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_FIELDS');
  END IF;

  -- 4) RATE LIMIT — bumped from 10/min to 100/min for launch-day safety
  IF (SELECT count(*) FROM lottery_entries WHERE submitted_at > now() - interval '1 minute') >= 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'RATE_LIMITED');
  END IF;

  -- 5) PRODUCTION REDEMPTION (unchanged from prior)
  SELECT * INTO v_code_row
  FROM lottery_codes
  WHERE code = v_clean_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'CODE_NOT_FOUND');
  END IF;

  IF v_code_row.is_used THEN
    RETURN jsonb_build_object('success', false, 'error', 'CODE_ALREADY_USED');
  END IF;

  IF EXISTS (SELECT 1 FROM lottery_entries WHERE phone = v_clean_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_PHONE');
  END IF;

  UPDATE lottery_codes
  SET is_used = true, used_at = now()
  WHERE id = v_code_row.id;

  INSERT INTO lottery_entries (code_id, first_name, last_name, phone, venue)
  VALUES (v_code_row.id, trim(p_first_name), trim(p_last_name), v_clean_phone, v_clean_venue)
  RETURNING id INTO v_entry_id;

  RETURN jsonb_build_object(
    'success', true,
    'entry_id', v_entry_id,
    'prize_amount', v_code_row.prize_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text) TO authenticated;
