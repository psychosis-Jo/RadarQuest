'use client';
// 显示当前星座的图样 + 名字 + tier + 神话一句 + "换一个"
// 换一个新的星座：onSwap() 由父组件负责调用 picker

import { getConstellationById, TIER_LABELS } from '@radar-quest/shared';
import { ConstellationArtwork, type ConstellationState } from './ConstellationArtwork';

export function ConstellationPicker({
  constId,
  target,
  current = 0,
  canSwap = true,
  onSwap
}: {
  constId: string;
  target: number;
  current?: number;
  canSwap?: boolean;
  onSwap: () => void;
}) {
  const c = getConstellationById(constId);
  if (!c) {
    return (
      <div className="rounded-card border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
        未知星座 <code className="num">{constId}</code>（数据库里的 const_id 无效）
      </div>
    );
  }

  const litCount = Math.min(current, c.stars.length);
  const state: ConstellationState =
    current >= c.stars.length ? 'completed' :
    current > 0 ? 'in_progress' :
    'pending';

  return (
    <div className="rounded-card border border-ink-700 bg-ink-900/50 p-3">
      <div className="flex items-start gap-4">
        <ConstellationArtwork
          constellation={c}
          state={state}
          litCount={litCount}
          size={88}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-lg leading-none text-bone-50">
              {c.name_zh}
            </span>
            <span className="text-[11px] text-bone-400">{c.name_en}</span>
            <span className="num text-caption text-bone-400">
              {TIER_LABELS[c.tier].zh} · {c.stars.length} 星
            </span>
          </div>
          <p className="mt-1.5 text-[11px] italic leading-relaxed text-bone-200">
            {c.mythology_zh}
          </p>
          <p className="num mt-1 text-[10px] text-bone-400">
            {litCount}/{c.stars.length} 已点亮 · 最佳观测 {c.best_month_zh}
            {c.stars.length !== target && (
              <span className="ml-1 text-bone-400/70">· 实际目标 {c.stars.length}（与 {target} 略差）</span>
            )}
          </p>
          {canSwap && (
            <button
              type="button"
              onClick={onSwap}
              className="mt-2 text-[11px] text-gold hover:text-gold/70"
            >
              ↻ 换一个
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
