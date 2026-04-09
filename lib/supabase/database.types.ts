export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          public_id: string;
          logo_url: string | null;
          primary_color: string;
          widget_style: "carousel" | "grid" | "wall" | "minimal";
          thank_you_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          public_id: string;
          logo_url?: string | null;
          primary_color?: string;
          widget_style?: "carousel" | "grid" | "wall" | "minimal";
          thank_you_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          public_id?: string;
          logo_url?: string | null;
          primary_color?: string;
          widget_style?: "carousel" | "grid" | "wall" | "minimal";
          thank_you_message?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      testimonials: {
        Row: {
          id: string;
          project_id: string;
          customer_name: string;
          customer_email: string | null;
          customer_avatar_url: string | null;
          rating: number;
          text: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          customer_name: string;
          customer_email?: string | null;
          customer_avatar_url?: string | null;
          rating: number;
          text: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          customer_name?: string;
          customer_email?: string | null;
          customer_avatar_url?: string | null;
          rating?: number;
          text?: string;
          status?: "pending" | "approved" | "rejected";
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: "free" | "pro" | "business";
          status: "active" | "past_due" | "canceled";
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: "free" | "pro" | "business";
          status?: "active" | "past_due" | "canceled";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: "free" | "pro" | "business";
          status?: "active" | "past_due" | "canceled";
          current_period_end?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
