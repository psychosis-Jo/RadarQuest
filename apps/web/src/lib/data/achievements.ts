import 'server-only';
import { getSupabase } from './supabase';

interface AchievementDef {
  id: string;
  name_zh: string;
  name_en: string;
  emoji: string;
  check: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  totalActions: number;
  totalPublishes: number;
  distinctItemsWithPublish: number;
  distinctItemsSaved: number;
  actionStreak: number;
  publishStreakWeeks: number;
  publishStreakExact: number;
  counts: Record<string, number>;
}

const DEFS: AchievementDef[] = [
  { id: 'first_watch',   name_zh: '初见',     name_en: 'First Watch',  emoji: '☉',  check: c => c.totalActions >= 1 },
  { id: 'first_save',    name_zh: '收藏家',   name_en: 'First Save',   emoji: '☽',  check: c => c.distinctItemsSaved >= 1 },
  { id: 'first_note',    name_zh: '笔记家',   name_en: 'First Note',   emoji: '✎',  check: c => c.counts.note >= 1 },
  { id: 'first_build',   name_zh: '匠人',     name_en: 'First Build',  emoji: '⚒',  check: c => c.counts.build >= 1 },
  { id: 'first_publish', name_zh: '首发',     name_en: 'First Publish', emoji: '✦', check: c => c.totalPublishes >= 1 },
  { id: 'triple_strike', name_zh: '三连击',   name_en: 'Triple Strike', emoji: '✦✦✦', check: c => false /* 留给更复杂实现 */ },
  { id: 'no_dust',       name_zh: '告别吃灰', name_en: 'No Dust',      emoji: '✧',  check: c => c.distinctItemsWithPublish >= 1 && c.distinctItemsSaved >= 1 },
  { id: 'hundred_days',  name_zh: '百日行动', name_en: '100 Days',     emoji: '✷',  check: c => c.actionStreak >= 100 },
  { id: 'weekly_output', name_zh: '月度输出', name_en: 'Monthly',      emoji: '✶',  check: c => c.publishStreakWeeks >= 4 },
  { id: 'balanced',      name_zh: '主题均衡', name_en: 'Balanced',     emoji: '✺',  check: c => false /* 留给 stats 计算 */ },
  { id: 'voyager',       name_zh: '远征者',   name_en: 'Voyager',      emoji: '⚓', check: c => false /* 留给 boss */ },
  { id: 'constellation', name_zh: '群星',     name_en: 'Constellation', emoji: '✹', check: c => c.totalPublishes >= 50 }
];

export async function checkAndUnlockAchievements(): Promise<string[]> {
  const supabase = getSupabase();

  const { data: actions } = await supabase.from('actions').select('item_id, action_type');
  const { data: existing } = await supabase.from('achievements').select('id');
  const unlocked = new Set((existing ?? []).map((a: any) => a.id));

  const itemsWithPublish = new Set<string>();
  const itemsWithSave = new Set<string>();
  const counts: Record<string, number> = { watch: 0, save: 0, note: 0, build: 0, publish: 0 };
  for (const a of (actions ?? []) as any[]) {
    counts[a.action_type] = (counts[a.action_type] ?? 0) + 1;
    if (a.action_type === 'publish') itemsWithPublish.add(a.item_id);
    if (a.action_type === 'save') itemsWithSave.add(a.item_id);
  }

  // streak 复用
  const { getUserStats } = await import('./stats');
  const stats = await getUserStats();

  const ctx: AchievementContext = {
    totalActions: Object.values(counts).reduce((a, b) => a + b, 0),
    totalPublishes: counts.publish,
    distinctItemsWithPublish: itemsWithPublish.size,
    distinctItemsSaved: itemsWithSave.size,
    actionStreak: stats.action_streak,
    publishStreakWeeks: stats.publish_streak_weeks,
    publishStreakExact: 0,
    counts
  };

  const newlyUnlocked: string[] = [];
  for (const def of DEFS) {
    if (unlocked.has(def.id)) continue;
    if (def.check(ctx)) {
      const { error } = await supabase.from('achievements').insert({ id: def.id });
      if (!error) newlyUnlocked.push(def.id);
    }
  }
  return newlyUnlocked;
}
