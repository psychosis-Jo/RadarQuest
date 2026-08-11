'use client';

import { useEffect, useRef, useState } from 'react';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@starcatcher/shared';
import { ACTION_LABELS, TOPIC_COLORS, TOPIC_LABELS } from '@starcatcher/shared';
import { ActionBar } from '@/components/item/ActionBar';

const CARD_W = 300;
const CARD_H_ESTIMATE = 280; // 用于贴边判断
const CLICK_OFFSET = 14;

const SOURCE_LABEL: Record<string, string> = {
  github: 'GitHub',
  ph: 'Product Hunt',
  hn: 'Hacker News',
  reddit: 'Reddit',
  wechat: '公众号',
  newsletter: 'Newsletter'
};

export type Anchor = { x: number; y: number; containerW: number; containerH: number };

export function StarDetailCard({
  item,
  done,
  anchor,
  onClose
}: {
  item: Item;
  done: ActionType[];
  anchor: Anchor;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 智能贴边：默认偏右下，超出则翻到左上
  const { left, top } = (() => {
    const wouldRight = anchor.x + CLICK_OFFSET + CARD_W;
    const wouldBottom = anchor.y + CLICK_OFFSET + CARD_H_ESTIMATE;
    const flipLeft = wouldRight > anchor.containerW - 8;
    const flipUp = wouldBottom > anchor.containerH - 8;
    return {
      left: flipLeft ? Math.max(8, anchor.x - CARD_W - CLICK_OFFSET) : anchor.x + CLICK_OFFSET,
      top:  flipUp  ? Math.max(8, anchor.y - CARD_H_ESTIMATE - CLICK_OFFSET) : anchor.y + CLICK_OFFSET
    };
  })();

  // ESC 关闭
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 进入时轻微弹出动画
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const src = SOURCE_LABEL[item.source] ?? item.source;
  const stars = (item.metrics as any)?.stars;
  const score = (item.metrics as any)?.score;
  const comments = (item.metrics as any)?.comments;
  const metric = stars ? `★ ${stars.toLocaleString()}` : score ? `▲ ${score}` : '';

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-label={item.title}
      onClick={e => e.stopPropagation()}
      style={{ left, top }}
      className={`absolute z-30 w-[300px] rounded-card border border-ink-700 bg-ink-900/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-200 ${
        mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.98] opacity-0'
      }`}
    >
      {/* 关闭 */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-button text-bone-400 hover:bg-ink-800 hover:text-bone-50"
      >
        <i className="ph-light ph-x text-[14px] leading-none" aria-hidden />
      </button>

      {/* Meta */}
      <div className="num flex flex-wrap items-center gap-x-2 gap-y-0.5 pr-6 text-caption text-bone-400">
        <span>{src}</span>
        {metric && <span className="text-bone-200">{metric}</span>}
        {comments ? <span>💬 {comments}</span> : null}
      </div>

      {/* 标题 */}
      <h3 className="mt-2 line-clamp-2 font-display text-base leading-snug text-bone-50">
        {item.title}
      </h3>

      {/* Topic 标签 */}
      {item.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {item.topics.slice(0, 3).map(t => {
            const color = (TOPIC_COLORS as Record<string, string>)[t];
            const label = (TOPIC_LABELS as any)[t]?.zh ?? t;
            return (
              <span
                key={t}
                className="rounded border px-1.5 py-0.5 text-[10px]"
                style={{
                  borderColor: color ? color + '50' : 'var(--ink-700)',
                  color: color ?? 'var(--bone-200)'
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      {/* 摘要 */}
      {item.summary && (
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-bone-200">
          {item.summary}
        </p>
      )}

      {/* 5 动作（compact：icon-only，hover 显示标签） */}
      <div className="mt-3 border-t border-ink-700 pt-3">
        <ActionBar itemId={item.id} done={done} compact />
      </div>

      {/* 外链 */}
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center justify-center gap-1 rounded-button border border-ink-700 px-2 py-1.5 text-[11px] text-bone-200 hover:border-gold/40 hover:text-gold"
      >
        <i className="ph-light ph-arrow-square-out text-[12px] leading-none" aria-hidden />
        <span>打开原文</span>
      </a>
    </div>
  );
}
