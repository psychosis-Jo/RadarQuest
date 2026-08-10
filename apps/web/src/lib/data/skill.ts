import 'server-only';
import { getSupabase } from './supabase';
import type { SkillProgress } from './types';

const MILESTONES = [10, 25, 50, 100, 250];

export async function getSkillProgress(): Promise<SkillProgress> {
  const supabase = getSupabase();
  const { data: items } = await supabase.from('items').select('id, topics');
  const { data: actions } = await supabase.from('actions').select('item_id, action_type');

  const itemTopicMap = new Map<string, string[]>();
  for (const it of (items ?? []) as any[]) {
    itemTopicMap.set(it.id, it.topics ?? []);
  }

  // 计数：每个 topic 的总 action 数（限定 watch / save / note / build / publish 五种）
  const counts: Record<string, number> = { AI: 0, 'one-person': 0, 'self-mgmt': 0 };
  for (const a of (actions ?? []) as any[]) {
    const topics = itemTopicMap.get(a.item_id) ?? [];
    for (const t of topics) {
      if (counts[t] !== undefined) counts[t]++;
    }
  }

  const result: SkillProgress = {} as any;
  for (const topic of ['AI', 'one-person', 'self-mgmt'] as const) {
    const count = counts[topic];
    const level = MILESTONES.filter(m => count >= m).length;
    const nextMilestone = MILESTONES.find(m => count < m) ?? MILESTONES[MILESTONES.length - 1];
    result[topic] = { count, level, nextMilestone };
  }
  return result;
}
