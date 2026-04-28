# A/B testing coupon codes

**Seed:** `20260429`
**Generated:** 2026-04-28T07:45:08.021Z
**Total:** 10 test codes (override production logic via RPC)

| # | Code | Outcome | Type |
|---|------|---------|------|
| 1 | `7FLWB6` | 50₪ | Fixed |
| 2 | `NDJ3W3` | 100₪ | Fixed |
| 3 | `2CGD4D` | 200₪ | Fixed |
| 4 | `A333XA` | 500₪ | Fixed |
| 5 | `83MJZW` | 1000₪ | Fixed |
| 6 | `NL3JF9` | Non-winner | Fixed |
| 7 | `4EWM7H` | 100₪ | Random (undisclosed to QA) |
| 8 | `V7L5K4` | 200₪ | Random (undisclosed to QA) |
| 9 | `HSJ8QL` | Non-winner | Random (undisclosed to QA) |
| 10 | `H95EYA` | Non-winner | Random (undisclosed to QA) |

## Disable / remove

- Disable one code: `UPDATE lottery_test_codes SET is_active = false WHERE code = 'XXXXXX';`
- Disable all (instant kill switch): `UPDATE lottery_test_codes SET is_active = false;`
- Permanent removal at launch: drop the table + apply a follow-up migration that reverts the RPC to production-only logic.
