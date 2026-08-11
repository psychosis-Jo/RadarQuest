import { Suspense } from 'react';
import Link from 'next/link';
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
      {/* 全屏底：纯底色 + 微胇胧 nebula 辐射 + 双层环场小点（不靠背景图） */}
      <div className="fixed inset-0 z-0 bg-ink-900" aria-hidden>
        <div className="starfield-veil absolute inset-0" />
        <div className="starfield absolute inset-0" />
        <div className="starfield-far absolute inset-0" />
      </div>

      <AppShell activeTab="">
        {items.length === 0 ? (
          <div className="-mx-4 -mt-6 -mb-6 sm:-mx-6 sm:-mt-8 sm:-mb-8">
            <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center px-6 text-center sm:h-[calc(100vh-72px)]">
              <p className="num text-caption text-bone-400">星云 · /</p>
              <h1 className="mt-3 font-display text-3xl text-bone-50 sm:text-4xl">
                这里还没有属于你的星
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-bone-200">
                去 <span className="text-gold">捕捉</span> 看今天抓到什么，留下几条后它们就会在这片夜空下亮起来。
              </p>
              <Link
                href="/capture"
                className="mt-6 inline-flex items-center gap-2 rounded-button border border-gold bg-gold/10 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold/20"
              >
                <i className="ph-light ph-book-open text-[16px] leading-none" aria-hidden />
                去捕捉
              </Link>
            </div>
          </div>
        ) : (
          <div className="-mx-4 -mt-6 -mb-6 sm:-mx-6 sm:-mt-8 sm:-mb-8">
            <Suspense fallback={
              <div className="flex h-[calc(100vh-72px)] items-center justify-center text-bone-400">
                正在升起星图…
              </div>
            }>
              <StarCanvas items={items} statsMap={statsMap} showBackground={false} />
            </Suspense>
          </div>
        )}
      </AppShell>
    </>
  );
}
