-- ============================================================
-- Allow the same phone number to enter the lottery multiple times.
-- Drops the uniqueness constraint and removes the DUPLICATE_PHONE
-- check from the redemption RPC. Code-level uniqueness still
-- prevents the same physical code from being redeemed twice.
-- ============================================================

DROP INDEX IF EXISTS idx_lottery_entries_phone;

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

  -- 1) TEST CODE OVERRIDE
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

  -- 2) CAMPAIGN STATE
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

  -- 4) RATE LIMIT
  IF (SELECT count(*) FROM lottery_entries WHERE submitted_at > now() - interval '1 minute') >= 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'RATE_LIMITED');
  END IF;

  -- 5) PRODUCTION REDEMPTION (no duplicate-phone check)
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
