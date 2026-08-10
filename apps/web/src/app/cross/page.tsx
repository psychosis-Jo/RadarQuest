import { AppShell } from '@/components/layout/AppShell';
import { TabNav } from '@/components/layout/TabNav';
import { ItemList } from '@/components/item/ItemList';
import { getItemsByTab } from '@/lib/data/items';
import { TAB_LABELS } from '@radar-quest/shared';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function CrossPage() {
  const items = await getItemsByTab('cross', 30);
  const meta = TAB_LABELS.cross;

  return (
    <AppShell activeTab="cross">
      <div>
        <header className="mb-6">
          <h1 className="font-display text-3xl text-bone-50">{meta.zh}</h1>
          <p className="mt-1 text-sm text-bone-400">
            {meta.description.zh} · 共 {items.length} 条
          </p>
        </header>
        <TabNav active="cross" />
        <div className="pt-6">
          {items.length === 0 ? (
            <div className="rounded border border-dashed border-ink-700 bg-ink-800/30 p-12 text-center">
              <p className="font-display text-lg text-bone-50">{meta.zh}</p>
              <p className="mt-2 text-sm text-bone-400">
                还没有跨多平台提及的 item。抓取更多源后会逐渐出现。
              </p>
            </div>
          ) : (
            <ItemList items={items} emptyMessage={`今晚这片区域暂无${meta.zh}`} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
