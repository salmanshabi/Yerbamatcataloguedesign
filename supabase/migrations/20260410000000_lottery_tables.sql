-- ============================================================
-- Lottery Campaign Tables, RLS, and Redemption RPC
-- ============================================================

-- 1. Coupon codes table
CREATE TABLE lottery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code char(6) NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lottery_codes_code_unique UNIQUE (code)
);

CREATE INDEX idx_lottery_codes_is_used ON lottery_codes (is_used) WHERE NOT is_used;

-- 2. Lottery entries table
CREATE TABLE lottery_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES lottery_codes(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_lottery_entries_email ON lottery_entries (email);
CREATE UNIQUE INDEX idx_lottery_entries_phone ON lottery_entries (phone);
CREATE INDEX idx_lottery_entries_code_id ON lottery_entries (code_id);

-- 3. Row Level Security — deny all direct access
ALTER TABLE lottery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_entries ENABLE ROW LEVEL SECURITY;
-- No policies = deny all for anon/authenticated roles

-- 4. Atomic redemption function
CREATE OR REPLACE FUNCTION redeem_lottery_code(
  p_code text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_email text
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
  v_clean_email := lower(trim(p_email));
  v_clean_phone := trim(p_phone);

  -- Validate required fields
  IF length(v_clean_code) != 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CODE_FORMAT');
  END IF;

  IF v_clean_email = '' OR trim(p_first_name) = '' OR trim(p_last_name) = '' OR v_clean_phone = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_FIELDS');
  END IF;

  -- Basic email format check
  IF v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_EMAIL');
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

  -- Check duplicate email
  IF EXISTS (SELECT 1 FROM lottery_entries WHERE email = v_clean_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_EMAIL');
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
  INSERT INTO lottery_entries (code_id, first_name, last_name, phone, email)
  VALUES (v_code_row.id, trim(p_first_name), trim(p_last_name), v_clean_phone, v_clean_email)
  RETURNING id INTO v_entry_id;

  RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id);
END;
$$;

-- 5. Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION redeem_lottery_code(text, text, text, text, text) TO authenticated;
