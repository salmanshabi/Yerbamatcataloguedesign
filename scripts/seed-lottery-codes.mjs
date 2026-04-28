#!/usr/bin/env node

/**
 * Seeds lottery codes into a Supabase project (production or remote).
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/seed-lottery-codes.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const codes = JSON.parse(readFileSync(join(__dirname, 'lottery-codes.json'), 'utf-8'));
const rows = codes.map((code) => ({ code }));

// Insert in batches of 200
const BATCH_SIZE = 200;
let inserted = 0;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from('lottery_codes').insert(batch);
  if (error) {
    console.error(`Error inserting batch at offset ${i}:`, error.message);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`Inserted ${inserted}/${rows.length} codes`);
}

console.log(`Done. Seeded ${inserted} lottery codes.`);
