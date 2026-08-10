import { AppShell } from '@/components/layout/AppShell';
import { TabNav } from '@/components/layout/TabNav';
import { ItemList } from '@/components/item/ItemList';
import { getItemsByTab } from '@/lib/data/items';
import { TAB_LABELS } from '@radar-quest/shared';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function DensityPage() {
  const items = await getItemsByTab('density', 30);
  const meta = TAB_LABELS.density;

  return (
    <AppShell activeTab="density">
      <div>
        <header className="mb-6">
          <h1 className="font-display text-3xl text-bone-50">{meta.zh}</h1>
          <p className="mt-1 text-sm text-bone-400">
            {meta.description.zh} · 共 {items.length} 条
          </p>
        </header>
        <TabNav active="density" />
        <div className="pt-6">
          <ItemList items={items} emptyMessage={`今晚这片区域暂无${meta.zh}`} />
        </div>
      </div>
    </AppShell>
  );
}
