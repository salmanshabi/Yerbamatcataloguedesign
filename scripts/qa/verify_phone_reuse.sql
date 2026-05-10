-- ============================================================
-- QA: verify that the same phone can redeem multiple real codes
-- after migration 20260511000000_allow_phone_reuse.sql is applied.
--
-- HOW TO USE
-- ----------
-- 1. Apply the migration first:           supabase db push
-- 2. Run STEP 1 — picks 5 unused codes and prints them.
-- 3. Submit each printed code via lottery.herbalookcatalogue.com
--    using the SAME phone number (e.g. 0500000999) and dummy
--    name/venue values.
-- 4. Run STEP 2 — confirms 5 entries exist for that phone and
--    that no duplicate-phone error was raised.
-- 5. Run STEP 3 (cleanup) when done to roll back the test data.
--
-- NOTE: This uses real production codes from `lottery_codes`,
-- not the `lottery_test_codes` table, because the test-code path
-- short-circuits before the duplicate-phone check — using it
-- would prove nothing about the policy change.
-- ============================================================


-- ─────────────── STEP 1: pick 5 unused QA codes ───────────────
-- Tag them with a sentinel so we can find + clean them up later.
-- (We don't have a "reserved" column, so we use used_at = NULL
-- and rely on the sentinel phone number below for cleanup.)

SELECT code
FROM lottery_codes
WHERE is_used = false
  AND COALESCE(is_test, false) = false
ORDER BY created_at
LIMIT 5;


-- ─────────────── STEP 2: verify after manual submission ───────
-- Replace '0500000999' with whatever phone you submitted with.

SELECT
  count(*)               AS entries_for_phone,
  array_agg(c.code ORDER BY e.submitted_at) AS codes_used,
  min(e.submitted_at)    AS first_at,
  max(e.submitted_at)    AS last_at
FROM lottery_entries e
JOIN lottery_codes   c ON c.id = e.code_id
WHERE e.phone = '0500000999';

-- Expected: entries_for_phone = 5, codes_used = the 5 codes from STEP 1.
-- If you see fewer than 5, one of the submissions was rejected — check the
-- form's response in the browser console / network tab for the error code.


-- ─────────────── STEP 3: cleanup (run after QA passes) ────────
-- Deletes the 5 test entries and resets the codes to unused so
-- they can still be redeemed by real customers.
-- Replace '0500000999' with the phone you used in STEP 2.

WITH deleted AS (
  DELETE FROM lottery_entries
  WHERE phone = '0500000999'
  RETURNING code_id
)
UPDATE lottery_codes
SET is_used = false, used_at = NULL
WHERE id IN (SELECT code_id FROM deleted);
