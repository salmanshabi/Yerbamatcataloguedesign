-- ============================================================
-- Remove email field from lottery entries
-- ============================================================

-- 1. Drop old function signatures (both old A/B variants)
DROP FUNCTION IF EXISTS redeem_lottery_code(text, text, text, text, text);
DROP FUNCTION IF EXISTS redeem_lottery_code(text, text, text, text, text, text);

-- 2. Drop email unique index and column
DROP INDEX IF EXISTS idx_lottery_entries_email;
ALTER TABLE lottery_entries DROP COLUMN IF EXISTS email;

-- 3. Recreate redemption function without email
CREATE OR REPLACE FUNCTION redeem_lottery_code(
  p_code       text,
  p_first_name text,
  p_last_name  text,
  p_phone      text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_row   lottery_codes%ROWTYPE;
  v_entry_id   uuid;
  v_clean_code text;
  v_clean_phone text;
BEGIN
  v_clean_code  := upper(trim(p_code));
  v_clean_phone := trim(p_phone);

  -- Validate required fields
  IF length(v_clean_code) != 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CODE_FORMAT');
  END IF;

  IF trim(p_first_name) = '' OR trim(p_last_name) = '' OR v_clean_phone = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_FIELDS');
  END IF;

  -- Global rate limit: max 10 submissions per minute
  IF (SELECT count(*) FROM lottery_entries WHERE submitted_at > now() - interval '1 minute') >= 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'RATE_LIMITED');
  END IF;

  -- Lock the code row to prevent race conditions
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

  -- Check duplicate phone
  IF EXISTS (SELECT 1 FROM lottery_entries WHERE phone = v_clean_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_PHONE');
  END IF;

  -- Mark code as used
  UPDATE lottery_codes
  SET is_used = true, used_at = now()
  WHERE id = v_code_row.id;

  -- Insert lottery entry
  INSERT INTO lottery_entries (code_id, first_name, last_name, phone)
  VALUES (v_code_row.id, trim(p_first_name), trim(p_last_name), v_clean_phone)
  RETURNING id INTO v_entry_id;

  RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id);
END;
$$;

-- 4. Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text) TO authenticated;
