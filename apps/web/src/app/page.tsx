import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StarCloud } from '@/components/starcloud/StarCloud';
import { getRecentItems } from '@/lib/data/items';
import { getItemStatsMap } from '@/lib/data/actions';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const items = await getRecentItems(120, 14);
  const statsMap = await getItemStatsMap(items.map(it => it.id));

  const lastSeen = items[0]?.last_seen_at?.slice(0, 16).replace('T', ' ');
  const totalXp = Object.values(statsMap).reduce((s, v) => s + v.totalXp, 0);

  return (
    <AppShell activeTab="">
      <div>
        <header className="mb-6 sm:mb-8">
          <p className="num text-[10px] uppercase tracking-widest text-bone-400">
            Your Sky · 你的星云
          </p>
          <h1 className="mt-1 font-display text-2xl text-bone-50 sm:text-3xl">
            今晚的星
          </h1>
          <p className="num mt-1 text-xs text-bone-400">
            {items.length} 颗 · 累计 {totalXp} XP · 最近更新 {lastSeen ?? '—'}
          </p>
        </header>

        <Suspense fallback={<div className="num text-xs text-bone-400">加载中…</div>}>
          <StarCloud items={items} statsMap={statsMap} />
        </Suspense>
      </div>
    </AppShell>
  );
}
