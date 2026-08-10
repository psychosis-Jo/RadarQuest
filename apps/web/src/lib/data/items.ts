import 'server-only';
import { getSupabase } from './supabase';
import type { Item, TabKey } from './types';

export async function getItemsByTab(tab: TabKey, limit = 30): Promise<Item[]> {
  const supabase = getSupabase();

  if (tab === 'trending') {
    // 全部按 last_seen_at 倒序（v0.2 没有 score 排序，先按时间）
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as Item[];
  }

  if (tab === 'spike' || tab === 'rise') {
    // 没有历史数据时显示空
    const { count } = await supabase
      .from('snapshots')
      .select('*', { count: 'exact', head: true })
      .lte('taken_at', new Date(Date.now() - (tab === 'spike' ? 7 : 30) * 86400000).toISOString().slice(0, 10));
    if (!count || count < 5) return [];
    // 有历史了就走 score 排序（v0.2 简化：按 metrics.score 倒序）
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as Item[];
  }

  if (tab === 'density') {
    // 按 metrics.comments 排序
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(limit);
    return ((data ?? []) as Item[]).sort((a, b) =>
      (b.metrics?.comments ?? 0) - (a.metrics?.comments ?? 0)
    );
  }

  if (tab === 'cross') {
    // 跨平台：必须有 topics
    const { data } = await supabase
      .from('items')
      .select('*')
      .not('topics', 'eq', '{}')
      .order('last_seen_at', { ascending: false })
      .limit(limit);
    return (data ?? []) as Item[];
  }

  return [];
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
