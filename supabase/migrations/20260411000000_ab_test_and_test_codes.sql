-- ============================================================
-- A/B Test Support + Test Codes Migration
-- ============================================================

-- 1a. Add is_test flag to lottery_codes
ALTER TABLE lottery_codes ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- 1b. Add variant tracking to lottery_entries
ALTER TABLE lottery_entries ADD COLUMN variant text;

-- 1c. Make name/email nullable for Variant B (simplified form: code + phone only)
ALTER TABLE lottery_entries ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE lottery_entries ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE lottery_entries ALTER COLUMN email DROP NOT NULL;

-- 1d. Insert 10 test codes (recognizable TST prefix, is_test = true)
INSERT INTO lottery_codes (code, is_test) VALUES
  ('TST001', true),
  ('TST002', true),
  ('TST003', true),
  ('TST004', true),
  ('TST005', true),
  ('TST006', true),
  ('TST007', true),
  ('TST008', true),
  ('TST009', true),
  ('TST010', true);

-- 1e. Drop old RPC (5-param signature)
DROP FUNCTION IF EXISTS redeem_lottery_code(text, text, text, text, text);

-- 1f. Create new variant-aware RPC
CREATE OR REPLACE FUNCTION redeem_lottery_code(
  p_code text,
  p_phone text,
  p_variant text DEFAULT 'A',
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_row lottery_codes%ROWTYPE;
  v_entry_id uuid;
  v_clean_code text;
  v_clean_email text;
  v_clean_phone text;
BEGIN
  -- Sanitize inputs
  v_clean_code := upper(trim(p_code));
  v_clean_phone := trim(p_phone);
  v_clean_email := CASE WHEN p_email IS NOT NULL THEN lower(trim(p_email)) ELSE NULL END;

  -- Validate code format (always required)
  IF length(v_clean_code) != 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CODE_FORMAT');
  END IF;

  -- Validate phone (always required)
  IF v_clean_phone = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_FIELDS');
  END IF;

  -- Variant A: require all fields
  IF p_variant = 'A' THEN
    IF v_clean_email IS NULL OR v_clean_email = ''
       OR trim(COALESCE(p_first_name, '')) = ''
       OR trim(COALESCE(p_last_name, '')) = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'MISSING_FIELDS');
    END IF;

    -- Email format check (Variant A only)
    IF v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
      RETURN jsonb_build_object('success', false, 'error', 'INVALID_EMAIL');
    END IF;
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

  -- Duplicate email check (only if email provided, i.e. Variant A)
  IF v_clean_email IS NOT NULL AND v_clean_email != '' THEN
    IF EXISTS (SELECT 1 FROM lottery_entries WHERE email = v_clean_email) THEN
      RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_EMAIL');
    END IF;
  END IF;

  -- Duplicate phone check (skip for test codes to allow QA reuse)
  IF NOT v_code_row.is_test THEN
    IF EXISTS (SELECT 1 FROM lottery_entries WHERE phone = v_clean_phone) THEN
      RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_PHONE');
    END IF;
  END IF;

  -- Mark code as used
  UPDATE lottery_codes
  SET is_used = true, used_at = now()
  WHERE id = v_code_row.id;

  -- Insert lottery entry
  INSERT INTO lottery_entries (code_id, first_name, last_name, phone, email, variant)
  VALUES (
    v_code_row.id,
    CASE WHEN trim(COALESCE(p_first_name, '')) = '' THEN NULL ELSE trim(p_first_name) END,
    CASE WHEN trim(COALESCE(p_last_name, '')) = '' THEN NULL ELSE trim(p_last_name) END,
    v_clean_phone,
    CASE WHEN v_clean_email = '' THEN NULL ELSE v_clean_email END,
    COALESCE(p_variant, 'A')
  )
  RETURNING id INTO v_entry_id;

  RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id);
END;
$$;

-- 1g. Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text, text) TO authenticated;
