import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';
import { ItemCard } from './ItemCard';
import { getItemActionMap } from '@/lib/data/actions';

export async function ItemList({ items, emptyMessage }: { items: Item[]; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed border-ink-700 bg-ink-800/30 p-12 text-center">
        <p className="font-display text-lg text-bone-400">{emptyMessage}</p>
      </div>
    );
  }

  // 一次查询拿全部 item 的 action（避免 N+1）
  const actionMap = await getItemActionMap(items.map(it => it.id));

  return (
    <div className="space-y-3">
      {items.map(it => (
        <ItemCard key={it.id} item={it} done={actionMap[it.id] ?? []} />
      ))}
    </div>
  );
}
