import { AppShell } from '@/components/layout/AppShell';
import { getAllBosses } from '@/lib/data/boss';

export default async function BossesPage() {
  const bosses = await getAllBosses();
  const active = bosses.filter(b => b.status === 'active');
  const completed = bosses.filter(b => b.status === 'completed');

  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">Boss 关卡</h1>
        <p className="mt-1 text-sm text-bone-400">长期战役 · 每个 Publish 都是一击</p>
      </header>

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display mb-3 text-lg text-flame">活跃 ({active.length})</h2>
          <div className="space-y-4">
            {active.map(b => {
              const pct = Math.min(100, (b.current / b.target) * 100);
              return (
                <div key={b.id} className="hand-drawn-border rounded bg-ink-800/60 p-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-xl text-bone-50">{b.name}</h3>
                    <span className="num text-flame">{b.current} / {b.target}</span>
                  </div>
                  {b.description && <p className="mt-2 text-sm text-bone-200">{b.description}</p>}
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-700">
                    <div className="h-full rounded-full bg-flame transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {b.deadline && <p className="num mt-2 text-xs text-bone-400">截止: {b.deadline}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="font-display mb-3 text-lg text-celestial">已完成 ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map(b => (
              <div key={b.id} className="rounded border border-celestial/30 bg-celestial/5 p-4">
                <p className="text-sm text-bone-50">{b.name}</p>
                <p className="num mt-1 text-xs text-celestial">
                  {b.completed_at?.slice(0, 10)} · {b.current}/{b.target}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {bosses.length === 0 && (
        <div className="rounded border border-dashed border-ink-700 bg-ink-800/30 p-12 text-center">
          <p className="font-display text-lg text-bone-50">还没有 Boss</p>
        </div>
      )}
    </AppShell>
  );
}
