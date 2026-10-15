import { chromium } from "playwright";

const viewports = [
  { name: "Mobile", width: 390, height: 844 },
  { name: "Mobile-Small", width: 360, height: 740 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1280, height: 800 },
  { name: "Desktop-Wide", width: 1440, height: 900 },
];

const routes = [
  { path: "/", name: "Home" },
  { path: "/map", name: "World Map" },
  { path: "/play/w1-l1", name: "Gameplay W1-L1" },
  { path: "/play/w2-l1", name: "Gameplay W2-L1 (Loops)" },
  { path: "/grimoire", name: "Grimoire" },
  { path: "/profile", name: "Profile" },
  { path: "/login", name: "Login" },
];

async function runAudit() {
  console.log("Memulai Audit Visual & Responsif dengan Playwright...\n");
  let browser;
  try {
    browser = await chromium.launch({ channel: "msedge", headless: true });
  } catch {
    try {
      browser = await chromium.launch({ channel: "chrome", headless: true });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }
  const results = [];

  for (const vp of viewports) {
    console.log(`\n=== PENGUJIAN VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    for (const route of routes) {
      const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
      const url = `${baseUrl}${route.path}`;
      const errors = [];
      const warnings = [];

      page.on("pageerror", (err) => {
        errors.push(`Page error: ${err.message}`);
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(`Console error: ${msg.text()}`);
        }
      });

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(500);

        // 1. Cek Horizontal Overflow
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasOverflow = scrollWidth > clientWidth;

          let overflowingElements = [];
          if (hasOverflow) {
            const allElements = document.querySelectorAll("*");
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientWidth + 2) {
                overflowingElements.push({
                  tag: el.tagName,
                  className: (el.className || "").toString().slice(0, 50),
                  right: Math.round(rect.right),
                  clientWidth,
                });
                if (overflowingElements.length >= 3) break;
              }
            }
          }

          return { hasOverflow, scrollWidth, clientWidth, overflowingElements };
        });

        if (overflow.hasOverflow) {
          errors.push(
            `Horizontal overflow terdeteksi! scrollWidth: ${overflow.scrollWidth}px > clientWidth: ${overflow.clientWidth}px. Elements: ${JSON.stringify(overflow.overflowingElements)}`
          );
        }

        // 2. Cek Elemen Gambar Rusak
        const brokenImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll("img"));
          return imgs
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.src);
        });

        if (brokenImages.length > 0) {
          errors.push(`Gambar rusak ditemukan: ${brokenImages.join(", ")}`);
        }

        // 3. Cek Target Interaksi Terlalu Kecil (dibawah 32px pada mobile)
        if (vp.width <= 480) {
          const smallButtons = await page.evaluate(() => {
            const buttons = Array.from(
              document.querySelectorAll("button, a[role='button']")
            );
            return buttons
              .map((b) => {
                const rect = b.getBoundingClientRect();
                return {
                  text: (b.innerText || b.getAttribute("aria-label") || "").trim().slice(0, 20),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                };
              })
              .filter((b) => b.width > 0 && b.height > 0 && (b.width < 32 || b.height < 32));
          });

          if (smallButtons.length > 0) {
            warnings.push(
              `Target interaktif < 32px: ${smallButtons.map((b) => `[${b.text}: ${b.width}x${b.height}]`).slice(0, 3).join(", ")}`
            );
          }
        }

        results.push({
          viewport: vp.name,
          route: route.name,
          url: route.path,
          status: errors.length === 0 ? "PASSED" : "FAILED",
          errors,
          warnings,
        });

        console.log(
          `  ${errors.length === 0 ? "✓" : "✗"} [${vp.name}] ${route.name} (${route.path}): ${errors.length === 0 ? "PASSED" : "FAILED"}`
        );
        if (errors.length > 0) {
          errors.forEach((e) => console.log(`     - Error: ${e}`));
        }
        if (warnings.length > 0) {
          warnings.forEach((w) => console.log(`     - Warning: ${w}`));
        }
      } catch (e) {
        console.log(`  ✗ [${vp.name}] ${route.name} ERROR GOTO: ${e.message}`);
        results.push({
          viewport: vp.name,
          route: route.name,
          url: route.path,
          status: "FAILED",
          errors: [e.message],
          warnings: [],
        });
      }
    }

    await page.close();
  }

  await browser.close();

  const failedCount = results.filter((r) => r.status === "FAILED").length;
  console.log(`\n========================================`);
  console.log(`HASIL AKHIR AUDIT: ${results.length - failedCount} PASSED, ${failedCount} FAILED`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error("Audit runner gagal:", err);
  process.exit(1);
});
