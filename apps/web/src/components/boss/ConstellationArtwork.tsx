'use client';
// 渲染一个真实星座的 SVG 图样
// viewBox 0 0 1 1，position 来自 data/constellations.json
// 状态：pending (虚线 · 灰) / in_progress (部分亮) / completed (实线 · 金)

import type { Constellation } from '@radar-quest/shared';

export type ConstellationState = 'pending' | 'in_progress' | 'completed';

export function ConstellationArtwork({
  constellation,
  state = 'pending',
  litCount = 0,
  size = 80
}: {
  constellation: Constellation;
  state?: ConstellationState;
  litCount?: number;
  size?: number;
}) {
  const aspect = 1.2; // 略宽于高，给大熊、天龙等横向星座留空间
  const w = size;
  const h = size / aspect;

  return (
    <svg
      viewBox="0 0 1 1"
      width={w}
      height={h}
      className="shrink-0"
      preserveAspectRatio="xMidYMid meet"
      aria-label={`${constellation.name_zh} (${constellation.name_en})`}
    >
      {/* Lines */}
      {constellation.lines.map(([a, b], i) => {
        const s1 = constellation.stars[a];
        const s2 = constellation.stars[b];
        // 一条线是否"已点亮"：两端星都 ≤ litCount 索引
        const lit = state === 'completed' || (a < litCount && b < litCount);
        return (
          <line
            key={`l-${i}`}
            x1={s1.x} y1={s1.y}
            x2={s2.x} y2={s2.y}
            stroke={lit ? 'var(--gold, #D4A574)' : 'var(--bone-400, #6B7390)'}
            strokeWidth={lit ? 0.0035 : 0.0022}
            strokeOpacity={lit ? 0.95 : 0.45}
            strokeDasharray={state === 'pending' || (state === 'in_progress' && !lit) ? '0.018 0.018' : undefined}
          />
        );
      })}
      {/* Stars */}
      {constellation.stars.map((s, i) => {
        const lit = i < litCount || state === 'completed';
        return (
          <circle
            key={`s-${i}`}
            cx={s.x}
            cy={s.y}
            r={lit ? 0.022 : 0.013}
            fill={lit ? 'var(--gold, #D4A574)' : 'var(--bone-400, #6B7390)'}
            fillOpacity={lit ? 1 : 0.5}
          />
        );
      })}
    </svg>
  );
}
