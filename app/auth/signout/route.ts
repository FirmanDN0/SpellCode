import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  const { origin } = new URL(request.url);

  if (error) {
    return NextResponse.json(
      { error: "Gagal mengakhiri sesi autentikasi." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(`${origin}/login?message=logged_out`, {
    status: 303,
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login?message=logged_out`);
}
