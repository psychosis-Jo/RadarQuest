import 'server-only';
import { getSupabase } from './supabase';
import { levelFromXP, xpInCurrentLevel, xpToNextLevel, XP_PER_LEVEL } from '@starcatcher/shared';
import type { UserStats } from './types';

export async function getUserStats(): Promise<UserStats> {
  const supabase = getSupabase();

  // 累计 XP
  const { data: actions } = await supabase
    .from('actions')
    .select('xp_earned, action_type, created_at');
  const all = (actions ?? []) as any[];
  const total_xp = all.reduce((s, a) => s + (a.xp_earned ?? 0), 0);

  // 今日
  const today = new Date().toISOString().slice(0, 10);
  const todayActions = all.filter(a => a.created_at?.slice(0, 10) === today);
  const today_xp = todayActions.reduce((s, a) => s + a.xp_earned, 0);
  const today_publishes = todayActions.filter(a => a.action_type === 'publish').length;

  // Streak
  const { data: stats } = await supabase.from('daily_stats').select('*');
  const action_streak = calcActionStreak((stats ?? []) as any[]);

  // 输出 streak（按周）
  const publish_streak_weeks = calcPublishStreakWeeks((stats ?? []) as any[]);

  // 今日按 action_type 分组
  const todayByType: Record<string, number> = {
    watch: 0, save: 0, note: 0, build: 0, publish: 0
  };
  for (const a of todayActions) {
    if (a.action_type in todayByType) todayByType[a.action_type]++;
  }

  return {
    total_xp,
    level: levelFromXP(total_xp),
    xp_in_level: xpInCurrentLevel(total_xp),
    xp_to_next: xpToNextLevel(total_xp),
    action_streak,
    publish_streak_weeks,
    today_xp,
    today_actions: todayActions.length,
    today_publishes,
    today_by_type: todayByType
  };
}

function calcActionStreak(stats: { day: string; actions_count: number }[]): number {
  if (stats.length === 0) return 0;
  const days = new Set(stats.filter(s => s.actions_count > 0).map(s => s.day));
  let streak = 0;
  let d = new Date();
  // 最多 1 天宽限
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function calcPublishStreakWeeks(stats: { day: string; publish_count: number }[]): number {
  if (stats.length === 0) return 0;
  const days = new Set(stats.filter(s => s.publish_count > 0).map(s => s.day));
  let weeks = 0;
  let d = new Date();
  for (let w = 0; w < 52; w++) {
    let has = false;
    for (let i = 0; i < 7; i++) {
      const check = new Date(d);
      check.setDate(d.getDate() - i);
      if (days.has(check.toISOString().slice(0, 10))) {
        has = true;
        break;
      }
    }
    if (has) {
      weeks++;
      d.setDate(d.getDate() - 7);
    } else {
      break;
    }
  }
  return weeks;
}
