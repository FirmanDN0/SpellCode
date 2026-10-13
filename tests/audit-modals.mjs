import { chromium } from "playwright";

async function testModalAndGameplay() {
  console.log("Memulai Pengujian Modal dan Interaksi Gameplay di Layar Kecil (360x740)...\n");

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 360, height: 740 },
  });

  // 1. Uji Modal di World Map (Locked Level Modal)
  console.log("1. Menguji Modal Dialog pada Layar 360px di /map...");
  await page.goto("http://localhost:3000/map", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  // Klik World 2 yang terkunci
  const world2Btn = page.locator("button:has-text('World 2: Gua Kristal')");
  await world2Btn.click();
  await page.waitForTimeout(400);

  // Cek apakah Modal muncul dan tidak overflow layar
  const modalBox = page.locator("div[role='dialog'] > div").first();
  const isModalVisible = await modalBox.isVisible();
  if (!isModalVisible) {
    throw new Error("Modal dialog tidak muncul!");
  }

  const boxRect = await modalBox.boundingBox();
  console.log(`   Ukuran Modal: width=${boxRect.width}px, height=${boxRect.height}px, x=${boxRect.x}px, y=${boxRect.y}px`);

  if (boxRect.x < 0 || boxRect.x + boxRect.width > 360 + 2) {
    throw new Error(`Modal dialog overflow horizontal! right: ${boxRect.x + boxRect.width} > 360`);
  }
  if (boxRect.y < 0 || boxRect.height > 740) {
    throw new Error(`Modal dialog overflow vertikal! height: ${boxRect.height} > 740`);
  }
  console.log("   ✓ Modal pas di dalam viewport 360x740 tanpa clipping.");

  // Tutup modal dengan tombol Escape keyboard
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const isModalClosed = !(await modalBox.isVisible());
  if (!isModalClosed) {
    throw new Error("Tombol Escape gagal menutup modal!");
  }
  console.log("   ✓ Keyboard Escape menutup modal dengan benar.");

  // 2. Uji Interaktivitas Gameplay di /play/w1-l1
  console.log("\n2. Menguji Interaksi Gameplay di /play/w1-l1 pada Layar 360px...");
  await page.goto("http://localhost:3000/play/w1-l1", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  // Cek tombol rune di rak
  const addStepBtn = page.locator("button:has-text('Maju 1 Langkah')").first();
  await addStepBtn.click();
  await page.waitForTimeout(200);
  await addStepBtn.click();
  await page.waitForTimeout(200);

  const addTorchBtn = page.locator("button:has-text('Nyalakan Lentera')").first();
  await addTorchBtn.click();
  await page.waitForTimeout(200);

  // Cek jumlah blok di meja mantra
  const deckTitle = page.locator("text=3 Blok");
  const has3Blocks = await deckTitle.isVisible();
  if (!has3Blocks) {
    throw new Error("Balok instruksi tidak bertambah di meja mantra!");
  }
  console.log("   ✓ Berhasil menyusun 3 blok mantra (Maju, Maju, Nyalakan Lentera).");

  // Klik tombol Rapalkan Mantra
  const runBtn = page.locator("button:has-text('Rapalkan Mantra')");
  await runBtn.click();
  console.log("   ✓ Tombol Rapalkan Mantra berhasil diklik.");

  // Tunggu simulasi selesai dan Victory Modal muncul
  await page.waitForTimeout(2500);

  const victoryModal = page.locator("text=Mantra Selesai!");
  const isVictoryVisible = await victoryModal.isVisible();
  if (!isVictoryVisible) {
    throw new Error("Victory modal tidak muncul setelah eksekusi mantra!");
  }
  console.log("   ✓ Victory modal berhasil muncul setelah penyihir menyalakan lentera dan portal!");

  // Cek ukuran Victory Modal di layar 360px
  const vBox = await page.locator("div[role='dialog'] > div").first().boundingBox();
  if (vBox.x < 0 || vBox.x + vBox.width > 360 + 2) {
    throw new Error(`Victory modal overflow horizontal! right: ${vBox.x + vBox.width} > 360`);
  }
  console.log("   ✓ Victory modal pas di dalam viewport 360x740.");

  await browser.close();
  console.log("\n========================================");
  console.log("SEMUA PENGUJIAN MODAL & GAMEPLAY SUKSES!");
  console.log("========================================");
}

testModalAndGameplay().catch((err) => {
  console.error("Pengujian modal & gameplay gagal:", err);
  process.exit(1);
});
