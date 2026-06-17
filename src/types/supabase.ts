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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          condition_type: string
          condition_value: number | null
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          condition_type: string
          condition_value?: number | null
          created_at?: string | null
          description: string
          icon: string
          id: string
          is_active?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          condition_type?: string
          condition_value?: number | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      budget_limits: {
        Row: {
          category: string
          created_at: string | null
          id: string
          monthly_limit: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          monthly_limit: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          monthly_limit?: number
          user_id?: string
        }
        Relationships: []
      }
      budget_streak_history: {
        Row: {
          all_categories_within_limit: boolean
          created_at: string | null
          daily_total: number | null
          exceeded_categories: string[] | null
          id: string
          record_date: string
          user_id: string
        }
        Insert: {
          all_categories_within_limit: boolean
          created_at?: string | null
          daily_total?: number | null
          exceeded_categories?: string[] | null
          id?: string
          record_date: string
          user_id: string
        }
        Update: {
          all_categories_within_limit?: boolean
          created_at?: string | null
          daily_total?: number | null
          exceeded_categories?: string[] | null
          id?: string
          record_date?: string
          user_id?: string
        }
        Relationships: []
      }
      estimated_reminder_amounts: {
        Row: {
          calculated_at: string | null
          calculation_method: string
          created_at: string | null
          estimated_amount: number
          id: string
          reminder_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          calculation_method: string
          created_at?: string | null
          estimated_amount: number
          id?: string
          reminder_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          calculation_method?: string
          created_at?: string | null
          estimated_amount?: number
          id?: string
          reminder_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimated_reminder_amounts_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          notes: string | null
          spent_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          spent_at: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          spent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          received_at: string
          source: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          received_at: string
          source: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          received_at?: string
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_payments: {
        Row: {
          amount_paid: number
          created_at: string | null
          id: string
          paid_at: string
          reminder_id: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          id?: string
          paid_at: string
          reminder_id: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          id?: string
          paid_at?: string
          reminder_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_payments_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          category: string
          created_at: string | null
          cutoff_day: number | null
          due_day: number
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          recurrence: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          cutoff_day?: number | null
          due_day: number
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          recurrence: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          cutoff_day?: number | null
          due_day?: number
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          recurrence?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          month: number
          target_amount: number | null
          target_percentage: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          month: number
          target_amount?: number | null
          target_percentage?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          month?: number
          target_amount?: number | null
          target_percentage?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          is_viewed: boolean | null
          metadata: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          metadata?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          metadata?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dashboard_settings: {
        Row: {
          achievements_expanded: boolean | null
          budget_alerts_expanded: boolean | null
          budget_streak_expanded: boolean | null
          created_at: string | null
          credit_cards_expanded: boolean | null
          id: string
          monthly_overview_expanded: boolean | null
          quick_stats_expanded: boolean | null
          recent_activity_expanded: boolean | null
          savings_goals_expanded: boolean | null
          stats_visibility: boolean | null
          updated_at: string | null
          urgent_alerts_expanded: boolean | null
          user_id: string
        }
        Insert: {
          achievements_expanded?: boolean | null
          budget_alerts_expanded?: boolean | null
          budget_streak_expanded?: boolean | null
          created_at?: string | null
          credit_cards_expanded?: boolean | null
          id?: string
          monthly_overview_expanded?: boolean | null
          quick_stats_expanded?: boolean | null
          recent_activity_expanded?: boolean | null
          savings_goals_expanded?: boolean | null
          stats_visibility?: boolean | null
          updated_at?: string | null
          urgent_alerts_expanded?: boolean | null
          user_id: string
        }
        Update: {
          achievements_expanded?: boolean | null
          budget_alerts_expanded?: boolean | null
          budget_streak_expanded?: boolean | null
          created_at?: string | null
          credit_cards_expanded?: boolean | null
          id?: string
          monthly_overview_expanded?: boolean | null
          quick_stats_expanded?: boolean | null
          recent_activity_expanded?: boolean | null
          savings_goals_expanded?: boolean | null
          stats_visibility?: boolean | null
          updated_at?: string | null
          urgent_alerts_expanded?: boolean | null
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
