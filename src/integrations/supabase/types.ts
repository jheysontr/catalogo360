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
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_purchase: number | null
          store_id: string
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          store_id: string
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          store_id?: string
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores_public"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
          store_id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          store_id: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          store_id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores_public"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          status: string
          store_id: string
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          items?: Json
          status?: string
          store_id: string
          total_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          status?: string
          store_id?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores_public"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_referral_config: {
        Row: {
          commission_type: string
          commission_value: number
          created_at: string
          id: string
          is_active: boolean
          min_plan_price: number
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          is_active?: boolean
          min_plan_price?: number
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          is_active?: boolean
          min_plan_price?: number
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      platform_referrals: {
        Row: {
          commission_amount: number
          created_at: string
          id: string
          plan_name: string | null
          plan_price: number
          referred_email: string
          referred_store_name: string | null
          referred_user_id: string | null
          referrer_code: string
          referrer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          commission_amount?: number
          created_at?: string
          id?: string
          plan_name?: string | null
          plan_price?: number
          referred_email?: string
          referred_store_name?: string | null
          referred_user_id?: string | null
          referrer_code: string
          referrer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          id?: string
          plan_name?: string | null
          plan_price?: number
          referred_email?: string
          referred_store_name?: string | null
          referred_user_id?: string | null
          referrer_code?: string
          referrer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "platform_referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_referrers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          referral_code: string
          total_earned: number
          total_referrals: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          referral_code: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          referral_code?: string
          total_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          annual_price: number
          created_at: string
          enabled_modules: Json
          features: Json
          id: string
          max_products: number
          max_stores: number
          monthly_price: number
          name: string
          updated_at: string
        }
        Insert: {
          annual_price?: number
          created_at?: string
          enabled_modules?: Json
          features?: Json
          id?: string
          max_products?: number
          max_stores?: number
          monthly_price?: number
          name: string
          updated_at?: string
        }
        Update: {
          annual_price?: number
          created_at?: string
          enabled_modules?: Json
          features?: Json
          id?: string
          max_products?: number
          max_stores?: number
          monthly_price?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          attributes: Json | null
          category_id: string | null
          created_at: string
          description: string | null
          discount_percent: number | null
          extra_images: Json
          id: string
          image_url: string | null
          name: string
          on_sale: boolean
          price: number
          stock: number
          store_id: string
          updated_at: string
          variant_prices: Json
          variant_stock: Json
        }
        Insert: {
          attributes?: Json | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          extra_images?: Json
          id?: string
          image_url?: string | null
          name: string
          on_sale?: boolean
          price?: number
          stock?: number
          store_id: string
          updated_at?: string
          variant_prices?: Json
          variant_stock?: Json
        }
        Update: {
          attributes?: Json | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          extra_images?: Json
          id?: string
          image_url?: string | null
          name?: string
          on_sale?: boolean
          price?: number
          stock?: number
          store_id?: string
          updated_at?: string
          variant_prices?: Json
          variant_stock?: Json
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          address: string | null
          city: string | null
          cost: number
          created_at: string
          estimated_delivery_date: string | null
          id: string
          order_id: string
          phone: string | null
          postal_code: string | null
          shipping_method: string
          status: string
          store_id: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cost?: number
          created_at?: string
          estimated_delivery_date?: string | null
          id?: string
          order_id: string
          phone?: string | null
          postal_code?: string | null
          shipping_method?: string
          status?: string
          store_id: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cost?: number
          created_at?: string
          estimated_delivery_date?: string | null
          id?: string
          order_id?: string
          phone?: string | null
          postal_code?: string | null
          shipping_method?: string
          status?: string
          store_id?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores_public"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string
          currency: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          linkbox_config: Json | null
          logo_url: string | null
          payment_methods: Json
          plan_id: string | null
          primary_color: string | null
          secondary_color: string | null
          shipping_config: Json | null
          social_media: Json | null
          store_name: string
          store_slug: string
          storefront_config: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          linkbox_config?: Json | null
          logo_url?: string | null
          payment_methods?: Json
          plan_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shipping_config?: Json | null
          social_media?: Json | null
          store_name: string
          store_slug: string
          storefront_config?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          linkbox_config?: Json | null
          logo_url?: string | null
          payment_methods?: Json
          plan_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shipping_config?: Json | null
          social_media?: Json | null
          store_name?: string
          store_slug?: string
          storefront_config?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      stores_public: {
        Row: {
          banner_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          linkbox_config: Json | null
          logo_url: string | null
          plan_id: string | null
          primary_color: string | null
          secondary_color: string | null
          social_media: Json | null
          store_name: string | null
          store_slug: string | null
          storefront_config: Json | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          linkbox_config?: Json | null
          logo_url?: string | null
          plan_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          social_media?: Json | null
          store_name?: string | null
          store_slug?: string | null
          storefront_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          linkbox_config?: Json | null
          logo_url?: string | null
          plan_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          social_media?: Json | null
          store_name?: string | null
          store_slug?: string | null
          storefront_config?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_tracking_number: { Args: never; Returns: string }
      generate_unique_slug: { Args: { base_name: string }; Returns: string }
      get_store_checkout_config: { Args: { p_store_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_store: { Args: { store_uuid: string }; Returns: boolean }
      validate_coupon: {
        Args: { p_code: string; p_store_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
