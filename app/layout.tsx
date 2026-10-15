import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    template: "%s | SpellCode",
    default: "SpellCode: Cast Spells with Code",
  },
  description:
    "Game edukasi pemrograman ramah anak untuk usia 7-12 tahun. Belajar computational thinking dengan meramu mantra sihir interaktif!",
  keywords: [
    "coding anak",
    "computational thinking",
    "game edukasi",
    "belajar pemrograman",
    "spellcode",
    "akademi sihir",
    "belajar logika",
  ],
  authors: [{ name: "FirmanDN" }],
  creator: "FirmanDN",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "SpellCode: Cast Spells with Code",
    description:
      "Game edukasi pemrograman ramah anak untuk usia 7-12 tahun. Belajar computational thinking dengan meramu mantra sihir interaktif!",
    siteName: "SpellCode",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpellCode: Cast Spells with Code",
    description:
      "Game edukasi pemrograman ramah anak untuk usia 7-12 tahun. Belajar computational thinking dengan meramu mantra sihir interaktif!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="flex flex-col min-h-screen bg-spell-purple-950 text-spell-purple-50">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
