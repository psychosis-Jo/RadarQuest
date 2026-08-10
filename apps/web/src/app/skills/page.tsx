import { AppShell } from '@/components/layout/AppShell';
import { getSkillProgress } from '@/lib/data/skill';
import { getSupabase } from '@/lib/data/supabase';
import { TOPIC_COLORS } from '@radar-quest/shared';
import Link from 'next/link';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

const TOPIC_LABELS_ZH = {
  AI: 'AI 应用',
  'one-person': '一人公司',
  'self-mgmt': '自我管理'
};

const TOPIC_DESC = {
  AI: 'AI 框架 / Agent / LLM 应用 / Vibe Coding / WaytoAGI / DataWhale 等',
  'one-person': '独立开发 / 副业 / 数字游民 / Indie Hacker / 一人公司 等',
  'self-mgmt': '个人知识管理 / 第二大脑 / Notion / Obsidian / GTD / 复盘 等'
};

const MILESTONES = [10, 25, 50, 100, 250];

async function getRecentActionsByTopic() {
  const supabase = getSupabase();
  const { data: items } = await supabase.from('items').select('id, topics, title');
  const topicOf = new Map<string, string[]>();
  for (const it of (items ?? []) as any[]) topicOf.set(it.id, it.topics ?? []);

  const { data: actions } = await supabase
    .from('actions')
    .select('id, item_id, action_type, created_at, xp_earned')
    .order('created_at', { ascending: false })
    .limit(50);

  const result: Record<string, { id: number; action_type: string; item_title: string; created_at: string; xp: number }[]> = {
    AI: [], 'one-person': [], 'self-mgmt': []
  };
  for (const a of (actions ?? []) as any[]) {
    const topics = topicOf.get(a.item_id) ?? [];
    const item = (items ?? []).find((it: any) => it.id === a.item_id) as any;
    for (const t of topics) {
      if (result[t] && result[t].length < 5) {
        result[t].push({
          id: a.id,
          action_type: a.action_type,
          item_title: item?.title ?? '(deleted)',
          created_at: a.created_at,
          xp: a.xp_earned
        });
      }
    }
  }
  return result;
}

export default async function SkillsPage() {
  const [skills, recentByTopic] = await Promise.all([
    getSkillProgress(),
    getRecentActionsByTopic()
  ]);

  const totalActions = (['AI', 'one-person', 'self-mgmt'] as const).reduce((s, t) => s + skills[t].count, 0);

  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">技能树</h1>
        <p className="mt-1 text-sm text-bone-400">
          三主题并行 · 累计 {totalActions} 个动作
        </p>
      </header>

      {/* 使用说明 */}
      <div className="hand-drawn-border mb-8 rounded bg-ink-800/40 p-5">
        <p className="num text-[10px] uppercase tracking-widest text-bone-400">这是什么</p>
        <p className="mt-2 text-sm text-bone-200">
          每条 item 都会自动归到 1-3 个主题（看它的标题 / 摘要命中了哪些关键词）。
          你对它做的 5 种动作（Watch / Save / Note / Build / Publish）都会推进对应主题。
        </p>
        <p className="mt-2 text-sm text-bone-200">
          里程碑 10 / 25 / 50 / 100 / 250。到达一个里程碑 = 升一级。
          系统也会在某个主题被冷落 7+ 天后给该主题下次动作 +50% XP（防偏科）。
        </p>
        <p className="mt-2 text-xs text-bone-400">
          用法：浏览 Trending → 选感兴趣的 item → 记录 5 种动作 → 看对应树长起来
        </p>
      </div>

      <div className="space-y-6">
        {(['AI', 'one-person', 'self-mgmt'] as const).map(t => {
          const s = skills[t];
          const color = TOPIC_COLORS[t];
          const pct = s.nextMilestone > 0 ? Math.min(100, (s.count / s.nextMilestone) * 100) : 100;
          const recent = recentByTopic[t];
          return (
            <div key={t} className="hand-drawn-border rounded bg-ink-800/60 p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="font-display text-2xl" style={{ color }}>{TOPIC_LABELS_ZH[t]}</h2>
                  <p className="mt-1 text-xs text-bone-400">{TOPIC_DESC[t]}</p>
                </div>
                <span className="num text-sm text-bone-200">Lv {s.level}</span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="num text-xs text-bone-400">
                  {s.count} / {s.nextMilestone} 到下一里程碑
                </span>
                <span className="num text-xs text-bone-400">{pct.toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>

              {/* 里程碑标记 */}
              <div className="mt-3 flex justify-between text-[10px] text-bone-400">
                {MILESTONES.map(m => (
                  <span key={m} className={s.count >= m ? 'text-gold' : ''}>· {m}</span>
                ))}
              </div>

              {/* 最近贡献这个树的动作 */}
              <div className="mt-5 border-t border-ink-700 pt-4">
                <p className="num text-[10px] uppercase tracking-widest text-bone-400">最近贡献这个树的动作</p>
                {recent.length === 0 ? (
                  <p className="mt-2 text-xs text-bone-400">还没有。去做一些 {TOPIC_LABELS_ZH[t]} 相关的动作吧</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {recent.map(r => (
                      <li key={r.id} className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="truncate text-bone-200">
                          <span className="mr-1">{actionEmoji(r.action_type)}</span>
                          {r.item_title}
                        </span>
                        <span className="num shrink-0 text-[10px] text-bone-400">+{r.xp} XP</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function actionEmoji(t: string) {
  return { watch: '👀', save: '🔖', note: '📝', build: '🛠', publish: '📢' }[t] ?? '·';
}
