import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://placeholder-project.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-anon-key";

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Server-side helper untuk memeriksa session pengguna di Server Components atau Route Handlers.
 */
export async function getServerSession(): Promise<{ user: User | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null };
    }
    return { user };
  } catch {
    return { user: null };
  }
}

/**
 * Server-side guard yang mengarahkan pengguna ke halaman login jika belum terotentikasi.
 */
export async function requireAuth(nextUrl: string = "/profile"): Promise<User> {
  const { user } = await getServerSession();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextUrl)}&message=auth_required`);
  }
  return user;
}

