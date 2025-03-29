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
      business_model: {
        Row: {
          company_id: string | null
          content: string | null
          created_at: string | null
          id: string
          section: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          section: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          section?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_model_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
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
      esops: {
        Row: {
          created_at: string | null
          id: string
          name: string
          total_shares: number
          updated_at: string | null
          vesting_period: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          total_shares: number
          updated_at?: string | null
          vesting_period?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          total_shares?: number
          updated_at?: string | null
          vesting_period?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string | null
          file_size: string | null
          file_type: string | null
          folder_id: string | null
          id: string
          name: string
          owner: string
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: string | null
          file_type?: string | null
          folder_id?: string | null
          id?: string
          name: string
          owner: string
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: string | null
          file_type?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          owner?: string
          storage_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_rounds: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          is_foundation: boolean | null
          name: string
          updated_at: string | null
          valuation: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          is_foundation?: boolean | null
          name: string
          updated_at?: string | null
          valuation?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          is_foundation?: boolean | null
          name?: string
          updated_at?: string | null
          valuation?: number | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          capital_invested: number
          created_at: string | null
          id: string
          number_of_shares: number
          round_id: string | null
          share_class_id: string | null
          share_price: number
          shareholder_id: string | null
          updated_at: string | null
        }
        Insert: {
          capital_invested: number
          created_at?: string | null
          id?: string
          number_of_shares: number
          round_id?: string | null
          share_class_id?: string | null
          share_price: number
          shareholder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capital_invested?: number
          created_at?: string | null
          id?: string
          number_of_shares?: number
          round_id?: string | null
          share_class_id?: string | null
          share_price?: number
          shareholder_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_share_class_id_fkey"
            columns: ["share_class_id"]
            isOneToOne: false
            referencedRelation: "share_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholder_investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          interest_rate: number | null
          name: string
          term_months: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          name: string
          term_months?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          name?: string
          term_months?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_custom: boolean | null
          is_default: boolean | null
          name: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_custom?: boolean | null
          is_default?: boolean | null
          name: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_custom?: boolean | null
          is_default?: boolean | null
          name?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_values: {
        Row: {
          actual: number | null
          created_at: string | null
          id: string
          metric_id: string | null
          month: number
          target: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          actual?: number | null
          created_at?: string | null
          id?: string
          metric_id?: string | null
          month: number
          target?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          actual?: number | null
          created_at?: string | null
          id?: string
          metric_id?: string | null
          month?: number
          target?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_values_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "performance_metrics"
            referencedColumns: ["id"]
          },
        ]
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
      round_summaries: {
        Row: {
          created_at: string | null
          id: string
          round_id: string | null
          total_capital: number
          total_shares: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          round_id?: string | null
          total_capital?: number
          total_shares?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          round_id?: string | null
          total_capital?: number
          total_shares?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_summaries_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      share_classes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          preferred_dividend: number | null
          rights: string | null
          updated_at: string | null
          voting_rights: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          preferred_dividend?: number | null
          rights?: string | null
          updated_at?: string | null
          voting_rights?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          preferred_dividend?: number | null
          rights?: string | null
          updated_at?: string | null
          voting_rights?: boolean | null
        }
        Relationships: []
      }
      shareholders: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
      shareholder_investments: {
        Row: {
          contact: string | null
          id: string | null
          name: string | null
          total_invested: number | null
          total_investments: number | null
          total_shares: number | null
        }
        Relationships: []
      }
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
