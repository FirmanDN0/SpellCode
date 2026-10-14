import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GuestData } from "@/lib/storage/guestStorage";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan untuk sinkronisasi akun." },
        { status: 401 }
      );
    }

    const { guestData }: { guestData: GuestData } = await req.json();
    if (!guestData || !guestData.progress) {
      return NextResponse.json(
        { error: "Data progres guest tidak valid." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Sinkronisasi progress tiap level
    for (const [levelId, record] of Object.entries(guestData.progress)) {
      if (record.status === "completed") {
        await admin.from("player_progress").upsert(
          {
            user_id: user.id,
            level_id: levelId,
            status: "completed",
            stars: record.stars,
            best_step_count: record.bestStepCount,
            best_solution_ast: record.bestSolutionAst || null,
            attempts_count: record.attemptsCount || 1,
            first_completed_at:
              record.firstCompletedAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id, level_id" }
        );
      } else if (record.status === "unlocked") {
        // Jangan timpa jika sudah completed di online
        const { data: existing } = await admin
          .from("player_progress")
          .select("id")
          .eq("user_id", user.id)
          .eq("level_id", levelId)
          .maybeSingle();

        if (!existing) {
          await admin.from("player_progress").insert({
            user_id: user.id,
            level_id: levelId,
            status: "unlocked",
            stars: 0,
            best_step_count: 0,
            attempts_count: 0,
          });
        }
      }
    }

    // 2. Sinkronisasi total XP
    const { data: currentProfile } = await admin
      .from("profiles")
      .select("total_xp, wizard_rank")
      .eq("id", user.id)
      .maybeSingle();

    if (currentProfile && guestData.profile.totalXp > currentProfile.total_xp) {
      await admin
        .from("profiles")
        .update({
          total_xp: guestData.profile.totalXp,
          wizard_rank: guestData.profile.wizardRank,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    // 3. Sinkronisasi achievements
    if (Array.isArray(guestData.achievements)) {
      for (const achId of guestData.achievements) {
        await admin
          .from("player_achievements")
          .insert({
            user_id: user.id,
            achievement_id: achId,
          })
          .select()
          .maybeSingle();
      }
    }

    return NextResponse.json({ success: true, message: "Sinkronisasi berhasil." });
  } catch (err) {
    console.error("Kesalahan sinkronisasi data guest:", err);
    return NextResponse.json(
      { error: "Gagal memproses sinkronisasi data." },
      { status: 500 }
    );
  }
}
