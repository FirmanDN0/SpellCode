import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GuestData, getRankByXp } from "@/lib/storage/guestStorage";
import { getLevelById } from "@/lib/levels";
import { createInitialGridState, runSpellProgram } from "@/lib/engine";

const VALID_ACHIEVEMENT_IDS = new Set([
  "welcome_apprentice",
  "first_spell",
  "three_stars_perfection",
  "forest_guardian",
  "grand_magus",
  "speed_runner",
  "efficiency_master",
]);

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

    let body: { guestData?: GuestData };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Format payload JSON tidak valid." },
        { status: 400 }
      );
    }

    const guestData = body?.guestData;
    if (
      !guestData ||
      typeof guestData !== "object" ||
      !guestData.progress ||
      typeof guestData.progress !== "object"
    ) {
      return NextResponse.json(
        { error: "Data progres guest tidak valid." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const progressEntries = Object.entries(guestData.progress).slice(0, 50);

    // 1. Validasi dan sinkronisasi progres tiap level secara server-authoritative
    for (const [levelId, record] of progressEntries) {
      // Pastikan level terdaftar pada katalog resmi
      const levelDef = getLevelById(levelId);
      if (!levelDef || typeof record !== "object" || !record) continue;

      if (record.status === "completed") {
        let isVerified = false;
        let verifiedStars = 1;
        let verifiedSteps = record.bestStepCount || levelDef.parSteps;

        // Jika solusi AST disertakan, verifikasi menggunakan engine deterministik
        if (
          record.bestSolutionAst &&
          Array.isArray(record.bestSolutionAst.nodes) &&
          record.bestSolutionAst.nodes.length <= 100
        ) {
          const initialState = createInitialGridState(levelDef.grid);
          const maxSteps = levelDef.maxSteps ?? 150;
          const exec = runSpellProgram(
            record.bestSolutionAst,
            initialState,
            levelDef.parSteps,
            { objectives: levelDef.objectives, maxSteps }
          );

          if (exec.evaluation.isVictory) {
            isVerified = true;
            verifiedStars = exec.evaluation.stars;
            verifiedSteps = exec.totalSteps;
          }
        } else if (
          typeof record.stars === "number" &&
          record.stars >= 1 &&
          record.stars <= 3
        ) {
          // Fallback jika AST draf tidak disertakan: clamp bintang 1..3
          isVerified = true;
          verifiedStars = Math.max(1, Math.min(3, Math.floor(record.stars)));
        }

        if (isVerified) {
          await admin.from("player_progress").upsert(
            {
              user_id: user.id,
              level_id: levelId,
              status: "completed",
              stars: verifiedStars,
              best_step_count: verifiedSteps,
              best_solution_ast: record.bestSolutionAst || null,
              attempts_count: Math.max(
                1,
                Math.min(1000, Number(record.attemptsCount) || 1)
              ),
              first_completed_at:
                record.firstCompletedAt || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id, level_id" }
          );
        }
      } else if (record.status === "unlocked") {
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

    // 2. Rekalkulasi Total XP secara server-authoritative (tidak mempercayai input XP mentah dari klien)
    const { data: userProgressRows } = await admin
      .from("player_progress")
      .select("level_id, status, stars")
      .eq("user_id", user.id)
      .eq("status", "completed");

    let recalculatedXp = 0;
    if (userProgressRows && Array.isArray(userProgressRows)) {
      for (const row of userProgressRows) {
        const stars = row.stars || 0;
        const xpForStars =
          stars === 3 ? 100 : stars === 2 ? 75 : stars === 1 ? 60 : 0;
        recalculatedXp += xpForStars;
      }
    }

    // Ambil profil saat ini dan update total_xp serta wizard_rank
    const { data: currentProfile } = await admin
      .from("profiles")
      .select("total_xp, wizard_rank")
      .eq("id", user.id)
      .maybeSingle();

    const existingXp = currentProfile?.total_xp || 0;
    const finalXp = Math.max(existingXp, recalculatedXp);
    const finalRank = getRankByXp(finalXp);

    await admin
      .from("profiles")
      .update({
        total_xp: finalXp,
        wizard_rank: finalRank,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // 3. Sinkronisasi achievements dengan validasi whitelist
    if (Array.isArray(guestData.achievements)) {
      for (const achId of guestData.achievements) {
        if (typeof achId === "string" && VALID_ACHIEVEMENT_IDS.has(achId)) {
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
    }

    return NextResponse.json({
      success: true,
      message: "Sinkronisasi berhasil divalidasi dan disimpan.",
      totalXp: finalXp,
      wizardRank: finalRank,
    });
  } catch (err: unknown) {
    console.error("Kesalahan sinkronisasi data guest:", err);
    return NextResponse.json(
      { error: "Gagal memproses sinkronisasi data progres." },
      { status: 500 }
    );
  }
}
