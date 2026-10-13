import { EngineErrorCode, EngineErrorDetails } from "./types";

export const ERROR_MESSAGES: Record<
  EngineErrorCode,
  { message: string; kidExplanation: string }
> = {
  WALL_COLLISION: {
    message: "Penyihir melangkah keluar batas arena pulau sihir.",
    kidExplanation:
      "Hampir jatuh dari pulau sihir! Jangan melangkah ke jurang tepi. Coba berbelok terlebih dahulu.",
  },
  OBSTACLE_HIT: {
    message: "Penyihir menabrak rintangan batu sihir atau semak duri.",
    kidExplanation:
      "Ups, terhalang semak berduri atau batu besar! Gunakan rune belok untuk mencari jalan memutar.",
  },
  EMPTY_ACTION: {
    message: "Aksi gagal karena tidak ada target yang sesuai di petak saat ini.",
    kidExplanation:
      "Mantra tidak menemukan target di sini! Pastikan kamu berdiri tepat di atas petak lentera atau kristal sebelum merapalkan aksi.",
  },
  MANA_OVERFLOW: {
    message: "Eksekusi melebihi batas langkah maksimal (potensi infinite loop).",
    kidExplanation:
      "Energi manamu meluap karena mantra berjalan terlalu lama! Periksa angka pada blok pengulanganmu agar tidak berputar tanpa henti.",
  },
  MAX_DEPTH_EXCEEDED: {
    message: "Penyusunan blok bersarang terlalu dalam melampaui batas kemampuan magang.",
    kidExplanation:
      "Susunan blok perulanganmu terlalu bertingkat-tingkat! Rapikan mantramu agar lebih mudah dibaca.",
  },
  DISALLOWED_INSTRUCTION: {
    message: "Instruksi yang digunakan tidak diizinkan pada level ini.",
    kidExplanation:
      "Rune ini belum dibuka oleh akademi untuk misi ini! Gunakan hanya rune yang tersedia di rak.",
  },
  PROGRAM_TOO_LARGE: {
    message: "Jumlah total blok mantra melebihi kapasitas meja sihir.",
    kidExplanation:
      "Meja mantramu terlalu penuh! Cobalah meringkas instruksi berulang menggunakan blok Ulangi.",
  },
  INCOMPLETE_OBJECTIVE: {
    message: "Penyihir tiba di portal tetapi sasaran misi belum lengkap.",
    kidExplanation:
      "Portal belum aktif! Pastikan semua lentera sudah menyala dan kristal mana sudah dipetik sebelum menuju portal.",
  },
  UNREACHED_PORTAL: {
    message: "Semua instruksi selesai dieksekusi tetapi penyihir belum tiba di portal.",
    kidExplanation:
      "Mantramu sudah selesai bekerja, tapi penyihir belum sampai ke portal gerbang kemenangan! Tambahkan langkah menuju portal.",
  },
};

export function createEngineError(
  code: EngineErrorCode,
  nodeId?: string,
  stepNumber?: number,
  customKidExplanation?: string
): EngineErrorDetails {
  const base = ERROR_MESSAGES[code] || {
    message: "Terjadi kesalahan sihir.",
    kidExplanation: "Ada yang belum tepat pada mantramu. Periksa kembali langkah-langkahnya!",
  };

  return {
    code,
    message: base.message,
    kidExplanation: customKidExplanation || base.kidExplanation,
    nodeId,
    stepNumber,
  };
}
