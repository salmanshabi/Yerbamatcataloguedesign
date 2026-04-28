-- ============================================================
-- Add venue (place of purchase) to lottery entries
-- ============================================================

-- 1. Drop the previous 4-arg signature
DROP FUNCTION IF EXISTS redeem_lottery_code(text, text, text, text);

-- 2. Add venue column (default '' so existing rows backfill cleanly)
ALTER TABLE lottery_entries ADD COLUMN IF NOT EXISTS venue text NOT NULL DEFAULT '';

-- 3. Recreate redemption function with venue param
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
  v_entry_id    uuid;
  v_clean_code  text;
  v_clean_phone text;
  v_clean_venue text;
BEGIN
  v_clean_code  := upper(trim(p_code));
  v_clean_phone := trim(p_phone);
  v_clean_venue := trim(p_venue);

  IF length(v_clean_code) != 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CODE_FORMAT');
  END IF;

  IF trim(p_first_name) = '' OR trim(p_last_name) = '' OR v_clean_phone = '' OR v_clean_venue = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_FIELDS');
  END IF;

  IF (SELECT count(*) FROM lottery_entries WHERE submitted_at > now() - interval '1 minute') >= 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'RATE_LIMITED');
  END IF;

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

  RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id);
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text) TO authenticated;
