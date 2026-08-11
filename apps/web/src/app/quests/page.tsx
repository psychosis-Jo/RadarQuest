import { AppShell } from '@/components/layout/AppShell';
import { QuestManager } from './QuestManager';
import { getSupabase } from '@/lib/data/supabase';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

async function getTodaysQuests() {
  const supabase = getSupabase();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('quests')
    .select('*')
    .eq('quest_type', 'daily')
    .gte('started_at', today)
    .order('started_at', { ascending: false });
  return (data ?? []) as any[];
}

async function getItemsForQuests() {
  const supabase = getSupabase();
  // 拿最近的 item（用来生成今天的 quest 候选）
  const { data } = await supabase
    .from('items')
    .select('id, title, source, topics, summary, url, metrics')
    .order('last_seen_at', { ascending: false })
    .limit(30);
  return (data ?? []) as any[];
}

export default async function QuestsPage() {
  const [todaysQuests, candidates] = await Promise.all([
    getTodaysQuests(),
    getItemsForQuests()
  ]);

  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">今日任务</h1>
        <p className="mt-1 text-sm text-bone-400">
          系统按主题均衡 + 难度混合生成的 3 个小任务
        </p>
      </header>

      {/* 使用说明 */}
      <div className="hand-drawn-border mb-6 rounded-card bg-ink-800/40 p-5">
        <p className="num text-caption text-bone-400">这是什么</p>
        <p className="mt-2 text-sm text-bone-200">
          每天系统会从今天抓到的热点里挑 3 条做成"今日任务"，按主题均衡（不能 3 个都 AI）和来源均衡（不能 3 个都 GitHub）。
          难度混合：1 个轻量（Watch）、1 个中等（Save/Note）、1 个深度（Build）。
        </p>
        <p className="mt-2 text-sm text-bone-200">
          全部完成 +30 XP 奖励。点任务的"完成"按钮会跳到对应 item，让你立刻记录那个动作。
        </p>
        <p className="mt-2 text-xs text-bone-400">
          如果今天的 3 个都不感兴趣，可以点"重新生成"换一批
        </p>
      </div>

      <QuestManager initialQuests={todaysQuests} candidates={candidates} />
    </AppShell>
  );
}
