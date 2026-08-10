import { AppShell } from '@/components/layout/AppShell';
import { TabNav } from '@/components/layout/TabNav';
import { ItemList } from '@/components/item/ItemList';
import { getItemsByTab } from '@/lib/data/items';

export default async function HomePage() {
  const items = await getItemsByTab('trending', 30);
  return (
    <AppShell activeTab="trending">
      <div>
        <header className="mb-6">
          <h1 className="font-display text-3xl text-bone-50">Trending 榜</h1>
          <p className="mt-1 text-sm text-bone-400">
            今天在榜单上的项目 · 共 {items.length} 条
          </p>
        </header>
        <TabNav active="trending" />
        <div className="pt-6">
          <ItemList items={items} emptyMessage="今晚海面平静，暂无新星" />
        </div>
      </div>
    </AppShell>
  );
}
