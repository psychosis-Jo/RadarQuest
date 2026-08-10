// Minimal loose Database type. 等 v2 用 `supabase gen types typescript` 自动生成
// 这里故意用 any，让 .update/.insert/.upsert 不被严格类型卡住

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      items: { Row: any; Insert: any; Update: any };
      snapshots: { Row: any; Insert: any; Update: any };
      actions: { Row: any; Insert: any; Update: any };
      quests: { Row: any; Insert: any; Update: any };
      achievements: { Row: any; Insert: any; Update: any };
      settings: { Row: any; Insert: any; Update: any };
      daily_stats: { Row: any; Insert: any; Update: any };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}
