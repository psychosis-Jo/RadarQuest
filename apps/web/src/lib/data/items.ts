import 'server-only';
import { getSupabase } from './supabase';
import type { Item } from './types';

// 拉所有最近 N 天的 item，按 last_seen_at 倒序
// 不再按"tab"分（5 Tab 已被星云视图替代）
export async function getRecentItems(limit = 100, days = 14): Promise<Item[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('items')
    .select('*')
    .gte('last_seen_at', since)
    .order('last_seen_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Item[];
}

export async function getItemById(id: string): Promise<Item | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
  return (data as Item) ?? null;
}
