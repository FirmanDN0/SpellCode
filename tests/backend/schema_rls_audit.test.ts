import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Tahap 4A: Static Audit Schema, Migrations, and RLS Policies", () => {
  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
  const schemaFile = path.resolve(process.cwd(), "supabase/schema.sql");

  const migration001 = fs.readFileSync(
    path.join(migrationsDir, "20261014000001_initial_schema.sql"),
    "utf-8"
  );
  const migration002 = fs.readFileSync(
    path.join(migrationsDir, "20261014000002_row_level_security.sql"),
    "utf-8"
  );
  const migration003 = fs.readFileSync(
    path.join(migrationsDir, "20261014000003_auth_triggers.sql"),
    "utf-8"
  );
  const migration004 = fs.readFileSync(
    path.join(migrationsDir, "20261014000004_seed_campaign.sql"),
    "utf-8"
  );
  const consolidatedSchema = fs.readFileSync(schemaFile, "utf-8");

  describe("1. Audit Urutan Migrasi dan Integritas Relasi", () => {
    it("memastikan seluruh 4 berkas migrasi dan berkas konsolidasi ada dan tidak kosong", () => {
      expect(migration001.length).toBeGreaterThan(500);
      expect(migration002.length).toBeGreaterThan(500);
      expect(migration003.length).toBeGreaterThan(500);
      expect(migration004.length).toBeGreaterThan(500);
      expect(consolidatedSchema.length).toBeGreaterThan(2000);
    });

    it("menghubungkan profiles ke auth.users dengan foreign key ON DELETE CASCADE yang aman", () => {
      expect(migration001).toContain(
        "REFERENCES auth.users(id) ON DELETE CASCADE"
      );
    });

    it("memiliki foreign key berjenjang yang aman dari data pemain ke profiles(id)", () => {
      expect(migration001).toContain(
        "REFERENCES public.profiles(id) ON DELETE CASCADE"
      );
      expect(migration001).toContain(
        "REFERENCES public.levels(id) ON DELETE CASCADE"
      );
    });

    it("memiliki unique constraint yang mencegah duplikasi progres, lencana, dan familiars", () => {
      expect(migration001).toContain("CONSTRAINT uq_world_level UNIQUE (world_number, level_number)");
      expect(migration001).toContain("CONSTRAINT uq_user_level UNIQUE (user_id, level_id)");
      expect(migration001).toContain("CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)");
      expect(migration001).toContain("CONSTRAINT uq_user_familiar UNIQUE (user_id, familiar_id)");
    });

    it("memiliki check constraints untuk integritas data (bintang 0-3, xp positif, par_steps)", () => {
      expect(migration001).toContain("CHECK (stars BETWEEN 0 AND 3)");
      expect(migration001).toContain("CHECK (total_xp >= 0)");
      expect(migration001).toContain("CHECK (par_steps > 0)");
    });
  });

  describe("2. Audit Kebijakan Row Level Security (RLS) & Least Privilege", () => {
    it("mengaktifkan RLS pada seluruh 8 tabel domain", () => {
      const requiredTables = [
        "public.levels",
        "public.achievements",
        "public.familiars",
        "public.profiles",
        "public.player_progress",
        "public.level_attempts",
        "public.player_achievements",
        "public.player_familiars",
      ];

      for (const table of requiredTables) {
        expect(migration002).toContain(
          `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
        );
      }
    });

    it("memisahkan katalog publik agar hanya read-only dan tidak dapat dimodifikasi browser", () => {
      expect(migration002).toContain(
        'ON public.levels FOR SELECT\n  USING (is_published = true);'
      );
      expect(migration002).toContain(
        'ON public.achievements FOR SELECT\n  USING (true);'
      );
      expect(migration002).toContain(
        'ON public.familiars FOR SELECT\n  USING (true);'
      );

      // Pastikan tidak ada policy INSERT/UPDATE/DELETE untuk tabel publik
      expect(migration002).not.toContain("ON public.levels FOR INSERT");
      expect(migration002).not.toContain("ON public.levels FOR UPDATE");
      expect(migration002).not.toContain("ON public.levels FOR DELETE");
    });

    it("mengisolasi data pribadi pemain secara ketat dengan auth.uid() = user_id atau auth.uid() = id", () => {
      // Profiles
      expect(migration002).toContain(
        "ON public.profiles FOR SELECT\n  USING (auth.uid() = id);"
      );
      expect(migration002).toContain(
        "ON public.profiles FOR UPDATE\n  USING (auth.uid() = id)\n  WITH CHECK (auth.uid() = id);"
      );

      // Player Progress
      expect(migration002).toContain(
        "ON public.player_progress FOR SELECT\n  USING (auth.uid() = user_id);"
      );
      expect(migration002).toContain(
        "ON public.player_progress FOR INSERT\n  WITH CHECK (auth.uid() = user_id);"
      );
      expect(migration002).toContain(
        "ON public.player_progress FOR UPDATE\n  USING (auth.uid() = user_id)\n  WITH CHECK (auth.uid() = user_id);"
      );

      // Tidak boleh ada wildcard USING (true) pada tabel privat
      expect(migration002).not.toContain("ON public.player_progress FOR SELECT\n  USING (true);");
      expect(migration002).not.toContain("ON public.profiles FOR SELECT\n  USING (true);");
    });

    it("memastikan level_attempts bersifat immutable (hanya SELECT dan INSERT, tanpa UPDATE atau DELETE)", () => {
      expect(migration002).toContain("ON public.level_attempts FOR SELECT");
      expect(migration002).toContain("ON public.level_attempts FOR INSERT");
      expect(migration002).not.toContain("ON public.level_attempts FOR UPDATE");
      expect(migration002).not.toContain("ON public.level_attempts FOR DELETE");
    });
  });

  describe("3. Audit Keandalan Onboarding Trigger (Resilience)", () => {
    it("menggunakan EXCEPTION WHEN OTHERS THEN agar kegagalan trigger tidak menggagalkan registrasi pengguna", () => {
      expect(migration003).toContain("EXCEPTION WHEN OTHERS THEN");
      expect(migration003).toContain("RAISE WARNING");
    });

    it("menjalankan sanitasi karakter username dan proteksi collision", () => {
      expect(migration003).toContain("REGEXP_REPLACE");
      expect(migration003).toContain("WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username)");
    });

    it("memberikan starter familiar, level pertama w1-l1, dan achievement pembuka secara otomatis", () => {
      expect(migration003).toContain("'pyx_fire_cat'");
      expect(migration003).toContain("'w1-l1'");
      expect(migration003).toContain("'welcome_apprentice'");
    });
  });

  describe("4. Audit Ketersediaan Seed Data Reproducible", () => {
    it("menyediakan seed untuk 12 level MVP secara berurutan", () => {
      const levelIds = [
        "w1-l1", "w1-l2", "w1-l3", "w1-l4", "w1-l5", "w1-l6",
        "w2-l1", "w2-l2", "w2-l3", "w2-l4", "w2-l5", "w2-l6"
      ];
      for (const id of levelIds) {
        expect(migration004).toContain(`'${id}'`);
      }
    });

    it("menggunakan ON CONFLICT DO UPDATE agar seed data dapat dijalankan berulang kali secara aman", () => {
      expect(migration004).toContain("ON CONFLICT (id) DO UPDATE SET");
    });
  });
});
