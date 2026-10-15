export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validasi alamat email yang ramah anak dan jelas.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: "Alamat email tidak boleh kosong." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: "Format email kurang tepat. Contoh yang benar: penyihir@contoh.com",
    };
  }
  return { isValid: true };
}

/**
 * Validasi kata sandi.
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Kata sandi tidak boleh kosong." };
  }
  if (password.length < 6) {
    return {
      isValid: false,
      error: "Kata sandi rahasiamu harus minimal 6 karakter agar aman.",
    };
  }
  return { isValid: true };
}

/**
 * Validasi username magang.
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || !username.trim()) {
    return { isValid: false, error: "Username tidak boleh kosong." };
  }
  const clean = username.trim().toLowerCase();
  if (clean.length < 3) {
    return {
      isValid: false,
      error: "Username minimal 3 karakter.",
    };
  }
  if (clean.length > 20) {
    return {
      isValid: false,
      error: "Username maksimal 20 karakter.",
    };
  }
  const usernameRegex = /^[a-z0-9_]+$/;
  if (!usernameRegex.test(clean)) {
    return {
      isValid: false,
      error: "Username hanya boleh berisi huruf kecil, angka, dan garis bawah (_).",
    };
  }
  return { isValid: true };
}

/**
 * Menerjemahkan error teknis Supabase menjadi pesan bahasa Indonesia yang santun dan mudah dipahami anak maupun orang tua.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return "Terjadi kendala yang tidak terduga.";

  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : String(error);

  const lower = rawMessage.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email atau kata sandi tidak cocok. Coba periksa kembali ejaannya!";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "Email ini sudah memiliki akun di akademi. Silakan pilih tab 'Masuk' atau gunakan Magic Link!";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Terlalu banyak permintaan dalam waktu singkat. Tunggu sebentar lalu coba lagi ya!";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Jaringan internetmu terputus. Pastikan perangkatmu terhubung ke internet!";
  }
  if (lower.includes("password should be at least")) {
    return "Kata sandi minimal 6 karakter agar mantramu terlindungi.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Periksa kotak masuk emailmu untuk tautan verifikasi!";
  }
  if (lower.includes("session expired") || lower.includes("jwt expired")) {
    return "Sesi akademi telah berakhir. Silakan masuk kembali!";
  }

  // Pesan aman default tanpa membocorkan detail database internal
  return "Gerbang sihir sedang sibuk. Mohon coba beberapa saat lagi.";
}

