import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getAllBosses } from '@/lib/data/boss';

export const dynamic = 'force-dynamic';

export default async function SkyAtlasPage() {
  const bosses = await getAllBosses();
  const completed = bosses
    .filter(b => b.status === 'completed')
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));

  return (
    <AppShell activeTab="my" showSidebar={false}>
      <header className="mb-6">
        <Link href="/my" className="num text-caption text-bone-400 hover:text-bone-50">← 我的</Link>
        <h1 className="mt-1 font-display text-3xl text-bone-50">星图册</h1>
        <p className="mt-1 text-sm text-bone-400">
          你点亮过的每一个星座 · 永久收藏
        </p>
      </header>

      {completed.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-700 bg-ink-800/30 p-16 text-center">
          <p className="font-display text-lg text-bone-50">星图册还是空白的</p>
          <p className="mt-2 text-sm text-bone-400">
            在 <Link href="/my/bosses" className="text-gold hover:underline">我的 / 星座</Link> 创建你的第一个，
            全部 Publish 后会自动收进这里。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {completed.map(b => (
            <div
              key={b.id}
              className="hand-drawn-border rounded-card border-celestial/30 bg-celestial/5 p-5"
            >
              <p className="num text-[10px] text-celestial">
                {b.const_id ?? '—'} · Tier {b.const_tier ?? '?'}
              </p>
              <h2 className="mt-1 font-display text-xl text-bone-50">{b.name}</h2>
              {b.description && (
                <p className="mt-2 line-clamp-2 text-xs text-bone-200">{b.description}</p>
              )}
              <div className="mt-4 flex items-baseline justify-between border-t border-celestial/20 pt-3">
                <span className="num text-celestial">✓ {b.current} / {b.target}</span>
                <span className="num text-[10px] text-bone-400">
                  {b.completed_at?.slice(0, 10) ?? ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
