import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  getFriendlyAuthErrorMessage,
} from "@/lib/supabase/auth";

describe("Tahap 4B: Authentication and Session Management Verification", () => {
  describe("1. Validasi Input Form Autentikasi Ramah Anak", () => {
    it("memvalidasi email dengan format yang tepat", () => {
      expect(validateEmail("").isValid).toBe(false);
      expect(validateEmail("   ").isValid).toBe(false);
      expect(validateEmail("bukan-email").isValid).toBe(false);
      expect(validateEmail("siswa@").isValid).toBe(false);
      expect(validateEmail("@sekolah.id").isValid).toBe(false);

      const validResult = validateEmail("murid_magang@spellcode.edu");
      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();
    });

    it("memvalidasi kata sandi dengan batas minimum 6 karakter", () => {
      expect(validatePassword("").isValid).toBe(false);
      expect(validatePassword("12345").isValid).toBe(false);
      expect(validatePassword("12345").error).toContain("minimal 6 karakter");

      const validResult = validatePassword("mantraRahasia123");
      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();
    });

    it("memvalidasi username sesuai ketentuan (3-20 karakter, alfanumerik & underscore)", () => {
      expect(validateUsername("").isValid).toBe(false);
      expect(validateUsername("ab").isValid).toBe(false); // terlalu pendek
      expect(validateUsername("ab").error).toContain("minimal 3 karakter");

      expect(validateUsername("ini_username_yang_sangat_panjang_sekali").isValid).toBe(false); // > 20
      expect(validateUsername("ini_username_yang_sangat_panjang_sekali").error).toContain("maksimal 20");

      expect(validateUsername("aria wizard!").isValid).toBe(false); // spasi dan tanda seru
      expect(validateUsername("aria@magus").isValid).toBe(false); // karakter spesial

      const validUsername = validateUsername("aria_magus_01");
      expect(validUsername.isValid).toBe(true);
      expect(validUsername.error).toBeUndefined();
    });
  });

  describe("2. Sanitasi & Penanganan Error Ramah Anak (Error Masking)", () => {
    it("menerjemahkan invalid credentials menjadi pesan ramah anak", () => {
      const err = new Error("Invalid login credentials provided");
      const msg = getFriendlyAuthErrorMessage(err);
      expect(msg).toContain("Email atau kata sandi tidak cocok");
    });

    it("menerjemahkan email yang sudah terdaftar menjadi petunjuk login/magic link", () => {
      const err = new Error("User already registered with this provider");
      const msg = getFriendlyAuthErrorMessage(err);
      expect(msg).toContain("sudah memiliki akun");
    });

    it("menerjemahkan rate limit menjadi imbauan menunggu", () => {
      const err = new Error("Email rate limit exceeded for ip");
      const msg = getFriendlyAuthErrorMessage(err);
      expect(msg).toContain("Terlalu banyak permintaan");
    });

    it("menerjemahkan network error menjadi pesan periksa koneksi", () => {
      const err = new Error("Failed to fetch from authentication server");
      const msg = getFriendlyAuthErrorMessage(err);
      expect(msg).toContain("Jaringan internetmu terputus");
    });

    it("menyembunyikan detail SQL/Database internal dan mengembalikan pesan aman", () => {
      const dbErr = new Error("PostgreSQL syntax error near WHERE id = $1; relation profiles does not exist");
      const msg = getFriendlyAuthErrorMessage(dbErr);
      expect(msg).not.toContain("PostgreSQL");
      expect(msg).not.toContain("relation profiles");
      expect(msg).toContain("Gerbang sihir sedang sibuk");
    });
  });

  describe("3. Audit Keamanan Secret & Pemisahan Client/Server", () => {
    it("memastikan client.ts tidak mengimpor service role key atau admin.ts", () => {
      const clientContent = fs.readFileSync(
        path.resolve(process.cwd(), "lib/supabase/client.ts"),
        "utf-8"
      );
      expect(clientContent).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(clientContent).not.toContain("createAdminClient");
      expect(clientContent).not.toContain("./admin");
    });

    it("memastikan useUserSession.ts tidak mengimpor server secret", () => {
      const sessionContent = fs.readFileSync(
        path.resolve(process.cwd(), "lib/supabase/useUserSession.ts"),
        "utf-8"
      );
      expect(sessionContent).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(sessionContent).not.toContain("admin");
    });

    it("memastikan tidak ada token autentikasi rahasia yang disimpan manual di localStorage", () => {
      // Memeriksa lib/storage/guestStorage.ts
      const storageContent = fs.readFileSync(
        path.resolve(process.cwd(), "lib/storage/guestStorage.ts"),
        "utf-8"
      );
      expect(storageContent).not.toContain("access_token");
      expect(storageContent).not.toContain("refresh_token");
      expect(storageContent).not.toContain("service_role");
    });
  });

  describe("4. Audit Rute Signout & Middleware Session Refresh", () => {
    it("memastikan route handler signout ada dan menangani POST dan GET", () => {
      const signoutPath = path.resolve(process.cwd(), "app/auth/signout/route.ts");
      expect(fs.existsSync(signoutPath)).toBe(true);
      const signoutContent = fs.readFileSync(signoutPath, "utf-8");
      expect(signoutContent).toContain("export async function POST");
      expect(signoutContent).toContain("export async function GET");
      expect(signoutContent).toContain("supabase.auth.signOut()");
    });

    it("memastikan middleware memeriksa rute terproteksi secara aman", () => {
      const middlewarePath = path.resolve(process.cwd(), "lib/supabase/middleware.ts");
      const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");
      expect(middlewareContent).toContain("PROTECTED_PREFIXES");
      expect(middlewareContent).toContain("supabase.auth.getUser()");
      expect(middlewareContent).toContain("redirectUrl.pathname = \"/login\"");
    });

    it("memastikan navbar merespons session pengguna (menampilkan nama akun, bukan Profil Magang saat login)", () => {
      const navbarPath = path.resolve(process.cwd(), "components/shared/Navbar.tsx");
      const navbarContent = fs.readFileSync(navbarPath, "utf-8");
      expect(navbarContent).toContain("useUserSession");
      expect(navbarContent).toContain("isOnline");
      expect(navbarContent).toContain("profileLabel");
    });
  });
});
