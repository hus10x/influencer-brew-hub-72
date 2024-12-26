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
      businesses: {
        Row: {
          business_name: string
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_submissions: {
        Row: {
          collaboration_id: string | null
          created_at: string | null
          id: string
          influencer_id: string | null
          status: string | null
          story_url: string | null
          updated_at: string | null
          verification_date: string | null
          verified: boolean | null
        }
        Insert: {
          collaboration_id?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          status?: string | null
          story_url?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
        }
        Update: {
          collaboration_id?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          status?: string | null
          story_url?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_submissions_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_submissions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          business_id: string | null
          campaign_id: string | null
          compensation: number
          created_at: string | null
          deadline: string
          description: string
          filled_spots: number
          id: string
          image_url: string | null
          max_spots: number
          requirements: string[]
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          campaign_id?: string | null
          compensation: number
          created_at?: string | null
          deadline: string
          description: string
          filled_spots?: number
          id?: string
          image_url?: string | null
          max_spots?: number
          requirements: string[]
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          campaign_id?: string | null
          compensation?: number
          created_at?: string | null
          deadline?: string
          description?: string
          filled_spots?: number
          id?: string
          image_url?: string | null
          max_spots?: number
          requirements?: string[]
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          created_at: string | null
          engagement_rate: number | null
          followers_count: number | null
          id: string
          niche: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          engagement_rate?: number | null
          followers_count?: number | null
          id: string
          niche?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          engagement_rate?: number | null
          followers_count?: number | null
          id?: string
          niche?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          redirect_path: string
          state: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          redirect_path: string
          state: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          redirect_path?: string
          state?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          instagram_access_token: string | null
          instagram_account_type: string | null
          instagram_connected: boolean | null
          instagram_id: string | null
          instagram_token_expires_at: string | null
          instagram_username: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          instagram_access_token?: string | null
          instagram_account_type?: string | null
          instagram_connected?: boolean | null
          instagram_id?: string | null
          instagram_token_expires_at?: string | null
          instagram_username?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          instagram_access_token?: string | null
          instagram_account_type?: string | null
          instagram_connected?: boolean | null
          instagram_id?: string | null
          instagram_token_expires_at?: string | null
          instagram_username?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      story_verifications: {
        Row: {
          collaboration_submission_id: string | null
          created_at: string | null
          id: string
          posted_at: string | null
          story_id: string | null
          story_url: string | null
          updated_at: string | null
          verification_details: Json | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          collaboration_submission_id?: string | null
          created_at?: string | null
          id?: string
          posted_at?: string | null
          story_id?: string | null
          story_url?: string | null
          updated_at?: string | null
          verification_details?: Json | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          collaboration_submission_id?: string | null
          created_at?: string | null
          id?: string
          posted_at?: string | null
          story_id?: string | null
          story_url?: string | null
          updated_at?: string | null
          verification_details?: Json | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_verifications_collaboration_submission_id_fkey"
            columns: ["collaboration_submission_id"]
            isOneToOne: false
            referencedRelation: "collaboration_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_oauth_states: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_instagram_oauth_states: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_user_deletion: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      update_campaign_status: {
        Args: Record<PropertyKey, never>
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
