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
    <AppShell activeTab="">
      {/* 满屏沉浸：canvas 接管主区，把 padding 拿掉 */}
      <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
        <Suspense fallback={
          <div className="flex h-[calc(100vh-72px)] items-center justify-center text-bone-400">
            正在升起星图…
          </div>
        }>
          <StarCanvas items={items} statsMap={statsMap} />
        </Suspense>
      </div>
    </AppShell>
  );
}
