export type FrequencyType = "daily" | "alternate" | "specific_days";

export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          sort_order: number;
          is_active: boolean;
          frequency_type: FrequencyType;
          frequency_days: number[] | null;
          frequency_start_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          sort_order?: number;
          is_active?: boolean;
          frequency_type?: FrequencyType;
          frequency_days?: number[] | null;
          frequency_start_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          sort_order?: number;
          is_active?: boolean;
          frequency_type?: FrequencyType;
          frequency_days?: number[] | null;
          frequency_start_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      completions: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          date: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          date?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          date?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type Completion = Database["public"]["Tables"]["completions"]["Row"];
