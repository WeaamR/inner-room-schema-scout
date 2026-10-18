export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      character_explorations: {
        Row: {
          author_reflection: string | null
          character_id: string
          created_at: string
          decision_text: string | null
          dilemma_question_snapshot: string
          dilemma_question_snapshot_ar: string
          id: string
          motivation_text: string | null
          potential_cost: string | null
          scenario_id: string
          scenario_premise_snapshot: string
          scenario_premise_snapshot_ar: string
          scenario_title_snapshot: string
          scenario_title_snapshot_ar: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_reflection?: string | null
          character_id: string
          created_at?: string
          decision_text?: string | null
          dilemma_question_snapshot: string
          dilemma_question_snapshot_ar: string
          id?: string
          motivation_text?: string | null
          potential_cost?: string | null
          scenario_id: string
          scenario_premise_snapshot: string
          scenario_premise_snapshot_ar: string
          scenario_title_snapshot: string
          scenario_title_snapshot_ar: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          author_reflection?: string | null
          character_id?: string
          created_at?: string
          decision_text?: string | null
          dilemma_question_snapshot?: string
          dilemma_question_snapshot_ar?: string
          id?: string
          motivation_text?: string | null
          potential_cost?: string | null
          scenario_id?: string
          scenario_premise_snapshot?: string
          scenario_premise_snapshot_ar?: string
          scenario_title_snapshot?: string
          scenario_title_snapshot_ar?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_explorations_character_owner_fkey"
            columns: ["character_id", "user_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "character_explorations_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenario_library"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          backstory: string | null
          core_belief: string | null
          created_at: string
          desire: string | null
          fear: string | null
          id: string
          inner_conflict: string | null
          name: string
          project_id: string
          public_persona: string | null
          red_line: string | null
          role: string
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backstory?: string | null
          core_belief?: string | null
          created_at?: string
          desire?: string | null
          fear?: string | null
          id?: string
          inner_conflict?: string | null
          name: string
          project_id: string
          public_persona?: string | null
          red_line?: string | null
          role?: string
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          backstory?: string | null
          core_belief?: string | null
          created_at?: string
          desire?: string | null
          fear?: string | null
          id?: string
          inner_conflict?: string | null
          name?: string
          project_id?: string
          public_persona?: string | null
          red_line?: string | null
          role?: string
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_project_owner_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "writing_projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      scenario_library: {
        Row: {
          category: string
          created_at: string
          dilemma_question: string
          dilemma_question_ar: string
          id: string
          is_published: boolean
          premise: string
          premise_ar: string
          slug: string
          sort_order: number
          tension_level: number
          title: string
          title_ar: string
        }
        Insert: {
          category: string
          created_at?: string
          dilemma_question: string
          dilemma_question_ar: string
          id?: string
          is_published?: boolean
          premise: string
          premise_ar: string
          slug: string
          sort_order?: number
          tension_level?: number
          title: string
          title_ar: string
        }
        Update: {
          category?: string
          created_at?: string
          dilemma_question?: string
          dilemma_question_ar?: string
          id?: string
          is_published?: boolean
          premise?: string
          premise_ar?: string
          slug?: string
          sort_order?: number
          tension_level?: number
          title?: string
          title_ar?: string
        }
        Relationships: []
      }
      writing_projects: {
        Row: {
          created_at: string
          genre: string | null
          id: string
          status: string
          synopsis: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          genre?: string | null
          id?: string
          status?: string
          synopsis?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          genre?: string | null
          id?: string
          status?: string
          synopsis?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
