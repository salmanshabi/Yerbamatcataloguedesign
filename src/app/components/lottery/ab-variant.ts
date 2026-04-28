const STORAGE_KEY = 'lottery_ab_variant';

export type Variant = 'A' | 'B';

/**
 * Returns the A/B test variant for this user.
 *
 * Currently locked to Variant A (full form).
 * To enable 50/50 A/B testing, uncomment the randomization block below.
 */
export function getVariant(): Variant {
  // -- A/B test disabled: all users see Variant A --
  return 'A';

  // -- Uncomment below to enable 50/50 A/B split --
  // try {
  //   const stored = localStorage.getItem(STORAGE_KEY);
  //   if (stored === 'A' || stored === 'B') return stored;
  //
  //   const variant: Variant = Math.random() < 0.5 ? 'A' : 'B';
  //   localStorage.setItem(STORAGE_KEY, variant);
  //   return variant;
  // } catch {
  //   return 'A';
  // }
}
