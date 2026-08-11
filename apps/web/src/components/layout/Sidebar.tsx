import Link from 'next/link';
import { getSkillProgress } from '@/lib/data/skill';
import { getActiveBosses } from '@/lib/data/boss';
import { TOPIC_COLORS, TOPIC_LABELS } from '@radar-quest/shared';

const TOPIC_LABELS_ZH = {
  AI: 'AI 应用',
  'one-person': '一人公司',
  'self-mgmt': '自我管理'
};

export async function Sidebar() {
  const [skills, bosses] = await Promise.all([
    getSkillProgress(),
    getActiveBosses()
  ]);

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {/* 技能树 */}
      <div className="hand-drawn-border rounded-card bg-ink-800/60 p-5">
        <p className="num mb-3 text-caption text-bone-400">
          Skill Trees · 技能树
        </p>
        <div className="space-y-3">
          {(['AI', 'one-person', 'self-mgmt'] as const).map(t => {
            const s = skills[t];
            const pct = s.nextMilestone > 0 ? Math.min(100, (s.count / s.nextMilestone) * 100) : 100;
            const color = TOPIC_COLORS[t];
            return (
              <div key={t}>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-bone-200">{TOPIC_LABELS_ZH[t]}</span>
                  <span className="num text-[10px] text-bone-400">
                    {s.count} / {s.nextMilestone}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 在途星座 */}
      <div className="hand-drawn-border rounded-card bg-ink-800/60 p-5">
        <p className="num mb-3 text-caption text-bone-400">
          Active · 在途
        </p>
        {bosses.length === 0 ? (
          <p className="text-xs text-bone-400">暂无在途星座</p>
        ) : (
          <div className="space-y-3">
            {bosses.map(b => {
              const pct = Math.min(100, (b.current / b.target) * 100);
              return (
                <div key={b.id}>
                  <p className="text-sm text-bone-50">{b.name}</p>
                  {b.description && <p className="mt-0.5 text-[10px] text-bone-400">{b.description}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
                      <div
                        className="h-full rounded-full bg-flame transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="num text-[10px] text-flame">
                      {b.current} / {b.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Link href="/bosses" className="num mt-3 block text-caption text-bone-400 hover:text-bone-50">
          管理星座 →
        </Link>
      </div>
    </aside>
  );
}
