import 'server-only';
import { getSupabase } from './supabase';
import { XP_VALUES, type ActionType } from '@radar-quest/shared';
import { checkAndUnlockAchievements } from './achievements';
import type { Item } from './types';

export async function recordAction(opts: {
  itemId: string;
  action: ActionType;
  note?: string;
  outputRef?: string;
  outputTitle?: string;
}): Promise<{ xp: number; newAchievements: string[] }> {
  const supabase = getSupabase();
  const xp = XP_VALUES[opts.action];

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
    // RPC 不存在时手动 upsert
    return supabase.from('daily_stats').upsert({
      day: today,
      xp_earned: xp,
      actions_count: 1,
      publish_count: opts.action === 'publish' ? 1 : 0
    }, { onConflict: 'day' });
  });

  // 检查成就
  const newAchievements = await checkAndUnlockAchievements();

  // 更新 boss 进度
  if (opts.action === 'publish') {
    await incrementBosses();
  }

  return { xp, newAchievements };
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
