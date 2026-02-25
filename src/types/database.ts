// ============================================================
// TERRAIN — Supabase Database Types
// src/types/database.ts
//
// Hand-written types matching supabase/migrations/ 001–004.
// Regenerate with: npx supabase gen types typescript --local
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // ── Migration 001: Profiles ─────────────────────────────
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company: string | null;
          role: string | null;
          therapy_areas: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company?: string | null;
          role?: string | null;
          therapy_areas?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          company?: string | null;
          role?: string | null;
          therapy_areas?: string[] | null;
          updated_at?: string;
        };
      };

      // ── Migration 002: Subscriptions ────────────────────────
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };

      // ── Migration 003: Usage Events ─────────────────────────
      usage_events: {
        Row: {
          id: string;
          user_id: string;
          feature: string;
          indication: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feature: string;
          indication?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          feature?: string;
          indication?: string | null;
          metadata?: Json;
        };
      };

      // ── Migration 004: Reports ──────────────────────────────
      reports: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          report_type: string;
          indication: string;
          inputs: Json;
          outputs: Json;
          status: string;
          is_starred: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          report_type: string;
          indication: string;
          inputs?: Json;
          outputs?: Json;
          status?: string;
          is_starred?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          report_type?: string;
          indication?: string;
          inputs?: Json;
          outputs?: Json;
          status?: string;
          is_starred?: boolean;
          tags?: string[];
          updated_at?: string;
        };
      };

      // ── Migration 004: Report Shares ────────────────────────
      report_shares: {
        Row: {
          id: string;
          report_id: string;
          shared_with_user_id: string;
          permission: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          shared_with_user_id: string;
          permission?: string;
          created_at?: string;
        };
        Update: {
          permission?: string;
        };
      };
    };

    Views: {
      monthly_usage: {
        Row: {
          user_id: string;
          feature: string;
          month: string;
          usage_count: number;
        };
      };
    };

    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Convenience type aliases ──────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type UsageEvent = Database['public']['Tables']['usage_events']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportShare = Database['public']['Tables']['report_shares']['Row'];
export type MonthlyUsage = Database['public']['Views']['monthly_usage']['Row'];
