import 'server-only';
import { getSupabase } from './supabase';
import { XP_VALUES, type ActionType } from '@radar-quest/shared';
import { checkAndUnlockAchievements } from './achievements';
import type { Item } from './types';

/**
 * 一次 action 的执行结果
 * - alreadyDone: true 表示这个 (item, action) 之前已经记过，xp=0，no UI XP
 * - newRow: true 表示这是新建的 action 行
 */
export interface ActionResult {
  xp: number;
  newAchievements: string[];
  alreadyDone: boolean;
}

const ACTION_RANK: Record<ActionType, number> = {
  watch: 1, save: 2, note: 3, build: 4, publish: 5
};

export async function getItemActions(itemId: string): Promise<ActionType[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('actions')
    .select('action_type')
    .eq('item_id', itemId);
  if (!data) return [];
  // 去重（同 item 同 action 只返回一次）
  return Array.from(new Set(data.map((r: { action_type: string }) => r.action_type as ActionType)));
}

export async function getItemActionMap(itemIds: string[]): Promise<Record<string, ActionType[]>> {
  if (itemIds.length === 0) return {};
  const supabase = getSupabase();
  const { data } = await supabase
    .from('actions')
    .select('item_id, action_type')
    .in('item_id', itemIds);
  const map: Record<string, ActionType[]> = {};
  for (const id of itemIds) map[id] = [];
  if (data) {
    for (const row of data as { item_id: string; action_type: ActionType }[]) {
      if (!map[row.item_id].includes(row.action_type)) {
        map[row.item_id].push(row.action_type);
      }
    }
  }
  return map;
}

export async function recordAction(opts: {
  itemId: string;
  action: ActionType;
  note?: string;
  outputRef?: string;
  outputTitle?: string;
}): Promise<ActionResult> {
  const supabase = getSupabase();
  const xp = XP_VALUES[opts.action];

  // 先查：(item, action) 是否已经记过
  const { data: existing } = await supabase
    .from('actions')
    .select('id, action_type')
    .eq('item_id', opts.itemId)
    .eq('action_type', opts.action)
    .limit(1);

  if (existing && existing.length > 0) {
    // 已经记过：不插行、不加 XP、不触发 boss
    return { xp: 0, newAchievements: [], alreadyDone: true };
  }

  // 新建
  const { error } = await supabase.from('actions').insert({
    item_id: opts.itemId,
    action_type: opts.action,
    note: opts.note ?? null,
    output_ref: opts.outputRef ?? null,
    output_title: opts.outputTitle ?? null,
    xp_earned: xp
  });
  if (error) throw new Error(`Action insert failed: ${error.message}`);

  // 更新 daily_stats
  const today = new Date().toISOString().slice(0, 10);
  await supabase.rpc('increment_daily_stats', {
    p_day: today,
    p_xp: xp,
    p_action: 1,
    p_publish: opts.action === 'publish' ? 1 : 0
  }).then(() => {}, () => {
    return supabase.from('daily_stats').upsert({
      day: today,
      xp_earned: xp,
      actions_count: 1,
      publish_count: opts.action === 'publish' ? 1 : 0
    }, { onConflict: 'day' });
  });

  const newAchievements = await checkAndUnlockAchievements();

  if (opts.action === 'publish') {
    await incrementBosses();
  }

  return { xp, newAchievements, alreadyDone: false };
}

async function incrementBosses() {
  const supabase = getSupabase();
  const { data: settings } = await supabase.from('settings').select('bosses').eq('id', 1).single();
  const bosses = (settings?.bosses as any[]) ?? [];
  let changed = false;
  for (const b of bosses) {
    if (b.status === 'active' && (b.current ?? 0) < b.target) {
      b.current = (b.current ?? 0) + 1;
      if (b.current >= b.target) {
        b.status = 'completed';
        b.completed_at = new Date().toISOString();
      }
      changed = true;
    }
  }
  if (changed) {
    await supabase.from('settings').update({ bosses, updated_at: new Date().toISOString() }).eq('id', 1);
  }
}
