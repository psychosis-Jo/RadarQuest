import type { Item } from '@/lib/data/types';
import { ItemCard } from './ItemCard';
import { getItemActions } from '@/lib/data/items';

export async function ItemList({ items, emptyMessage }: { items: Item[]; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed border-ink-700 bg-ink-800/30 p-12 text-center">
        <p className="font-display text-lg text-bone-400">{emptyMessage}</p>
      </div>
    );
  }

  // 并行拿所有 item 的 action
  const actionResults = await Promise.all(
    items.map(it => getItemActions(it.id).catch(() => []))
  );

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <ItemCard key={it.id} item={it} actions={actionResults[i]} />
      ))}
    </div>
  );
}
