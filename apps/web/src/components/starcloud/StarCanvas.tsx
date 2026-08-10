'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';
import { TOPIC_COLORS, TOPIC_LABELS } from '@radar-quest/shared';
import {
  simulateLayout,
  radiusForItem,
  type Position,
  type Topic
} from '@/lib/starcloud/force-simulation';
import { CanvasChips } from './CanvasChips';
import { ItemDrawer } from './ItemDrawer';

type Stats = { actions: ActionType[]; totalXp: number };
type ClusterKey = Topic;

const STORAGE_KEY = 'radar-quest:starcloud:positions:v2';
const VB_W = 1200;
const VB_H = 600;

// 3 簇在 viewBox 内的位置（与 force-simulation 一致）
const CLUSTER_CENTERS: Record<ClusterKey, { x: number; y: number }> = {
  'AI':           { x: 600, y: 110 },
  'one-person':   { x: 960, y: 480 },
  'self-mgmt':    { x: 240, y: 480 },
  '__unmapped__': { x: 600, y: 320 }
};

export function StarCanvas({
  items,
  statsMap
}: {
  items: Item[];
  statsMap: Record<string, Stats>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [mounted, setMounted] = useState(false);
  // 用 local state 而不是 URL —— 让点击立即响应
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<ClusterKey | null>(null);

  // 跑一次模拟（或读 localStorage 缓存）
  useEffect(() => {
    if (items.length === 0) return;

    const cacheKey = `${STORAGE_KEY}:${items.length}`;
    const stored = readStored(cacheKey);
    const allCached = stored && items.every(i => stored[i.id]);

    if (allCached) {
      const pos = new Map<string, Position>();
      for (const i of items) pos.set(i.id, stored[i.id]);
      setPositions(pos);
      setMounted(true);
      return;
    }

    const nodes = items.map(i => ({
      id: i.id,
      topic: (i.topics[0] as Topic) || '__unmapped__',
      radius: radiusForItem(statsMap[i.id]?.totalXp ?? 0, statsMap[i.id]?.actions.length ?? 0)
    }));
    const pos = simulateLayout(nodes, VB_W, VB_H);
    setPositions(pos);
    setMounted(true);

    const toStore: Record<string, { x: number; y: number; topic: Topic }> = {};
    for (const [id, p] of pos) {
      const n = nodes.find(x => x.id === id)!;
      toStore[id] = { x: p.x, y: p.y, topic: n.topic };
    }
    writeStored(cacheKey, toStore);
  }, [items, statsMap]);

  // 分组
  const groups = useMemo(() => {
    const out: Record<ClusterKey, Item[]> = {
      'AI': [], 'one-person': [], 'self-mgmt': [], '__unmapped__': []
    };
    for (const it of items) {
      const lead = it.topics[0];
      const key: ClusterKey = (lead && (lead in out)) ? (lead as ClusterKey) : '__unmapped__';
      out[key].push(it);
    }
    return out;
  }, [items]);

  const selectedItem = useMemo(
    () => selectedId ? items.find(i => i.id === selectedId) ?? null : null,
    [selectedId, items]
  );

  const topicColor = (t: ClusterKey): string => {
    if (t === '__unmapped__') return '#6B7390';
    return TOPIC_COLORS[t as keyof typeof TOPIC_COLORS];
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden sm:h-[calc(100vh-72px)]"
    >
      {/* 背景：双层微粒（近 + 远） */}
      <div className="absolute inset-0 bg-ink-900" aria-hidden>
        <div className="starfield absolute inset-0" />
        <div className="starfield-far absolute inset-0" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* 每个 topic 一圈极淡的辐射（nebula 感） */}
          <radialGradient id="glow-AI" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#5FE0C7" stopOpacity="0.18" />
            <stop offset="40%"  stopColor="#5FE0C7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#5FE0C7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-one-person" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E8B86F" stopOpacity="0.18" />
            <stop offset="40%"  stopColor="#E8B86F" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#E8B86F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-self-mgmt" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#B8A4D4" stopOpacity="0.18" />
            <stop offset="40%"  stopColor="#B8A4D4" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B8A4D4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cluster glow（先画，在星底下） */}
        <circle cx={CLUSTER_CENTERS.AI.x}           cy={CLUSTER_CENTERS.AI.y}           r={220} fill="url(#glow-AI)" />
        <circle cx={CLUSTER_CENTERS['one-person'].x} cy={CLUSTER_CENTERS['one-person'].y} r={220} fill="url(#glow-one-person)" />
        <circle cx={CLUSTER_CENTERS['self-mgmt'].x}  cy={CLUSTER_CENTERS['self-mgmt'].y}  r={220} fill="url(#glow-self-mgmt)" />

        {/* 星 */}
        {items.map((item, idx) => {
          const lead = (item.topics[0] as ClusterKey) || '__unmapped__';
          const pos = positions.get(item.id);
          if (!pos) return null;
          const dimmed = topicFilter && topicFilter !== lead;
          const hidden = topicFilter && !groups[topicFilter].some(i => i.id === item.id);
          const stats = statsMap[item.id] ?? { actions: [], totalXp: 0 };
          const r = radiusForItem(stats.totalXp, stats.actions.length);
          const color = topicColor(lead);
          // 亮度：0.55 - 1.0 区间（避免太暗看不见）
          const brightness = 0.55 + (stats.actions.length / 5) * 0.45;
          const isComplete = stats.actions.length >= 5;
          const isSelected = selectedId === item.id;
          const delay = Math.min(idx * 5, 700);

          return (
            <g
              key={item.id}
              style={{
                opacity: mounted && !hidden ? (dimmed ? 0.12 : brightness) : 0,
                transition: `opacity 800ms ${delay}ms ease-out`,
                cursor: 'pointer'
              }}
              onClick={() => setSelectedId(item.id)}
            >
              {/* 选中：金环 */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 8}
                  fill="none" stroke="#D4A574" strokeWidth={1.5} opacity={0.9} />
              )}
              {/* 5 动作全做：金色光圈 */}
              {isComplete && !isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 5}
                  fill="none" stroke="#D4A574" strokeWidth={0.8} opacity={0.5} />
              )}
              {/* 星本体 */}
              <circle
                cx={pos.x} cy={pos.y} r={r}
                fill={color}
                stroke={color}
                strokeWidth={0.5}
                className="star-node"
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              >
                <title>{item.title}{item.source ? ` · ${item.source}` : ''}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* 左下 chips */}
      <div className="absolute bottom-6 left-4 z-10 sm:bottom-8 sm:left-6">
        <CanvasChips
          counts={{
            all: items.length,
            AI: groups.AI.length,
            'one-person': groups['one-person'].length,
            'self-mgmt': groups['self-mgmt'].length,
            __unmapped__: groups.__unmapped__.length
          }}
          active={topicFilter}
          onChange={setTopicFilter}
        />
      </div>

      {/* 右上小统计 */}
      <div className="num absolute right-4 top-4 z-10 text-right text-[10px] uppercase tracking-widest text-bone-400 sm:right-6 sm:top-6">
        <div className="text-bone-200">
          {items.length} 颗 ·{' '}
          {Object.values(statsMap).reduce((s, v) => s + v.totalXp, 0)} XP
        </div>
        <div className="mt-0.5 opacity-60">
          {mounted ? '点击星进入详情' : '正在定位星图…'}
        </div>
      </div>

      {/* Drawer（直接 import，inline 渲染，立即响应） */}
      {selectedItem && (
        <ItemDrawer
          item={selectedItem}
          done={statsMap[selectedItem.id]?.actions ?? []}
          onClose={() => setSelectedId(null)}
        />
      )}

      <style jsx>{`
        :global(.star-node) {
          transition: r 200ms ease, filter 200ms ease;
        }
        :global(svg g:hover .star-node) {
          filter: brightness(1.5);
        }
        :global(svg g:hover) {
          filter: drop-shadow(0 0 6px currentColor);
        }
        /* 近景星：明显可见 */
        :global(.starfield) {
          background-image:
            radial-gradient(1.2px 1.2px at 12% 22%, rgba(244, 233, 216, 0.7) 50%, transparent 100%),
            radial-gradient(1.2px 1.2px at 28% 65%, rgba(244, 233, 216, 0.5) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 45% 18%, rgba(244, 233, 216, 0.6) 50%, transparent 100%),
            radial-gradient(1.2px 1.2px at 62% 78%, rgba(244, 233, 216, 0.4) 50%, transparent 100%),
            radial-gradient(1.2px 1.2px at 78% 35%, rgba(244, 233, 216, 0.5) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 88% 62%, rgba(244, 233, 216, 0.6) 50%, transparent 100%),
            radial-gradient(1.2px 1.2px at 35% 88%, rgba(244, 233, 216, 0.4) 50%, transparent 100%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
        /* 远景星：极淡、数量多、模拟深邃感 */
        :global(.starfield-far) {
          background-image:
            radial-gradient(0.5px 0.5px at 5% 15%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 18% 45%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 22% 75%, rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 38% 8%,  rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 48% 55%, rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 55% 28%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 65% 92%, rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 72% 18%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 82% 48%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 92% 8%,  rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 95% 75%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 8% 95%,  rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 15% 35%, rgba(244, 233, 216, 0.25) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 32% 95%, rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 50% 50%, rgba(244, 233, 216, 0.25) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 68% 65%, rgba(244, 233, 216, 0.2) 50%, transparent 100%),
            radial-gradient(0.5px 0.5px at 85% 92%, rgba(244, 233, 216, 0.25) 50%, transparent 100%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
}

function readStored(key: string): Record<string, { x: number; y: number; topic: Topic }> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeStored(key: string, value: Record<string, { x: number; y: number; topic: Topic }>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
