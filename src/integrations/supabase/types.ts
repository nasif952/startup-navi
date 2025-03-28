export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          business_activity: string | null
          created_at: string | null
          founded_year: number | null
          id: string
          industry: string | null
          last_revenue: number | null
          name: string
          stage: string | null
          total_employees: number | null
          updated_at: string | null
        }
        Insert: {
          business_activity?: string | null
          created_at?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          last_revenue?: number | null
          name?: string
          stage?: string | null
          total_employees?: number | null
          updated_at?: string | null
        }
        Update: {
          business_activity?: string | null
          created_at?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          last_revenue?: number | null
          name?: string
          stage?: string | null
          total_employees?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questionnaire_questions: {
        Row: {
          created_at: string | null
          id: string
          question: string
          question_number: string
          questionnaire_id: string | null
          response: string | null
          response_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          question: string
          question_number: string
          questionnaire_id?: string | null
          response?: string | null
          response_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          question_number?: string
          questionnaire_id?: string | null
          response?: string | null
          response_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          step: string
          step_number: number
          title: string
          updated_at: string | null
          valuation_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          step: string
          step_number: number
          title: string
          updated_at?: string | null
          valuation_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          step?: string
          step_number?: number
          title?: string
          updated_at?: string | null
          valuation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaires_valuation_id_fkey"
            columns: ["valuation_id"]
            isOneToOne: false
            referencedRelation: "valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      valuations: {
        Row: {
          annual_roi: number | null
          company_id: string | null
          created_at: string | null
          funds_raised: number | null
          id: string
          industry_multiple: number | null
          initial_estimate: number | null
          investment: number | null
          last_year_ebitda: number | null
          post_money_valuation: number | null
          pre_money_valuation: number | null
          selected_valuation: number | null
          updated_at: string | null
          valuation_max: number | null
          valuation_min: number | null
        }
        Insert: {
          annual_roi?: number | null
          company_id?: string | null
          created_at?: string | null
          funds_raised?: number | null
          id?: string
          industry_multiple?: number | null
          initial_estimate?: number | null
          investment?: number | null
          last_year_ebitda?: number | null
          post_money_valuation?: number | null
          pre_money_valuation?: number | null
          selected_valuation?: number | null
          updated_at?: string | null
          valuation_max?: number | null
          valuation_min?: number | null
        }
        Update: {
          annual_roi?: number | null
          company_id?: string | null
          created_at?: string | null
          funds_raised?: number | null
          id?: string
          industry_multiple?: number | null
          initial_estimate?: number | null
          investment?: number | null
          last_year_ebitda?: number | null
          post_money_valuation?: number | null
          pre_money_valuation?: number | null
          selected_valuation?: number | null
          updated_at?: string | null
          valuation_max?: number | null
          valuation_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valuations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
