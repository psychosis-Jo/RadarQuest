import 'server-only';
import { getSupabase } from './supabase';
import type { Item } from './types';

// 星云主页只显示已留下的星（state = 'kept'），不再看 unprocessed / dismissed
export async function getRecentItems(limit = 120, days = 14): Promise<Item[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('state', 'kept')
    .gte('last_seen_at', since)
    .order('last_seen_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Item[];
}

/**
 * /capture 主区：state = 'unprocessed'，按 topic 聚合
 * 默认 14 天窗口（dismissed 的 30 天软删由后续清理任务处理）
 */
export async function getCaptureItems(limit = 200, days = 14): Promise<Item[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('state', 'unprocessed')
    .gte('last_seen_at', since)
    .order('last_seen_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Item[];
}

/**
 * /capture 底部"已保留"区：state = 'kept' AND saved = false
 * 这些是用户决定留下但还没⭐收藏的；已经留下的所以不再走 unprocessed
 */
export async function getKeptItems(limit = 60, days = 14): Promise<Item[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('state', 'kept')
    .eq('saved', false)
    .gte('last_seen_at', since)
    .order('last_seen_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Item[];
}

/**
 * 已收藏：state = 'kept' AND saved = true
 * 未来 /my 收藏夹 / 星图册可能用到
 */
export async function getStarredItems(limit = 60, days = 30): Promise<Item[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('state', 'kept')
    .eq('saved', true)
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
