import { AppShell } from '@/components/layout/AppShell';
import { TabNav } from '@/components/layout/TabNav';
import { ItemList } from '@/components/item/ItemList';
import { getItemsByTab } from '@/lib/data/items';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const items = await getItemsByTab('trending', 30);
  return (
    <AppShell activeTab="trending">
      <div>
        <header className="mb-5 sm:mb-6">
          <p className="num text-[10px] uppercase tracking-widest text-bone-400">
            Trending · 今日
          </p>
          <h1 className="mt-1 font-display text-2xl text-bone-50 sm:text-3xl">
            正在升起的新星
          </h1>
          <p className="num mt-1 text-xs text-bone-400">
            共 {items.length} 条 · 按 last_seen 倒序
          </p>
        </header>
        <TabNav active="trending" />
        <div className="pt-5 sm:pt-6">
          <ItemList items={items} emptyMessage="今晚海面平静，暂无新星" />
        </div>
      </div>
    </AppShell>
  );
}
