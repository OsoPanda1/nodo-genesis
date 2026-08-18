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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      business_payments: {
        Row: {
          business_id: string
          created_at: string
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          images: Json | null
          lat: number | null
          lng: number | null
          name: string
          owner_id: string | null
          phone: string | null
          plan: string | null
          price_range: string | null
          social_links: Json | null
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          lat?: number | null
          lng?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          price_range?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          price_range?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          images: Json | null
          location: string | null
          status: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          images?: Json | null
          location?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          images?: Json | null
          location?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dichos: {
        Row: {
          categoria: string
          created_at: string
          id: string
          jerga_original: string
          likes: number | null
          personaje: string
          significado: string
          texto: string
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          jerga_original: string
          likes?: number | null
          personaje: string
          significado: string
          texto: string
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          jerga_original?: string
          likes?: number | null
          personaje?: string
          significado?: string
          texto?: string
        }
        Relationships: []
      }
      federation_data_streams: {
        Row: {
          created_at: string
          downstream_repo: string | null
          federation: string
          id: string
          integrity_hash: string | null
          last_synced_at: string | null
          payload: Json
          source_repo: string
          stream_type: string
          sync_status: string
          upstream_repo: string | null
        }
        Insert: {
          created_at?: string
          downstream_repo?: string | null
          federation: string
          id?: string
          integrity_hash?: string | null
          last_synced_at?: string | null
          payload?: Json
          source_repo: string
          stream_type?: string
          sync_status?: string
          upstream_repo?: string | null
        }
        Update: {
          created_at?: string
          downstream_repo?: string | null
          federation?: string
          id?: string
          integrity_hash?: string | null
          last_synced_at?: string | null
          payload?: Json
          source_repo?: string
          stream_type?: string
          sync_status?: string
          upstream_repo?: string | null
        }
        Relationships: []
      }
      guardian_actions: {
        Row: {
          action_type: string
          created_at: string | null
          ethical_flags: Json | null
          explanation: string | null
          guardian_id: string | null
          id: string
          isabella_confidence: number | null
          isabella_recommendation: string | null
          msr_hash: string | null
          resolved_at: string | null
          status: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          ethical_flags?: Json | null
          explanation?: string | null
          guardian_id?: string | null
          id?: string
          isabella_confidence?: number | null
          isabella_recommendation?: string | null
          msr_hash?: string | null
          resolved_at?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          ethical_flags?: Json | null
          explanation?: string | null
          guardian_id?: string | null
          id?: string
          isabella_confidence?: number | null
          isabella_recommendation?: string | null
          msr_hash?: string | null
          resolved_at?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      interactions: {
        Row: {
          created_at: string
          id: string
          intent: string
          latency_ms: number | null
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          intent: string
          latency_ms?: number | null
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          intent?: string
          latency_ms?: number | null
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      package_businesses: {
        Row: {
          business_id: string
          id: string
          package_id: string
        }
        Insert: {
          business_id: string
          id?: string
          package_id: string
        }
        Update: {
          business_id?: string
          id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_businesses_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_places: {
        Row: {
          id: string
          order_index: number | null
          package_id: string
          place_id: string
        }
        Insert: {
          id?: string
          order_index?: number | null
          package_id: string
          place_id: string
        }
        Update: {
          id?: string
          order_index?: number | null
          package_id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_places_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          hero_image: string | null
          id: string
          includes: Json | null
          intensity: string | null
          name: string
          price_from: number | null
          slug: string
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          hero_image?: string | null
          id?: string
          includes?: Json | null
          intensity?: string | null
          name: string
          price_from?: number | null
          slug: string
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          hero_image?: string | null
          id?: string
          includes?: Json | null
          intensity?: string | null
          name?: string
          price_from?: number | null
          slug?: string
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          metadata: Json | null
          name: string
          rating: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          metadata?: Json | null
          name: string
          rating?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          metadata?: Json | null
          name?: string
          rating?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_guardian: boolean
          role: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_guardian?: boolean
          role?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_guardian?: boolean
          role?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      ratings_businesses: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          id: string
          score: number
          user_id: string | null
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          id?: string
          score: number
          user_id?: string | null
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings_places: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          place_id: string
          score: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          place_id: string
          score: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          place_id?: string
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      shuttle_bookings: {
        Row: {
          booking_status: string | null
          created_at: string
          id: string
          passengers: number | null
          payment_status: string | null
          route_id: string
          total_amount: number | null
          travel_date: string
          user_id: string | null
        }
        Insert: {
          booking_status?: string | null
          created_at?: string
          id?: string
          passengers?: number | null
          payment_status?: string | null
          route_id: string
          total_amount?: number | null
          travel_date: string
          user_id?: string | null
        }
        Update: {
          booking_status?: string | null
          created_at?: string
          id?: string
          passengers?: number | null
          payment_status?: string | null
          route_id?: string
          total_amount?: number | null
          travel_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "shuttle_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      shuttle_companies: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          logo: string | null
          monthly_plan: string | null
          name: string
          owner_id: string | null
          phone: string | null
          rfc: string | null
          status: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          logo?: string | null
          monthly_plan?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          rfc?: string | null
          status?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          logo?: string | null
          monthly_plan?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          rfc?: string | null
          status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      shuttle_routes: {
        Row: {
          capacity: number | null
          company_id: string
          created_at: string
          days_of_week: Json | null
          departure_time: string | null
          destination: string
          id: string
          origin: string
          pickup_points: Json | null
          price_per_person: number | null
          return_time: string | null
          status: string | null
        }
        Insert: {
          capacity?: number | null
          company_id: string
          created_at?: string
          days_of_week?: Json | null
          departure_time?: string | null
          destination?: string
          id?: string
          origin?: string
          pickup_points?: Json | null
          price_per_person?: number | null
          return_time?: string | null
          status?: string | null
        }
        Update: {
          capacity?: number | null
          company_id?: string
          created_at?: string
          days_of_week?: Json | null
          departure_time?: string | null
          destination?: string
          id?: string
          origin?: string
          pickup_points?: Json | null
          price_per_person?: number | null
          return_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shuttle_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          artist: string
          audio_url: string
          cover_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean
          play_count: number
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          artist?: string
          audio_url: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          play_count?: number
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          artist?: string
          audio_url?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          play_count?: number
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      transport_providers: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          name: string
          owner_id: string | null
          phone: string | null
          plate: string | null
          service_area: string | null
          status: string | null
          type: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          phone?: string | null
          plate?: string | null
          service_area?: string | null
          status?: string | null
          type?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          phone?: string | null
          plate?: string | null
          service_area?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      transport_requests: {
        Row: {
          created_at: string
          dropoff_location: string
          id: string
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_location: string
          provider_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dropoff_location: string
          id?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location: string
          provider_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dropoff_location?: string
          id?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string
          provider_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "comercio" | "usuario"
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
      app_role: ["admin", "comercio", "usuario"],
    },
  },
} as const
