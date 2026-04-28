#!/usr/bin/env node

/**
 * Generates exactly 1002 unique 6-character coupon codes.
 * Character set excludes ambiguous characters (0/O, 1/I/L).
 * Uses crypto.randomInt() for cryptographic randomness.
 *
 * Usage: node scripts/generate-lottery-codes.mjs
 * Output: scripts/lottery-codes.json
 */

import { randomInt } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TARGET_COUNT = 1002;
const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 30 chars, no 0/O/1/I/L
const CODE_LENGTH = 6;

function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[randomInt(CHARSET.length)];
  }
  return code;
}

const codes = new Set();
while (codes.size < TARGET_COUNT) {
  codes.add(generateCode());
}

const codesArray = [...codes];
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, 'lottery-codes.json');

writeFileSync(outputPath, JSON.stringify(codesArray, null, 2));
console.log(`Generated ${codesArray.length} unique codes → ${outputPath}`);
