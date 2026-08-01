// Öffnet die Live-App (Single-Page-App), klickt die untere Navi durch
// und macht von jedem Bereich einen Screenshot -> public/shots/ + manifest.json
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "https://soraya-web.vercel.app";
const config = JSON.parse(fs.readFileSync("shots.config.json", "utf-8"));

const outDir = path.join("public", "shots");
fs.mkdirSync(outDir, { recursive: true });

const phone = devices["iPhone 13 Pro"];
const browser = await chromium.launch();
const context = await browser.newContext({ ...phone });
const page = await context.newPage();

const manifest = [];
let i = 0;
for (const shot of config) {
  // Bei jedem Screen frisch laden, damit der Zustand sauber ist
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  }
  await page.waitForTimeout(2500); // Laden / Animationen

  // Auf den Navi-Knopf klicken (letztes Vorkommen = untere Leiste)
  if (shot.click) {
    try {
      await page.getByText(shot.click, { exact: true }).last().click({ timeout: 8000 });
      await page.waitForTimeout(1800);
    } catch (e) {
      console.log("Konnte nicht klicken:", shot.click, "-", e.message);
    }
  }

  const file = `shot-${String(i).padStart(2, "0")}.png`;
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  manifest.push({ file, caption: shot.caption || "" });
  console.log("captured:", shot.click || "Home", "->", file);
  i++;
}

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("manifest written with", manifest.length, "shots");
await browser.close();
