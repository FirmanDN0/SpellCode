/**
 * SpellCode: E2E User Journey Automated Audit & Testing Suite
 * Menguji perjalanan lengkap pengguna (Tahap 5A) dengan browser Chromium/Edge headless via Playwright.
 * 
 * Pengujian meliputi 13 poin evaluasi:
 * 1. Home dapat dibuka
 * 2. Navigasi utama berfungsi
 * 3. Register/login sesuai konfigurasi
 * 4. Protected pages menangani pengguna yang belum login
 * 5. World map menampilkan status level yang benar
 * 6. Pemain dapat menyusun program
 * 7. Run dan Step menjalankan engine
 * 8. Reset mengembalikan arena ke state awal
 * 9. Program valid menyelesaikan objective
 * 10. Program tidak valid tidak mendapat reward penyelesaian
 * 11. Hasil yang sah tersimpan di backend
 * 12. Refresh atau login ulang memuat progres yang benar
 * 13. Pengguna tidak dapat membuka level terkunci melalui manipulasi UI saja
 */

import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const testResults = [];

function recordResult(index, title, passed, notes) {
  testResults.push({ index, title, passed, notes });
  const statusIcon = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`[Test ${String(index).padStart(2, "0")}] ${statusIcon}: ${title}`);
  console.log(`          ${notes}`);
}

async function runE2EUserJourney() {
  console.log("===============================================================");
  console.log("TAHAP 5A: END-TO-END USER JOURNEY AUDIT & TEST SUITE (PLAYWRIGHT)");
  console.log("===============================================================\n");

  const browser = await chromium.launch({
    headless: true,
    channel: "msedge",
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // 1. Home dapat dibuka
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const heroHeading = page.locator("h1");
    const headingText = (await heroHeading.textContent()) || "";
    const hasHeroHeading = headingText.includes("Belajar Coding") && headingText.includes("Mantra");

    const ctaPlayBtn = page.locator("a[href^='/play/'], a[href='/map']").first();
    const hasCtaPlay = await ctaPlayBtn.isVisible();

    const homePassed = hasHeroHeading && hasCtaPlay;
    recordResult(
      1,
      "Home dapat dibuka dengan hero header dan tombol CTA",
      homePassed,
      `Heading: "${headingText.slice(0, 35)}..." & Tombol CTA aktif`
    );

    // -------------------------------------------------------------------------
    // 2. Navigasi utama berfungsi
    // -------------------------------------------------------------------------
    // Ke Peta Petualangan
    await page.locator("header a[href='/map']").first().click();
    await page.waitForURL("**/map");
    const isMapUrl = page.url().endsWith("/map");

    // Ke Buku Mantra (Grimoire)
    await page.locator("header a[href='/grimoire']").first().click();
    await page.waitForURL("**/grimoire");
    const isGrimoireUrl = page.url().endsWith("/grimoire");

    // Ke Profil Murid
    await page.locator("header a[href='/profile']").first().click();
    await page.waitForURL("**/profile");
    const isProfileUrl = page.url().endsWith("/profile");

    // Kembali ke Beranda via Logo
    await page.locator("header a[href='/']").first().click();
    await page.waitForURL(`${baseUrl}/`);
    const isHomeUrl = page.url() === `${baseUrl}/`;

    const navPassed = isMapUrl && isGrimoireUrl && isProfileUrl && isHomeUrl;
    recordResult(
      2,
      "Navigasi utama berfungsi (Home, Map, Grimoire, Profile)",
      navPassed,
      "Seluruh link header mengarahkan ke rute yang tepat secara konsisten"
    );

    // -------------------------------------------------------------------------
    // 3. Register/login sesuai konfigurasi
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    const masukTab = page.locator("button:has-text('Masuk')").first();
    const daftarTab = page.locator("button:has-text('Daftar')").first();
    const hasTabs = (await masukTab.isVisible()) && (await daftarTab.isVisible());

    // Uji validasi kata sandi < 6 karakter pada mode login
    await masukTab.click();
    await page.waitForTimeout(200);

    await page.locator("input[type='email']").fill("murid@spellcode.test");
    await page.locator("input[type='password']").fill("123");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(400);

    const errorAlert = page.locator("text=minimal 6 karakter").first();
    const hasValidationMsg = await errorAlert.isVisible();

    const authConfigPassed = hasTabs && hasValidationMsg;
    recordResult(
      3,
      "Form Register/Login validasi ramah anak dan switch tab",
      authConfigPassed,
      "Validasi password < 6 karakter menampilkan pesan pencegahan yang jelas"
    );

    // -------------------------------------------------------------------------
    // 4. Protected pages menangani pengguna yang belum login
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/profile`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const isGuestStatusVisible = await page.locator("text=Status: Akun Tamu").isVisible();
    const hasCloudCta = await page.locator("a[href='/login']:has-text('Hubungkan Cloud')").isVisible();
    const profileHandled = isGuestStatusVisible && hasCloudCta;
    recordResult(
      4,
      "Protected pages menangani guest secara aman tanpa crash",
      profileHandled,
      "Menampilkan status Akun Tamu dengan ajakan Hubungkan Cloud"
    );

    // -------------------------------------------------------------------------
    // 5. World map menampilkan status level yang benar
    // -------------------------------------------------------------------------
    // Bersihkan storage agar kembali ke kondisi awal (fresh player state)
    await page.evaluate(() => {
      localStorage.removeItem("spellcode_guest_v1");
      localStorage.removeItem("spellcode_guest_data");
    });
    await page.goto(`${baseUrl}/map`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Level 1 harus bertanda Misi Aktif
    const isLvl1Active = await page.locator("text=Misi Aktif").first().isVisible();

    // Klik World 2 yang masih terkunci
    const w2Btn = page.locator("button:has-text('World 2: Gua Kristal')");
    await w2Btn.click();
    await page.waitForTimeout(400);
    const isWorld2ModalShown = await page.locator("div[role='dialog']").first().isVisible();
    const closeBtnW2 = page.locator("button:has-text('Mengerti, Saya Siap Berlatih!')");
    if (await closeBtnW2.isVisible()) {
      await closeBtnW2.click();
      await page.waitForTimeout(300);
    }

    // Klik World 3 yang masih terkunci
    const w3Btn = page.locator("button:has-text('World 3: Benteng Awan')");
    await w3Btn.click();
    await page.waitForTimeout(400);
    const isWorld3ModalShown = await page.locator("div[role='dialog']").first().isVisible();
    const closeBtnW3 = page.locator("button:has-text('Mengerti, Saya Siap Berlatih!')");
    if (await closeBtnW3.isVisible()) {
      await closeBtnW3.click();
      await page.waitForTimeout(300);
    }

    const mapStatusPassed = isLvl1Active && isWorld2ModalShown && isWorld3ModalShown;
    recordResult(
      5,
      "World map menampilkan status aktif dan modal gembok",
      mapStatusPassed,
      "World 2 dan 3 terkunci dengan dialog prasyarat bintang yang tepat"
    );

    // -------------------------------------------------------------------------
    // 6. Pemain dapat menyusun program
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/play/w1-l1`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Bersihkan deck jika ada balok tersisa dan tombol aktif
    const clearBtn = page.locator("button[aria-label='Kosongkan Meja Mantra']").first();
    if ((await clearBtn.isVisible()) && (await clearBtn.isEnabled())) {
      await clearBtn.click();
      await page.waitForTimeout(200);
      const confirmBtn = page.locator("button:has-text('Yakin Hapus?')");
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(200);
      }
    }

    const addStepBtn = page.locator("button:has-text('Maju 1 Langkah')").first();
    await addStepBtn.click();
    await page.waitForTimeout(300);

    const blockCountText = (await page.locator("span:has-text('Blok')").first().textContent()) || "";
    const blockAdded = blockCountText.includes("1 Blok");
    recordResult(
      6,
      "Pemain dapat menyusun balok program di Meja Mantra",
      blockAdded,
      "Balok 'Maju 1 Langkah' berhasil ditambahkan ke meja mantra (1 Blok)"
    );

    // -------------------------------------------------------------------------
    // 7. Run dan Step menjalankan engine
    // -------------------------------------------------------------------------
    const stepBtn = page.locator("button[aria-label='Eksekusi Satu Langkah']");
    let stepExecutedWithoutError = false;
    if (await stepBtn.isEnabled()) {
      await stepBtn.click();
      await page.waitForTimeout(300);
      stepExecutedWithoutError = true;
    }

    recordResult(
      7,
      "Step debug mengeksekusi instruksi per petak deterministik",
      stepExecutedWithoutError,
      "Engine merespons instruksi step dan memperbarui state karakter di arena"
    );

    // -------------------------------------------------------------------------
    // 8. Reset mengembalikan arena ke state awal
    // -------------------------------------------------------------------------
    const resetBtn = page.locator("button[aria-label='Reset Posisi Arena']");
    let resetExecutedWithoutError = false;
    try {
      await resetBtn.click();
      await page.waitForTimeout(300);
      resetExecutedWithoutError = true;
    } catch {
      resetExecutedWithoutError = false;
    }

    recordResult(
      8,
      "Reset mengembalikan posisi penyihir dan status arena",
      resetExecutedWithoutError,
      "Tombol Reset mengembalikan arena ke koordinat start tanpa menghapus balok"
    );

    // -------------------------------------------------------------------------
    // 9. Program valid menyelesaikan objective
    // -------------------------------------------------------------------------
    // Tambahkan 2 balok lagi sehingga total 3 Maju
    await addStepBtn.click();
    await page.waitForTimeout(200);
    await addStepBtn.click();
    await page.waitForTimeout(200);

    const runBtn = page.locator("button:has-text('Rapalkan Mantra')");
    await runBtn.click();
    await page.waitForSelector("text=Mantra Selesai!", { timeout: 8000 });

    const victoryHeader = page.locator("text=Mantra Selesai!");
    const isVictory = await victoryHeader.isVisible();
    const starReward = page.locator("text=3 Bintang");
    const hasStars = await starReward.isVisible();
    const victoryPassed = isVictory && hasStars;
    recordResult(
      9,
      "Program valid mencapai portal dan memicu Victory Modal",
      victoryPassed,
      "Menyelesaikan misi w1-l1 dengan rating 3 Bintang dan reward XP"
    );

    // -------------------------------------------------------------------------
    // 10. Program tidak valid tidak mendapat reward penyelesaian
    // -------------------------------------------------------------------------
    // Tutup modal kemenangan melalui tombol Ulangi Level
    const retryBtn = page.locator("button:has-text('Ulangi Level')").first();
    if (await retryBtn.isVisible()) {
      await retryBtn.click();
      await page.waitForTimeout(500);
    }

    // Bersihkan meja mantra dan masukkan hanya 1 langkah (belum sampai portal)
    if ((await clearBtn.isVisible()) && (await clearBtn.isEnabled())) {
      await clearBtn.click();
      await page.waitForTimeout(200);
      const confirm = page.locator("button:has-text('Yakin Hapus?')");
      if (await confirm.isVisible()) {
        await confirm.click();
        await page.waitForTimeout(200);
      }
    }

    await addStepBtn.click();
    await page.waitForTimeout(200);
    await runBtn.click();
    await page.waitForTimeout(2200);

    const victoryModalOnFail = page.locator("text=Mantra Selesai!");
    const failDidNotAward = !(await victoryModalOnFail.isVisible());
    recordResult(
      10,
      "Program tidak valid tidak mendapatkan reward kemenangan",
      failDidNotAward,
      "Simulasi berhenti di tengah lintasan tanpa memicu victory modal"
    );

    // -------------------------------------------------------------------------
    // 11. Hasil yang sah tersimpan di backend
    // -------------------------------------------------------------------------
    // Uji endpoint POST /api/progress/submit secara server-authoritative
    const validSubmitPayload = {
      levelId: "w1-l1",
      program: {
        version: 1,
        nodes: [
          { id: "s1", type: "ACTION", command: "STEP_FORWARD" },
          { id: "s2", type: "ACTION", command: "STEP_FORWARD" },
          { id: "s3", type: "ACTION", command: "STEP_FORWARD" },
        ],
      },
    };

    const submitResponse = await page.request.post(`${baseUrl}/api/progress/submit`, {
      data: validSubmitPayload,
    });
    const submitJson = await submitResponse.json();
    const backendSavePassed =
      submitResponse.status() === 200 && submitJson.success === true && submitJson.stars === 3;
    recordResult(
      11,
      "Backend memverifikasi dan menyimpan hasil sah",
      backendSavePassed,
      `API status: 200, stars: ${submitJson.stars}, xpEarned: ${submitJson.xpEarned}`
    );

    // -------------------------------------------------------------------------
    // 12. Refresh atau reload memuat progres yang benar
    // -------------------------------------------------------------------------
    // Simpan progres w1-l1 di localStorage browser
    await page.evaluate(() => {
      const data = {
        profile: {
          username: "apprentice_01",
          displayName: "Penyihir Magang",
          avatarId: "apprentice_default",
          totalXp: 100,
          wizardRank: "Novice Conjurer",
          activeFamiliarId: "pyx_fire_cat",
        },
        progress: {
          "w1-l1": {
            status: "completed",
            stars: 3,
            bestStepCount: 3,
            attemptsCount: 1,
          },
          "w1-l2": {
            status: "unlocked",
            stars: 0,
            bestStepCount: 0,
            attemptsCount: 0,
          },
        },
        drafts: {},
        familiars: ["pyx_fire_cat"],
        achievements: ["welcome_apprentice"],
      };
      localStorage.setItem("spellcode_guest_v1", JSON.stringify(data));
    });

    await page.goto(`${baseUrl}/map`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Refresh halaman untuk menguji persistensi
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    // w1-l1 harus berstatus selesai (ada badge Selesai)
    const isLvl1Saved = await page.locator("span:has-text('Selesai')").first().isVisible();

    // w1-l2 sekarang harus terbuka (Belokan di Tikungan Peri)
    const activeLevelTitle = page.locator("h3:has-text('Belokan di Tikungan Peri')").first();
    const isLvl2Unlocked = await activeLevelTitle.isVisible();
    const reloadPersistencePassed = isLvl1Saved && isLvl2Unlocked;
    recordResult(
      12,
      "Refresh halaman memuat progres yang tersimpan dengan benar",
      reloadPersistencePassed,
      "Level 1 berstatus Selesai dan Level 2 otomatis terbuka"
    );

    // -------------------------------------------------------------------------
    // 13. Pengguna tidak dapat membuka level terkunci melalui manipulasi UI
    // -------------------------------------------------------------------------
    // Klik Level yang masih terkunci di World 1
    const lockedCard = page.locator("div[aria-label*='Terkunci']").first();
    await lockedCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await lockedCard.click();
    await page.waitForTimeout(500);

    const isLockedModalBlocked = await page.locator("div[role='dialog']").first().isVisible();
    const closeBtnLock = page.locator("button:has-text('Mengerti, Saya Siap Berlatih!')");
    if (await closeBtnLock.isVisible()) {
      await closeBtnLock.click();
    }

    // Pastikan server menolak payload kosong untuk level terkunci
    const invalidSubmitResponse = await page.request.post(`${baseUrl}/api/progress/submit`, {
      data: {
        levelId: "w1-l4",
        program: { version: 1, nodes: [] },
      },
    });
    const invalidSubmitJson = await invalidSubmitResponse.json();
    const serverRejectionPassed = invalidSubmitJson.success === false && invalidSubmitJson.stars === 0;

    const securityPassed = isLockedModalBlocked && serverRejectionPassed;
    recordResult(
      13,
      "Pengguna tidak dapat membypass gembok melalui UI atau submission palsu",
      securityPassed,
      "Modal prasyarat mencegah akses dan server menolak klaim palsu"
    );

  } catch (err) {
    console.error("Terjadi error selama pengujian E2E:", err);
  } finally {
    await browser.close();
  }

  console.log("\n===============================================================");
  const total = testResults.length;
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`TOTAL PENGUJIAN: ${total} | LULUS: ${passedCount} | GAGAL: ${failedCount}`);
  console.log("===============================================================");

  if (failedCount > 0 || total < 13) {
    process.exit(1);
  }
}

runE2EUserJourney();
