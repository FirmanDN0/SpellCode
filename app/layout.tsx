import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "SpellCode: Cast Spells with Code",
  description:
    "Game edukasi pemrograman ramah anak untuk usia 7-12 tahun. Belajar computational thinking dengan meramu mantra sihir interaktif!",
  keywords: [
    "coding anak",
    "computational thinking",
    "game edukasi",
    "belajar pemrograman",
    "spellcode",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="flex flex-col min-h-screen bg-spell-purple-950 text-spell-purple-50">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
