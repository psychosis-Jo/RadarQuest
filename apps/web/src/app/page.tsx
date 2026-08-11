import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StarCanvas } from '@/components/starcloud/StarCanvas';
import { getRecentItems } from '@/lib/data/items';
import { getItemStatsMap } from '@/lib/data/actions';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const items = await getRecentItems(120, 14);
  const statsMap = await getItemStatsMap(items.map(it => it.id));

  return (
    <>
      {/* 全屏底图：fixed inset-0，z-0 锁在最底。
          Header (z-40) 和 AppShell 都自然压在它上面。 */}
      <div className="fixed inset-0 z-0 bg-ink-900" aria-hidden>
        <div className="starfield-photo absolute inset-0" />
        <div className="starfield-veil absolute inset-0" />
        <div className="starfield absolute inset-0" />
        <div className="starfield-far absolute inset-0" />
      </div>

      <AppShell activeTab="">
        {/* StarCanvas 内部不再渲染背景（showBackground=false），
            但还是要 break out of AppShell 的 padding，让画布到边 */}
        <div className="-mx-4 -mt-6 -mb-6 sm:-mx-6 sm:-mt-8 sm:-mb-8">
          <Suspense fallback={
            <div className="flex h-[calc(100vh-72px)] items-center justify-center text-bone-400">
              正在升起星图…
            </div>
          }>
            <StarCanvas items={items} statsMap={statsMap} showBackground={false} />
          </Suspense>
        </div>
      </AppShell>
    </>
  );
}
