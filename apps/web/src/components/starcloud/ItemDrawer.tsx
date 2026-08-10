'use client';
import { useEffect } from 'react';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';
import { ItemCard } from '@/components/item/ItemCard';

export function ItemDrawer({
  item,
  done,
  onClose
}: {
  item: Item;
  done: ActionType[];
  onClose: () => void;
}) {
  // ESC 关闭
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    // 锁滚动
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 背景遮罩 */}
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="flex-1 bg-ink-900/60"
      />

      {/* Drawer 本体 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Item 详情"
        className="flex h-full w-full max-w-2xl flex-col border-l border-ink-700 bg-ink-900 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ink-700 px-5 py-3">
          <p className="num text-[10px] uppercase tracking-widest text-bone-400">
            Item Detail
          </p>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-bone-400 hover:bg-ink-800 hover:text-bone-50"
            aria-label="关闭"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <ItemCard item={item} done={done} />
        </div>
      </aside>
    </div>
  );
}
