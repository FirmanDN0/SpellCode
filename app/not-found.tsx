import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-spell-purple-900 border border-spell-purple-700 flex items-center justify-center text-spell-teal-400 mb-4 shadow-lg">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-3xl font-black text-white">404: Tersesat di Luar Peta</h1>
      <p className="text-sm text-spell-purple-300 mt-2 max-w-sm">
        Pulau melayang ini tidak tercatat di buku peta akademi. Ayo kembali ke jalan yang aman!
      </p>
      <Link href="/map" className="mt-6">
        <Button variant="primary" size="md">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Peta Dunia</span>
        </Button>
      </Link>
    </div>
  );
}
