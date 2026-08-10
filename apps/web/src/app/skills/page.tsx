import { AppShell } from '@/components/layout/AppShell';
import { getSkillProgress } from '@/lib/data/skill';
import { TOPIC_COLORS } from '@radar-quest/shared';

const TOPIC_LABELS_ZH = {
  AI: 'AI 应用',
  'one-person': '一人公司',
  'self-mgmt': '自我管理'
};

const TOPIC_DESC = {
  AI: '每次记录 AI 相关的 watch / save / note / build / publish 都会推进',
  'one-person': '每次记录独立开发 / 一人公司相关的动作都会推进',
  'self-mgmt': '每次记录自我管理 / 提效相关的动作都会推进'
};

export default async function SkillsPage() {
  const skills = await getSkillProgress();
  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">技能树</h1>
        <p className="mt-1 text-sm text-bone-400">三主题并行 · 里程碑 10 / 25 / 50 / 100 / 250</p>
      </header>

      <div className="space-y-6">
        {(['AI', 'one-person', 'self-mgmt'] as const).map(t => {
          const s = skills[t];
          const color = TOPIC_COLORS[t];
          const pct = s.nextMilestone > 0 ? Math.min(100, (s.count / s.nextMilestone) * 100) : 100;
          return (
            <div key={t} className="hand-drawn-border rounded bg-ink-800/60 p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl" style={{ color }}>{TOPIC_LABELS_ZH[t]}</h2>
                <span className="num text-sm text-bone-200">Lv {s.level}</span>
              </div>
              <p className="mt-2 text-sm text-bone-400">{TOPIC_DESC[t]}</p>
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
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
