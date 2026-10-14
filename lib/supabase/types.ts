import { SpellProgram } from "../engine/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_id: string;
          total_xp: number;
          wizard_rank: string;
          active_familiar_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string;
          avatar_id?: string;
          total_xp?: number;
          wizard_rank?: string;
          active_familiar_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_id?: string;
          total_xp?: number;
          wizard_rank?: string;
          active_familiar_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      levels: {
        Row: {
          id: string;
          world_number: number;
          level_number: number;
          world_title: string;
          title: string;
          description: string;
          concept_tag: string;
          objective_text: string;
          grid_config: Json;
          allowed_runes: Json;
          par_steps: number;
          base_xp: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          world_number: number;
          level_number: number;
          world_title?: string;
          title: string;
          description: string;
          concept_tag?: string;
          objective_text?: string;
          grid_config?: Json;
          allowed_runes?: Json;
          par_steps: number;
          base_xp?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          world_number?: number;
          level_number?: number;
          world_title?: string;
          title?: string;
          description?: string;
          concept_tag?: string;
          objective_text?: string;
          grid_config?: Json;
          allowed_runes?: Json;
          par_steps?: number;
          base_xp?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      player_progress: {
        Row: {
          id: string;
          user_id: string;
          level_id: string;
          status: "unlocked" | "completed";
          stars: number;
          best_step_count: number | null;
          best_solution_ast: SpellProgram | null;
          attempts_count: number;
          first_completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level_id: string;
          status?: "unlocked" | "completed";
          stars?: number;
          best_step_count?: number | null;
          best_solution_ast?: SpellProgram | null;
          attempts_count?: number;
          first_completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level_id?: string;
          status?: "unlocked" | "completed";
          stars?: number;
          best_step_count?: number | null;
          best_solution_ast?: SpellProgram | null;
          attempts_count?: number;
          first_completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_progress_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          }
        ];
      };
      level_attempts: {
        Row: {
          id: string;
          user_id: string;
          level_id: string;
          submitted_ast: SpellProgram;
          is_success: boolean;
          result_status: string;
          steps_taken: number;
          stars_earned: number;
          xp_earned: number;
          execution_time_ms: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level_id: string;
          submitted_ast: SpellProgram;
          is_success?: boolean;
          result_status?: string;
          steps_taken: number;
          stars_earned?: number;
          xp_earned?: number;
          execution_time_ms?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level_id?: string;
          submitted_ast?: SpellProgram;
          is_success?: boolean;
          result_status?: string;
          steps_taken?: number;
          stars_earned?: number;
          xp_earned?: number;
          execution_time_ms?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "level_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "level_attempts_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          }
        ];
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon_name: string;
          category: string;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          icon_name: string;
          category?: string;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon_name?: string;
          category?: string;
          xp_reward?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      player_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          }
        ];
      };
      familiars: {
        Row: {
          id: string;
          name: string;
          species: string;
          element: string;
          lore_description: string;
          description: string;
          asset_key: string;
          rarity: string;
          unlock_xp_required: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          species?: string;
          element?: string;
          lore_description?: string;
          description?: string;
          asset_key?: string;
          rarity?: string;
          unlock_xp_required?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          species?: string;
          element?: string;
          lore_description?: string;
          description?: string;
          asset_key?: string;
          rarity?: string;
          unlock_xp_required?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      player_familiars: {
        Row: {
          id: string;
          user_id: string;
          familiar_id: string;
          bond_level: number;
          is_active: boolean;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          familiar_id: string;
          bond_level?: number;
          is_active?: boolean;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          familiar_id?: string;
          bond_level?: number;
          is_active?: boolean;
          unlocked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_familiars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_familiars_familiar_id_fkey";
            columns: ["familiar_id"];
            isOneToOne: false;
            referencedRelation: "familiars";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type LevelRow = Database["public"]["Tables"]["levels"]["Row"];
export type PlayerProgressRow = Database["public"]["Tables"]["player_progress"]["Row"];
export type LevelAttemptRow = Database["public"]["Tables"]["level_attempts"]["Row"];
export type AchievementRow = Database["public"]["Tables"]["achievements"]["Row"];
export type PlayerAchievementRow = Database["public"]["Tables"]["player_achievements"]["Row"];
export type FamiliarRow = Database["public"]["Tables"]["familiars"]["Row"];
export type PlayerFamiliarRow = Database["public"]["Tables"]["player_familiars"]["Row"];
