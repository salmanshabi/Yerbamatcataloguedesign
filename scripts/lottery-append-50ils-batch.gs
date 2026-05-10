/**
 * One-off Google Apps Script — appends 50 new 50₪ winner codes to the
 * master coupon-codes sheet (1Q_y6OznWauz-B_U91Z0_dB6nGe3ijclBKtOGPWbfKus).
 *
 * HOW TO RUN
 * ----------
 * 1. Open the spreadsheet.
 * 2. Extensions → Apps Script. A blank project opens.
 * 3. Replace whatever's in Code.gs with this file's contents.
 * 4. Click Save (disk icon).
 * 5. Click Run ▶ next to `appendNewCodes`. First run: approve permissions
 *    (Google asks because the script writes to your sheet).
 * 6. You'll see a popup confirming how many rows were added.
 *
 * The codes are also stored in scripts/lottery-codes-50ils-batch-2026-05-11.json
 * for record-keeping, and were already inserted into Supabase prod on 2026-05-11.
 */

function appendNewCodes() {
  const CODES = [
    'EN32B6', '5V2C2R', 'M6KA4G', 'UT9VX6', 'VVYVP2',
    'KF5JP9', 'A9FU8W', 'JRTRSZ', '9WRBX6', 'SUU2H3',
    'V9MCZA', '3X88Y7', '2YU2HG', 'HPYAJ7', 'F6GQTU',
    'B34V8B', 'BUZ8XN', 'V7B439', '9ZZPB2', 'WUCXAK',
    'Q3G4R9', 'VUQ6AC', 'TMRRV2', '4FPRGS', '4JYPKV',
    '8KTRA5', 'A5HXW3', '964J4A', 'ZV2E56', 'YTE7NE',
    'SRCGHJ', '2MUKP6', 'KF9QYR', 'MGSZ3B', '4HA8NC',
    'ATWN35', '7C8J6H', 'HPWKG3', 'HDQPAR', 'H6A7P6',
    'K9NAEX', '92BC6H', '5MDZ6J', 'HKC6RY', 'M8XGGS',
    '84WXCU', 'A3C7Q8', '4DDPQ6', 'B66ZQE', '6V8T67'
  ];

  const PRIZE = 50;
  const IS_WINNER = 'YES';

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; // first tab (gid=0)
  const lastRow = sheet.getLastRow();

  // Bail loudly if any of these codes already exist (idempotency guard).
  const existingCodes = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
  const dupes = CODES.filter(c => existingCodes.includes(c));
  if (dupes.length > 0) {
    throw new Error('Refusing to append — these codes already exist in the sheet: ' + dupes.join(', '));
  }

  // Find the highest existing # so we can continue the sequence.
  const existingNums = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const maxNum = existingNums.reduce(
    (m, v) => (typeof v === 'number' && v > m ? v : m),
    0
  );

  const rows = CODES.map((code, i) => [maxNum + i + 1, code, PRIZE, IS_WINNER]);
  sheet.getRange(lastRow + 1, 1, rows.length, 4).setValues(rows);

  SpreadsheetApp.getUi().alert(
    `Appended ${rows.length} codes (#${maxNum + 1}–#${maxNum + rows.length}).`
  );
}
