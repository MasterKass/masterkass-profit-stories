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
      mk_bonus_ops: {
        Row: {
          amount: number
          created_at: string
          evotor_user_id: string | null
          guest_key: string
          id: string
          points: number
          receipt_at: string | null
          receipt_id: string
          store_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          evotor_user_id?: string | null
          guest_key: string
          id?: string
          points: number
          receipt_at?: string | null
          receipt_id: string
          store_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          evotor_user_id?: string | null
          guest_key?: string
          id?: string
          points?: number
          receipt_at?: string | null
          receipt_id?: string
          store_id?: string | null
        }
        Relationships: []
      }
      mk_devices: {
        Row: {
          device_id: string
          evotor_user_id: string | null
          model: string | null
          name: string | null
          raw: Json | null
          serial_number: string | null
          store_id: string | null
          updated_at: string
        }
        Insert: {
          device_id: string
          evotor_user_id?: string | null
          model?: string | null
          name?: string | null
          raw?: Json | null
          serial_number?: string | null
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          device_id?: string
          evotor_user_id?: string | null
          model?: string | null
          name?: string | null
          raw?: Json | null
          serial_number?: string | null
          store_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mk_evotor_accounts: {
        Row: {
          api_token: string | null
          deal_id: number | null
          evotor_user_id: string
          installed: boolean
          installed_at: string | null
          linked_at: string | null
          phone: string | null
          redeem_percent: number
          removed_at: string | null
          updated_at: string
        }
        Insert: {
          api_token?: string | null
          deal_id?: number | null
          evotor_user_id: string
          installed?: boolean
          installed_at?: string | null
          linked_at?: string | null
          phone?: string | null
          redeem_percent?: number
          removed_at?: string | null
          updated_at?: string
        }
        Update: {
          api_token?: string | null
          deal_id?: number | null
          evotor_user_id?: string
          installed?: boolean
          installed_at?: string | null
          linked_at?: string | null
          phone?: string | null
          redeem_percent?: number
          removed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mk_guests: {
        Row: {
          balance: number
          created_at: string
          guest_key: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          guest_key: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          guest_key?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      mk_apply_bonus: {
        Args: {
          p_amount: number
          p_evotor_user_id: string
          p_guest_key: string
          p_points: number
          p_receipt_at: string
          p_receipt_id: string
          p_store_id: string
        }
        Returns: number
      }
      mk_redeem_bonus: {
        Args: {
          p_amount: number
          p_evotor_user_id: string
          p_guest_key: string
          p_points: number
          p_request_id: string
          p_store_id: string
        }
        Returns: number
      }
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
