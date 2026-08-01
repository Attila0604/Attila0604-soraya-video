// Nimmt die Live-App als echtes Bildschirm-VIDEO auf (Playwright recordVideo):
// scrollt + klickt sich durch die Bereiche -> public/app-tour.webm + tour.json
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "https://soraya-web.vercel.app";
const cfg = JSON.parse(fs.readFileSync("shots.config.json", "utf-8"));
const captions = cfg.captions || [];

const pub = "public";
const recDir = path.join(pub, "_rec");
fs.mkdirSync(recDir, { recursive: true });

const phone = devices["iPhone 13 Pro"];
const browser = await chromium.launch();
const context = await browser.newContext({
  ...phone,
  recordVideo: { dir: recDir, size: { width: 390, height: 844 } },
});
const page = await context.newPage();

const t0 = Date.now();
try {
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
} catch (e) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
}
await page.waitForTimeout(2500);

// Grauen Browser-Hintergrund dunkel einfärben (sonst blitzt er unten durch)
// und Scrollbalken ausblenden
try {
  await page.addStyleTag({
    content: `html, body, #__next, #root, main {
      background:#0A0B1E !important;
      min-height:100% !important;
    }
    *::-webkit-scrollbar { display:none !important; }`,
  });
} catch (e) {
  console.log("styleTag fail:", e.message);
}
await page.waitForTimeout(400);

const smoothScroll = async (to, step, delay) => {
  await page.evaluate(
    async ({ to, step, delay }) => {
      const start = window.scrollY;
      const dir = to > start ? 1 : -1;
      for (let y = start; dir > 0 ? y <= to : y >= to; y += dir * step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, delay));
      }
    },
    { to, step, delay }
  );
};

const items = [];
for (const cap of captions) {
  const at = (Date.now() - t0) / 1000; // Zeitpunkt im Video (Sekunden)
  items.push({ text: cap.text, at });

  if (cap.nav) {
    try {
      await page.getByText(cap.nav, { exact: true }).last().click({ timeout: 8000 });
    } catch (e) {
      console.log("nav fail:", cap.nav, "-", e.message);
    }
    await page.waitForTimeout(1400);
  }
  // Bewegung erzeugen: sanft runter, kurz halten, wieder rauf
  await smoothScroll(650, 16, 26);
  await page.waitForTimeout(900);
  await smoothScroll(0, 18, 22);
  await page.waitForTimeout(700);
}

const video = page.video();
await page.close();
await context.close();
await browser.close();

const src = await video.path();
fs.copyFileSync(src, path.join(pub, "app-tour.webm"));

const trim = Math.max(0, (items[0]?.at ?? 0) - 0.4); // Ladephase am Anfang wegschneiden
fs.writeFileSync(path.join(pub, "tour.json"), JSON.stringify({ trim, items }, null, 2));
console.log("app-tour.webm + tour.json geschrieben, trim =", trim.toFixed(2), "s");
