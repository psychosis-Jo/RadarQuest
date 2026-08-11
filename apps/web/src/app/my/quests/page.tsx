import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { QuestManager } from '@/components/quest/QuestManager';
import { getSupabase } from '@/lib/data/supabase';

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
  // 候选 item：优先 state='kept'（用户已经决定留的），其次 unprocessed
  const { data } = await supabase
    .from('items')
    .select('id, title, source, topics, summary, url, metrics')
    .in('state', ['kept', 'unprocessed'])
    .order('last_seen_at', { ascending: false })
    .limit(30);
  return (data ?? []) as any[];
}

export default async function MyQuestsPage() {
  const [todaysQuests, candidates] = await Promise.all([
    getTodaysQuests(),
    getItemsForQuests()
  ]);

  return (
    <AppShell activeTab="my" showSidebar={false}>
      <header className="mb-6">
        <Link href="/my" className="num text-caption text-bone-400 hover:text-bone-50">← 我的</Link>
        <h1 className="mt-1 font-display text-3xl text-bone-50">今日任务</h1>
        <p className="mt-1 text-sm text-bone-400">
          系统按主题均衡 + 难度混合生成的 3 个小任务
        </p>
      </header>

      <div className="hand-drawn-border mb-6 rounded-card bg-ink-800/40 p-5">
        <p className="num text-caption text-bone-400">这是什么</p>
        <p className="mt-2 text-sm text-bone-200">
          每天系统会从今天抓到的热点里挑 3 条做成"今日任务"，按主题均衡（不能 3 个都 AI）和来源均衡（不能 3 个都 GitHub）。
          难度混合：1 个轻量（Watch）、1 个中等（Save/Note）、1 个深度（Build）。
        </p>
        <p className="mt-2 text-sm text-bone-200">
          完成任务会通过同一 recordAction 入口记录对应动作（dedup + XP + 推进星座）。同 (item, action) 之前已记过则不加 XP。
        </p>
        <p className="mt-2 text-xs text-bone-400">
          如果今天的 3 个都不感兴趣，可以点"重新生成"换一批
        </p>
      </div>

      <QuestManager initialQuests={todaysQuests} candidates={candidates} />
    </AppShell>
  );
}
