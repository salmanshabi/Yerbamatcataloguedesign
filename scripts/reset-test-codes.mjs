#!/usr/bin/env node

/**
 * Resets all test lottery codes so they can be reused for QA.
 *
 * 1. Deletes lottery_entries linked to test codes
 * 2. Marks test codes as unused (is_used = false, used_at = NULL)
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/reset-test-codes.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// 1. Find all test code IDs
const { data: testCodes, error: fetchError } = await supabase
  .from('lottery_codes')
  .select('id, code')
  .eq('is_test', true);

if (fetchError) {
  console.error('Error fetching test codes:', fetchError.message);
  process.exit(1);
}

if (!testCodes || testCodes.length === 0) {
  console.log('No test codes found.');
  process.exit(0);
}

const testCodeIds = testCodes.map((c) => c.id);
console.log(`Found ${testCodes.length} test codes: ${testCodes.map((c) => c.code).join(', ')}`);

// 2. Delete lottery entries linked to test codes
const { error: deleteError, count } = await supabase
  .from('lottery_entries')
  .delete({ count: 'exact' })
  .in('code_id', testCodeIds);

if (deleteError) {
  console.error('Error deleting test entries:', deleteError.message);
  process.exit(1);
}

console.log(`Deleted ${count ?? 0} test entries.`);

// 3. Reset test codes to unused
const { error: resetError } = await supabase
  .from('lottery_codes')
  .update({ is_used: false, used_at: null })
  .eq('is_test', true);

if (resetError) {
  console.error('Error resetting test codes:', resetError.message);
  process.exit(1);
}

console.log('All test codes reset to unused. Ready for QA.');
