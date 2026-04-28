#!/usr/bin/env node
/**
 * send-to-figma.mjs
 *
 * Renders pages from localhost using Puppeteer, then sends the full
 * rendered HTML + CSS to the html.to.design API.
 *
 * Usage:
 *   API_KEY=your_key node scripts/send-to-figma.mjs
 *   API_KEY=your_key node scripts/send-to-figma.mjs http://localhost:5173 /products
 *
 * Requirements:
 *   npm install -D puppeteer
 */

import puppeteer from "puppeteer";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// ─── Configuration ────────────────────────────────────────────────────────────
const API_KEY = process.env.API_KEY || "<YOUR_KEY_HERE>";
const BASE_URL = process.argv[2] || "http://localhost:5173";

// Pages to export  (add more routes here as needed)
const PAGES = process.argv[3]
  ? [process.argv[3]] // single page passed as CLI arg
  : ["/", "/#products", "/#benefits", "/#partnership"]; // all site sections

const OUTPUT_DIR = "./figma-exports";
// ─────────────────────────────────────────────────────────────────────────────

if (API_KEY === "<YOUR_KEY_HERE>") {
  console.error("❌  No API key found.");
  console.error(
    "    Run with:  API_KEY=your_key node scripts/send-to-figma.mjs",
  );
  console.error("    Get a key at: https://www.to.design/api");
  process.exit(1);
}

async function getRenderedPage(page, url) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

  // Wait a bit extra for animations / lazy-loaded content
  await new Promise((r) => setTimeout(r, 1500));

  // Grab fully rendered HTML
  const HTML = await page.content();

  // Collect all CSS from stylesheets (inline + external)
  const CSS = await page.evaluate(() => {
    let styles = "";
    for (const sheet of document.styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        styles += rules.map((r) => r.cssText).join("\n") + "\n";
      } catch {
        // Cross-origin sheets are inaccessible — skip silently
      }
    }
    return styles;
  });

  return { HTML, CSS };
}

async function sendToAPI(HTML, CSS, label) {
  console.log(`  → Sending "${label}" to html.to.design API...`);

  const res = await fetch("https://api.to.design/html", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      html: `<style>${CSS}</style>${HTML}`,
      clip: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const { model, images } = await res.json();
  return { model, images };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`\n🚀  Figma Export — ${BASE_URL}`);
  console.log(`    Pages: ${PAGES.join(", ")}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    for (const pagePath of PAGES) {
      const label =
        pagePath === "/"
          ? "home"
          : pagePath.replace(/\//g, "_").replace(/^_/, "");
      const fullUrl = `${BASE_URL}${pagePath}`;

      console.log(`📄  Capturing: ${fullUrl}`);
      const { HTML, CSS } = await getRenderedPage(page, fullUrl);

      const { model, images } = await sendToAPI(HTML, CSS, label);

      // Save output so you can inspect / retry without re-running
      const outFile = path.join(OUTPUT_DIR, `${label}.json`);
      await writeFile(outFile, JSON.stringify({ model, images }, null, 2));

      console.log(`  ✅  Saved → ${outFile}`);
      console.log(
        `      Layers: ${model?.children?.length ?? "?"}, Images: ${images?.length ?? 0}\n`,
      );
    }
  } finally {
    await browser.close();
  }

  console.log("🎉  Done! Open your Figma plugin (html.to.design) and choose");
  console.log(`    File > Import JSON to load the files from ${OUTPUT_DIR}/\n`);
}

main().catch((err) => {
  console.error("\n❌  Fatal:", err.message);
  process.exit(1);
});
