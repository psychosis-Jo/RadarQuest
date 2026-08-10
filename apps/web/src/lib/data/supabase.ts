// Server-side Supabase client (用 service role key，能读所有数据)
// 用 untyped client 避免 v2.x 严格类型推断把 update/insert 推成 never
import { createClient } from '@supabase/supabase-js';

let _supabase: any = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  return _supabase;
}
