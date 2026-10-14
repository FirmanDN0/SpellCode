import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLevelById, getNextLevel, allLevels } from "@/lib/levels";
import { createInitialGridState, runSpellProgram, SpellProgram } from "@/lib/engine";
import { getRankByXp } from "@/lib/storage/guestStorage";

interface SubmissionPayload {
  levelId: string;
  program: SpellProgram;
  idempotencyKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmissionPayload = await req.json();
    const { levelId, program } = body;

    // 1. Validasi input dasar
    if (!levelId || typeof levelId !== "string") {
      return NextResponse.json(
        { error: "Parameter levelId tidak valid." },
        { status: 400 }
      );
    }

    if (!program || !Array.isArray(program.nodes)) {
      return NextResponse.json(
        { error: "Struktur program mantra AST tidak valid." },
        { status: 400 }
      );
    }

    // 2. Ambil spesifikasi level dari sumber kebenaran (canonical definitions)
    const level = getLevelById(levelId);
    if (!level) {
      return NextResponse.json(
        { error: `Level dengan ID '${levelId}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    // 3. Eksekusi server-authoritative menggunakan engine independen
    const initialState = createInitialGridState(level.grid);
    const maxSteps = level.maxSteps ?? 150;
    const executionResult = runSpellProgram(
      program,
      initialState,
      level.parSteps,
      {
        objectives: level.objectives,
        maxSteps,
      }
    );

    const isVictory = executionResult.evaluation.isVictory;
    const stepsTaken = executionResult.totalSteps;
    const stars = executionResult.evaluation.stars;
    const baseCalculatedXp = executionResult.evaluation.xpEarned;

    // 4. Periksa sesi Supabase pemain
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // --------------------------------------------------------------------------
    // SKENARIO A: Pemain Guest (Belum login / offline fallback)
    // --------------------------------------------------------------------------
    if (!user) {
      return NextResponse.json({
        success: isVictory,
        verified: true,
        isGuest: true,
        levelId,
        stars: isVictory ? stars : 0,
        stepsTaken,
        xpEarned: isVictory ? baseCalculatedXp : 0,
        message: executionResult.evaluation.message,
        errorDetails: executionResult.errorDetails || null,
      });
    }

    // --------------------------------------------------------------------------
    // SKENARIO B: Pemain Online (Authenticated dengan Supabase Auth)
    // --------------------------------------------------------------------------
    const admin = createAdminClient();

    // Jika eksekusi gagal di server, catat attempt dan kembalikan feedback yang jujur
    if (!isVictory) {
      await admin.from("level_attempts").insert({
        user_id: user.id,
        level_id: levelId,
        is_success: false,
        steps_taken: stepsTaken,
        stars_earned: 0,
        xp_earned: 0,
        submitted_ast: program,
        error_message: executionResult.evaluation.message,
      });

      return NextResponse.json({
        success: false,
        verified: true,
        isGuest: false,
        levelId,
        stars: 0,
        stepsTaken,
        xpEarned: 0,
        message: executionResult.evaluation.message,
        errorDetails: executionResult.errorDetails || null,
      });
    }

    // Jika berhasil: Periksa riwayat progres pemain untuk cegah duplikasi reward
    const { data: existingProgress } = await admin
      .from("player_progress")
      .select("status, stars, best_step_count, attempts_count, first_completed_at")
      .eq("user_id", user.id)
      .eq("level_id", levelId)
      .maybeSingle();

    const isFirstClear =
      !existingProgress || existingProgress.status !== "completed";
    const oldStars = existingProgress ? existingProgress.stars : 0;

    // Hitung penambahan XP yang aman dari replay submission
    let xpDiff = 0;
    if (isFirstClear) {
      xpDiff = baseCalculatedXp;
    } else if (stars > oldStars) {
      const oldXp = oldStars === 1 ? 60 : oldStars === 2 ? 75 : 100;
      xpDiff = Math.max(0, baseCalculatedXp - oldXp);
    }

    // Simpan ke level_attempts (Audit trail)
    await admin.from("level_attempts").insert({
      user_id: user.id,
      level_id: levelId,
      is_success: true,
      steps_taken: stepsTaken,
      stars_earned: stars,
      xp_earned: xpDiff,
      submitted_ast: program,
      error_message: null,
    });

    // Simpan / update ke player_progress
    const newBestSteps =
      existingProgress && existingProgress.best_step_count > 0
        ? Math.min(existingProgress.best_step_count, stepsTaken)
        : stepsTaken;

    await admin.from("player_progress").upsert(
      {
        user_id: user.id,
        level_id: levelId,
        status: "completed",
        stars: Math.max(oldStars, stars),
        best_step_count: newBestSteps,
        best_solution_ast: program,
        attempts_count: (existingProgress?.attempts_count || 0) + 1,
        first_completed_at:
          existingProgress?.first_completed_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, level_id" }
    );

    // Buka level berikutnya di kampanye secara otomatis
    const nextLevel = getNextLevel(levelId);
    if (nextLevel) {
      // Hanya insert jika belum pernah dibuka atau dikerjakan
      const { data: nextProg } = await admin
        .from("player_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("level_id", nextLevel.id)
        .maybeSingle();

      if (!nextProg) {
        await admin.from("player_progress").insert({
          user_id: user.id,
          level_id: nextLevel.id,
          status: "unlocked",
          stars: 0,
          best_step_count: 0,
          attempts_count: 0,
        });
      }
    }

    // Ambil profil pemain untuk memperbarui total XP & Rank
    const { data: profile } = await admin
      .from("profiles")
      .select("total_xp, wizard_rank")
      .eq("id", user.id)
      .maybeSingle();

    const currentXp = profile?.total_xp || 0;
    const newTotalXp = currentXp + xpDiff;
    const newRank = getRankByXp(newTotalXp);

    await admin
      .from("profiles")
      .update({
        total_xp: newTotalXp,
        wizard_rank: newRank,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Evaluasi Milestone Achievements
    const { data: userAchievements } = await admin
      .from("player_achievements")
      .select("achievement_id")
      .eq("user_id", user.id);

    const existingAchievementIds = new Set(
      (userAchievements || []).map((a) => a.achievement_id)
    );
    const newlyGrantedAchievements: string[] = [];

    // Milestone 1: first_spell
    if (!existingAchievementIds.has("first_spell") && stars >= 1) {
      newlyGrantedAchievements.push("first_spell");
    }

    // Milestone 2: three_stars_perfection
    if (!existingAchievementIds.has("three_stars_perfection") && stars === 3) {
      newlyGrantedAchievements.push("three_stars_perfection");
    }

    // Milestone 3: forest_guardian (Semua level World 1 selesai)
    if (!existingAchievementIds.has("forest_guardian")) {
      const { data: w1Completed } = await admin
        .from("player_progress")
        .select("level_id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .like("level_id", "w1-%");

      if (w1Completed && w1Completed.length >= 6) {
        newlyGrantedAchievements.push("forest_guardian");
      }
    }

    // Milestone 4: grand_magus (Semua 12 level selesai)
    if (!existingAchievementIds.has("grand_magus")) {
      const { data: allCompleted } = await admin
        .from("player_progress")
        .select("level_id")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (allCompleted && allCompleted.length >= allLevels.length) {
        newlyGrantedAchievements.push("grand_magus");
      }
    }

    // Insert achievements baru ke database
    if (newlyGrantedAchievements.length > 0) {
      const rowsToInsert = newlyGrantedAchievements.map((achId) => ({
        user_id: user.id,
        achievement_id: achId,
      }));
      await admin.from("player_achievements").insert(rowsToInsert);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      isGuest: false,
      levelId,
      stars,
      stepsTaken,
      xpEarned: xpDiff,
      totalXp: newTotalXp,
      wizardRank: newRank,
      isNewRank: profile?.wizard_rank !== newRank,
      unlockedLevelId: nextLevel?.id || null,
      achievementsUnlocked: newlyGrantedAchievements,
      message: executionResult.evaluation.message,
    });
  } catch (err: unknown) {
    console.error("Progress submission error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat memproses progres." },
      { status: 500 }
    );
  }
}
