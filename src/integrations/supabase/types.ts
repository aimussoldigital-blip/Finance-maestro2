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
            accounts: {
                Row: {
                    account_type: string | null
                    balance: number | null
                    bank_id: string | null
                    created_at: string
                    id: string
                    name: string
                    user_id: string
                }
                Insert: {
                    account_type?: string | null
                    balance?: number | null
                    bank_id?: string | null
                    created_at?: string
                    id?: string
                    name: string
                    user_id: string
                }
                Update: {
                    account_type?: string | null
                    balance?: number | null
                    bank_id?: string | null
                    created_at?: string
                    id?: string
                    name?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "accounts_bank_id_fkey"
                        columns: ["bank_id"]
                        isOneToOne: false
                        referencedRelation: "banks"
                        referencedColumns: ["id"]
                    },
                ]
            }
            banks: {
                Row: {
                    created_at: string
                    icon: string | null
                    id: string
                    name: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    icon?: string | null
                    id?: string
                    name: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    icon?: string | null
                    id?: string
                    name?: string
                    user_id?: string
                }
                Relationships: []
            }
            categories: {
                Row: {
                    color: string | null
                    created_at: string
                    icon: string | null
                    id: string
                    is_default: boolean | null
                    name: string
                    type: string
                    user_id: string
                }
                Insert: {
                    color?: string | null
                    created_at?: string
                    icon?: string | null
                    id?: string
                    is_default?: boolean | null
                    name: string
                    type: string
                    user_id: string
                }
                Update: {
                    color?: string | null
                    created_at?: string
                    icon?: string | null
                    id?: string
                    is_default?: boolean | null
                    name?: string
                    type?: string
                    user_id?: string
                }
                Relationships: []
            }
            goal_contributions: {
                Row: {
                    amount: number
                    created_at: string
                    goal_id: string
                    id: string
                    note: string | null
                    user_id: string
                }
                Insert: {
                    amount: number
                    created_at?: string
                    goal_id: string
                    id?: string
                    note?: string | null
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    goal_id?: string
                    id?: string
                    note?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "goal_contributions_goal_id_fkey"
                        columns: ["goal_id"]
                        isOneToOne: false
                        referencedRelation: "goals"
                        referencedColumns: ["id"]
                    },
                ]
            }
            goals: {
                Row: {
                    created_at: string
                    current_amount: number
                    icon: string | null
                    id: string
                    image_url: string | null
                    is_archived: boolean | null
                    name: string
                    target_amount: number
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    current_amount?: number
                    icon?: string | null
                    id?: string
                    image_url?: string | null
                    is_archived?: boolean | null
                    name: string
                    target_amount: number
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    current_amount?: number
                    icon?: string | null
                    id?: string
                    image_url?: string | null
                    is_archived?: boolean | null
                    name?: string
                    target_amount?: number
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
            investment_contributions: {
                Row: {
                    amount: number
                    contribution_date: string
                    created_at: string
                    id: string
                    investment_id: string
                    note: string | null
                    user_id: string
                }
                Insert: {
                    amount: number
                    contribution_date?: string
                    created_at?: string
                    id?: string
                    investment_id: string
                    note?: string | null
                    user_id: string
                }
                Update: {
                    amount?: number
                    contribution_date?: string
                    created_at?: string
                    id?: string
                    investment_id?: string
                    note?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "investment_contributions_investment_id_fkey"
                        columns: ["investment_id"]
                        isOneToOne: false
                        referencedRelation: "investments"
                        referencedColumns: ["id"]
                    },
                ]
            }
            investments: {
                Row: {
                    asset_type: string
                    created_at: string
                    current_value: number | null
                    icon: string | null
                    id: string
                    invested_amount: number | null
                    is_archived: boolean | null
                    name: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    asset_type?: string
                    created_at?: string
                    current_value?: number | null
                    icon?: string | null
                    id?: string
                    invested_amount?: number | null
                    is_archived?: boolean | null
                    name: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    asset_type?: string
                    created_at?: string
                    current_value?: number | null
                    icon?: string | null
                    id?: string
                    invested_amount?: number | null
                    is_archived?: boolean | null
                    name?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
            movements: {
                Row: {
                    account_id: string | null
                    amount: number
                    category_id: string | null
                    concept: string | null
                    created_at: string
                    date: string
                    id: string
                    origin: string | null
                    type: string
                    user_id: string
                }
                Insert: {
                    account_id?: string | null
                    amount: number
                    category_id?: string | null
                    concept?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    origin?: string | null
                    type: string
                    user_id: string
                }
                Update: {
                    account_id?: string | null
                    amount?: number
                    category_id?: string | null
                    concept?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    origin?: string | null
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "movements_account_id_fkey"
                        columns: ["account_id"]
                        isOneToOne: false
                        referencedRelation: "accounts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "movements_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string
                    display_name: string | null
                    email: string | null
                    id: string
                    is_blocked: boolean
                    role: string
                }
                Insert: {
                    created_at?: string
                    display_name?: string | null
                    email?: string | null
                    id: string
                    is_blocked?: boolean
                    role?: string
                }
                Update: {
                    created_at?: string
                    display_name?: string | null
                    email?: string | null
                    id?: string
                    is_blocked?: boolean
                    role?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            delete_user: { Args: { user_id: string }; Returns: undefined }
            get_all_users: {
                Args: never
                Returns: {
                    created_at: string
                    email: string
                    id: string
                    is_blocked: boolean
                    last_sign_in_at: string
                    role: string
                }[]
            }
            is_admin: { Args: never; Returns: boolean }
            toggle_user_block: {
                Args: { should_block: boolean; user_id: string }
                Returns: undefined
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
