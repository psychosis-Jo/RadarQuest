'use client';
// 渲染一个真实星座的 SVG 图样
// viewBox 0 0 1 1
// 状态：pending (虚线 · 灰) / in_progress (部分亮) / completed (实线 · 金)
// 动画：key 强制 re-mount → CSS animation 触发
//   - 连线：stroke-dashoffset 从 1 → 0（1.2s 缓出）
//   - 节点：transform scale 从 0.5 → 1（0.4s spring，stagger 40ms / 颗）
// 动画时长受 intensity 调节：1-2 档 0.6x / 3 档 1x / 4-5 档 1.4x

import type { Constellation } from '@starcatcher/shared';
import type { IntensityLevel } from '@/lib/audio/controller';

export type ConstellationState = 'pending' | 'in_progress' | 'completed';

const motionScaleFor = (level: IntensityLevel | undefined) => {
  if (!level) return 1;
  if (level <= 2) return 0.6;
  if (level >= 4) return 1.4;
  return 1;
};

export function ConstellationArtwork({
  constellation,
  state = 'pending',
  litCount = 0,
  size = 80,
  intensityLevel
}: {
  constellation: Constellation;
  state?: ConstellationState;
  litCount?: number;
  size?: number;
  intensityLevel?: IntensityLevel;
}) {
  const aspect = 1.2;
  const w = size;
  const h = size / aspect;
  const scale = motionScaleFor(intensityLevel);
  const lineDur = (1.2 * scale).toFixed(2);
  const nodeDur = (0.4 * scale).toFixed(2);

  return (
    <svg
      // key 触发 re-mount → CSS animation 重新跑
      key={`${constellation.id}-${state}-${litCount}`}
      viewBox="0 0 1 1"
      width={w}
      height={h}
      className="const-svg shrink-0"
      preserveAspectRatio="xMidYMid meet"
      aria-label={`${constellation.name_zh} (${constellation.name_en})`}
    >
      <style>{`
        .const-svg .line-lit {
          stroke-dasharray: 1;
          stroke-dashoffset: 0;
          animation: drawIn ${lineDur}s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .const-svg .line-dim {
          stroke-dasharray: 0.018 0.018;
        }
        .const-svg .node-lit {
          transform-box: fill-box;
          transform-origin: center;
          animation: popIn ${nodeDur}s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .const-svg .node-dim {
          transform-box: fill-box;
          transform-origin: center;
          transform: scale(0.7);
        }
        @keyframes drawIn {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0.4; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Lines */}
      {constellation.lines.map(([a, b], i) => {
        const s1 = constellation.stars[a];
        const s2 = constellation.stars[b];
        const lit = state === 'completed' || (a < litCount && b < litCount);
        return (
          <line
            key={`l-${i}`}
            pathLength="1"
            x1={s1.x} y1={s1.y}
            x2={s2.x} y2={s2.y}
            stroke={lit ? '#D4A574' : '#6B7390'}
            strokeWidth={lit ? 0.0035 : 0.0022}
            strokeOpacity={lit ? 0.95 : 0.45}
            className={lit ? 'line-lit' : 'line-dim'}
            style={lit ? { animationDelay: `${i * 60}ms` } : undefined}
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
            fill={lit ? '#D4A574' : '#6B7390'}
            fillOpacity={lit ? 1 : 0.5}
            className={lit ? 'node-lit' : 'node-dim'}
            style={lit ? { animationDelay: `${100 + i * 40}ms` } : undefined}
          />
        );
      })}
    </svg>
  );
}
