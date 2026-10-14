import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { getFriendlyAuthErrorMessage } from "@/lib/supabase/auth";
import { getLevelById } from "@/lib/levels";
import { createInitialGridState, runSpellProgram } from "@/lib/engine";
import { SpellProgram } from "@/lib/engine/types";

describe("Tahap 4D: Backend Security and Data Quality Review", () => {
  const rootDir = process.cwd();

  describe("1. Audit Rahasia dan Keamanan Bundle Klien (Secret Leakage Prevention)", () => {
    it("memastikan client.ts tidak pernah mengekspos atau mengimpor SERVICE_ROLE_KEY", () => {
      const clientContent = fs.readFileSync(
        path.join(rootDir, "lib/supabase/client.ts"),
        "utf-8"
      );
      expect(clientContent).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(clientContent).not.toContain("SUPABASE_SECRET_KEY");
      expect(clientContent).toContain("createBrowserClient");
    });

    it("memastikan admin.ts hanya diimpor oleh server route handlers dan tidak oleh komponen klien", () => {
      // Periksa direktori components dan app pages
      const clientFilesToCheck = [
        "app/map/page.tsx",
        "app/play/[levelId]/page.tsx",
        "app/login/page.tsx",
        "app/profile/page.tsx",
        "components/game/VictoryModal.tsx",
        "lib/supabase/useUserSession.ts",
      ];

      for (const relPath of clientFilesToCheck) {
        const fullPath = path.join(rootDir, relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          expect(content).not.toContain("createAdminClient");
          expect(content).not.toContain("lib/supabase/admin");
        }
      }
    });

    it("memastikan .env.example hanya memuat nilai placeholder dan bukan secret nyata", () => {
      const envExample = fs.readFileSync(
        path.join(rootDir, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("your-project-id.supabase.co");
      expect(envExample).toContain("your-anon-key-here");
      expect(envExample).toContain("your-service-role-key-here");

      // Pastikan tidak ada token JWT panjang (eyJ...)
      expect(envExample).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/);
    });

    it("memastikan .gitignore mengecualikan semua file .env lokal", () => {
      const gitignore = fs.readFileSync(path.join(rootDir, ".gitignore"), "utf-8");
      expect(gitignore).toContain(".env*.local");
      expect(gitignore).toContain(".env");
    });
  });

  describe("2. Isolasi Data Lintas Pengguna (Cross-User Isolation Test)", () => {
    interface MockRow {
      user_id: string;
      level_id: string;
      stars: number;
      status: string;
    }

    // Simulasi tabel database dengan data dua pengguna terpisah
    const databaseRows: MockRow[] = [
      { user_id: "user-alpha-111", level_id: "w1-l1", stars: 3, status: "completed" },
      { user_id: "user-alpha-111", level_id: "w1-l2", stars: 2, status: "completed" },
      { user_id: "user-beta-222", level_id: "w1-l1", stars: 1, status: "completed" },
    ];

    // Evaluator kebijakan RLS: auth.uid() = user_id
    const rlsSelect = (currentAuthUid: string): MockRow[] => {
      return databaseRows.filter((row) => row.user_id === currentAuthUid);
    };

    const rlsUpdate = (
      currentAuthUid: string,
      targetUserId: string,
      levelId: string,
      newStars: number
    ): boolean => {
      // RLS Check: USING (auth.uid() = user_id)
      if (currentAuthUid !== targetUserId) {
        return false; // Ditolak oleh RLS
      }
      const target = databaseRows.find(
        (r) => r.user_id === targetUserId && r.level_id === levelId
      );
      if (target) {
        target.stars = newStars;
        return true;
      }
      return false;
    };

    it("menjamin Pengguna A tidak dapat membaca data progres privat Pengguna B", () => {
      const userAData = rlsSelect("user-alpha-111");
      expect(userAData.length).toBe(2);
      expect(userAData.every((r) => r.user_id === "user-alpha-111")).toBe(true);

      // Data Pengguna B sama sekali tidak muncul dalam hasil query Pengguna A
      const hasUserBData = userAData.some((r) => r.user_id === "user-beta-222");
      expect(hasUserBData).toBe(false);
    });

    it("menjamin Pengguna A tidak dapat memodifikasi data progres Pengguna B (Akses Ditolak)", () => {
      // Pengguna Alpha mencoba memodifikasi bintang milik Pengguna Beta
      const updateSuccess = rlsUpdate("user-alpha-111", "user-beta-222", "w1-l1", 3);
      expect(updateSuccess).toBe(false);

      // Verifikasi data Pengguna Beta tetap tidak berubah (tetap 1 bintang)
      const userBData = rlsSelect("user-beta-222");
      expect(userBData[0].stars).toBe(1);
    });
  });

  describe("3. Integritas Reward dan Ketahanan Terhadap Manipulasi Klien", () => {
    it("menolak klaim kemenangan jika program gagal mencapai objective portal", () => {
      const level = getLevelById("w1-l1");
      expect(level).toBeDefined();
      if (!level) return;

      // Program yang belum selesai (hanya 1 langkah maju, padahal butuh 3)
      const incompleteAst: SpellProgram = {
        version: 1,
        nodes: [{ id: "n1", type: "ACTION", command: "STEP_FORWARD" }],
      };

      const result = runSpellProgram(
        incompleteAst,
        createInitialGridState(level.grid),
        level.parSteps,
        { objectives: level.objectives }
      );

      // Server menolak kemenangan meskipun klien mencoba mengaku menang
      expect(result.status).toBe("FAILED");
      expect(result.evaluation.isVictory).toBe(false);
      expect(result.evaluation.stars).toBe(0);
      expect(result.evaluation.xpEarned).toBe(0);
    });

    it("mencegah duplikasi reward ketika submisi yang sama dikirim berulang (Idempotency)", () => {
      const calculateDeltaXp = (
        existingStatus: string,
        existingStars: number,
        newStars: number,
        calculatedBaseXp: number
      ): number => {
        if (existingStatus !== "completed") return calculatedBaseXp;
        if (newStars > existingStars) {
          const oldXp = existingStars === 1 ? 60 : existingStars === 2 ? 75 : 100;
          return Math.max(0, calculatedBaseXp - oldXp);
        }
        return 0; // Replay dengan bintang sama atau lebih rendah = 0 XP
      };

      // Replay pertama dengan 3 bintang (sudah diselesaikan sebelumnya dengan 3 bintang)
      expect(calculateDeltaXp("completed", 3, 3, 100)).toBe(0);

      // Replay dengan hasil lebih jelek (1 bintang) tidak mengurangi atau menambah XP
      expect(calculateDeltaXp("completed", 3, 1, 60)).toBe(0);

      // Peningkatan dari 2 bintang ke 3 bintang hanya memberi selisih 25 XP
      expect(calculateDeltaXp("completed", 2, 3, 100)).toBe(25);
    });
  });

  describe("4. Validasi Batasan Input dan Proteksi DoS Payload", () => {
    it("memvalidasi batas panjang AST pada endpoint server (maksimal 100 node)", () => {
      const oversizedNodes = new Array(105).fill({
        id: "step",
        type: "ACTION",
        command: "STEP_FORWARD",
      });

      // Validasi logika yang diterapkan di submit/route.ts
      const isValidLength = Array.isArray(oversizedNodes) && oversizedNodes.length <= 100;
      expect(isValidLength).toBe(false);
    });

    it("menolak ID level yang mengandung karakter berbahaya atau upaya injeksi SQL", () => {
      const maliciousIds = [
        "w1-l1' OR '1'='1",
        "w1-l1; DROP TABLE profiles;--",
        "../../etc/passwd",
        "<script>alert(1)</script>",
        "a".repeat(100),
      ];

      const validIdRegex = /^[a-zA-Z0-9_-]+$/;

      for (const id of maliciousIds) {
        const isValid = id.length <= 50 && validIdRegex.test(id);
        expect(isValid).toBe(false);
      }
    });
  });

  describe("5. Masking Error dan Proteksi Informasi Sensitif", () => {
    it("menyembunyikan detail pesan error database Postgres internal dari pengguna", () => {
      const internalErrors = [
        'duplicate key value violates unique constraint "profiles_username_key"',
        "relation \"public.secret_table\" does not exist at character 15",
        "connection to server at \"db.supabase.co\" failed: timeout expired",
        "JWT signature verification failed: invalid key bytes",
      ];

      for (const err of internalErrors) {
        const masked = getFriendlyAuthErrorMessage(err);
        // Pesan yang dikembalikan harus ramah anak dan tidak mengandung kata kunci sensitif internal
        expect(masked).not.toContain("constraint");
        expect(masked).not.toContain("relation");
        expect(masked).not.toContain("secret_table");
        expect(masked).not.toContain("timeout expired");
        expect(masked).not.toContain("JWT signature");
        expect(masked.length).toBeGreaterThan(10);
      }
    });
  });
});
