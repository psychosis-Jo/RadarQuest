'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@starcatcher/shared';
import { TOPIC_COLORS, TOPIC_LABELS } from '@starcatcher/shared';
import {
  simulateLayout,
  radiusForItem,
  type Position,
  type Topic
} from '@/lib/starcloud/force-simulation';
import { CanvasChips } from './CanvasChips';
import { StarDetailCard, type Anchor } from './StarDetailCard';

type Stats = { actions: ActionType[]; totalXp: number };
type ClusterKey = Topic;

const STORAGE_KEY = 'starcatcher:starcloud:positions:v2';
const VB_W = 1200;
const VB_H = 600;
const LINE_NEAR_DIST = 160;  // 主题线：同主题近邻 (<=160px) 才连

const CLUSTER_CENTERS: Record<ClusterKey, { x: number; y: number }> = {
  'AI':           { x: 600, y: 110 },
  'one-person':   { x: 960, y: 480 },
  'self-mgmt':    { x: 240, y: 480 },
  '__unmapped__': { x: 600, y: 320 }
};

export function StarCanvas({
  items,
  statsMap,
  showBackground = true
}: {
  items: Item[];
  statsMap: Record<string, Stats>;
  /** showBackground=false 时由 HomePage 在外层画底色 + ambient 星场 */
  showBackground?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [topicFilter, setTopicFilter] = useState<ClusterKey | null>(null);

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

  // 同主题近邻连线（每个 topic 内部做最近邻连接）
  const lines = useMemo(() => {
    const out: Array<{ a: Position; b: Position; topic: ClusterKey }> = [];
    for (const t of Object.keys(CLUSTER_CENTERS) as ClusterKey[]) {
      const arr = (groups[t] ?? [])
        .map(it => ({ id: it.id, pos: positions.get(it.id) }))
        .filter(x => x.pos) as Array<{ id: string; pos: Position }>;
      if (arr.length < 2) continue;
      for (let i = 0; i < arr.length; i++) {
        let nearest = -1, nearestD = LINE_NEAR_DIST;
        for (let j = 0; j < arr.length; j++) {
          if (i === j) continue;
          const dx = arr[i].pos.x - arr[j].pos.x;
          const dy = arr[i].pos.y - arr[j].pos.y;
          const d = Math.hypot(dx, dy);
          if (d < nearestD) { nearestD = d; nearest = j; }
        }
        if (nearest >= 0) {
          out.push({ a: arr[i].pos, b: arr[nearest].pos, topic: t });
        }
      }
    }
    return out;
  }, [groups, positions]);

  const selectedItem = useMemo(
    () => selectedId ? items.find(i => i.id === selectedId) ?? null : null,
    [selectedId, items]
  );

  const topicColor = (t: ClusterKey): string => {
    if (t === '__unmapped__') return '#A8B0C8';
    return TOPIC_COLORS[t as keyof typeof TOPIC_COLORS];
  };

  // 点击星 → 记录点击位置 + 选中
  const onStarClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      containerW: rect.width,
      containerH: rect.height
    });
    setSelectedId(id);
  }, []);

  // 点击画布空白 → 关闭
  const onCanvasClick = useCallback(() => {
    setSelectedId(null);
    setAnchor(null);
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onCanvasClick}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden sm:h-[calc(100vh-72px)]"
    >
      {/* 背景：纯底色 + ambient 星场（不靠背景图） */}
      {showBackground && (
        <div className="absolute inset-0 bg-ink-900" aria-hidden>
          <div className="starfield-veil absolute inset-0" />
          <div className="starfield absolute inset-0" />
          <div className="starfield-far absolute inset-0" />
        </div>
      )}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* 簇内 nebula 辐射 */}
          <radialGradient id="glow-AI" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#5FE0C7" stopOpacity="0.32" />
            <stop offset="40%"  stopColor="#5FE0C7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#5FE0C7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-one-person" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E8B86F" stopOpacity="0.32" />
            <stop offset="40%"  stopColor="#E8B86F" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#E8B86F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-self-mgmt" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#B8A4D4" stopOpacity="0.32" />
            <stop offset="40%"  stopColor="#B8A4D4" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#B8A4D4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-unmapped" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#A8B0C8" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#A8B0C8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 簇光晕 */}
        <circle cx={CLUSTER_CENTERS.AI.x}           cy={CLUSTER_CENTERS.AI.y}           r={220} fill="url(#glow-AI)" />
        <circle cx={CLUSTER_CENTERS['one-person'].x} cy={CLUSTER_CENTERS['one-person'].y} r={220} fill="url(#glow-one-person)" />
        <circle cx={CLUSTER_CENTERS['self-mgmt'].x}  cy={CLUSTER_CENTERS['self-mgmt'].y}  r={220} fill="url(#glow-self-mgmt)" />
        <circle cx={CLUSTER_CENTERS.__unmapped__.x}  cy={CLUSTER_CENTERS.__unmapped__.y}  r={180} fill="url(#glow-unmapped)" />

        {/* 同主题近邻细线（在星下，渲染顺序：线 → 星） */}
        {lines.map((l, i) => {
          const c = topicColor(l.topic);
          const isSel = selectedId && (
            (positions.get(selectedId) === l.a) || (positions.get(selectedId) === l.b)
          );
          return (
            <line
              key={i}
              x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y}
              stroke={c}
              strokeOpacity={isSel ? 0.5 : 0.18}
              strokeWidth={1}
              strokeDasharray={isSel ? '0' : '2 4'}
            />
          );
        })}

        {/* 内容星点 */}
        {items.map((item, idx) => {
          const lead = (item.topics[0] as ClusterKey) || '__unmapped__';
          const pos = positions.get(item.id);
          if (!pos) return null;
          const dimmed = topicFilter && topicFilter !== lead;
          const hidden = topicFilter && !groups[topicFilter].some(i => i.id === item.id);
          const stats = statsMap[item.id] ?? { actions: [], totalXp: 0 };
          const r = radiusForItem(stats.totalXp, stats.actions.length);
          const color = topicColor(lead);
          const brightness = 0.55 + (stats.actions.length / 5) * 0.45;
          const isComplete = stats.actions.length >= 5;
          const isSelected = selectedId === item.id;
          const delay = Math.min(idx * 5, 700);
          const glowId = `star-glow-${item.id}`;

          return (
            <g
              key={item.id}
              style={{
                opacity: mounted && !hidden ? (dimmed ? 0.18 : brightness) : 0,
                transition: `opacity 800ms ${delay}ms ease-out`,
                cursor: 'pointer'
              }}
              onClick={(e) => onStarClick(e, item.id)}
            >
              {/* 选中：金环 */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 8}
                  fill="none" stroke="#D4A574" strokeWidth={1.5} opacity={1} />
              )}
              {/* 5 动作全做：金色光圈 */}
              {isComplete && !isSelected && (
                <circle cx={pos.x} cy={pos.y} r={r + 5}
                  fill="none" stroke="#D4A574" strokeWidth={1.2} opacity={0.7} />
              )}
              {/* glow halo（用 stopColor 引用 topic 色） */}
              <defs>
                <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.65} />
                  <stop offset="50%"  stopColor={color} stopOpacity={0.20} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </radialGradient>
              </defs>
              <circle
                cx={pos.x} cy={pos.y} r={r * 4}
                fill={`url(#${glowId})`}
              />
              {/* 星本体 */}
              <circle
                cx={pos.x} cy={pos.y} r={r}
                fill={color}
                stroke="rgba(15, 20, 36, 0.6)"
                strokeWidth={0.8}
                className="star-node"
                style={{
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  filter: `drop-shadow(0 0 2px ${color})`
                }}
              >
                <title>{item.title}{item.source ? ` · ${item.source}` : ''}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* 顶部 chips 浮在 SVG 上面 */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
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

      {/* 统计条 */}
      <div className="num pointer-events-none absolute bottom-4 right-4 z-10 text-[10px] text-bone-400 sm:bottom-6 sm:right-6">
        {items.length} 颗 · 已留下的星
      </div>

      {/* 独立弹出卡（替换原 ItemDrawer） */}
      {selectedItem && anchor && (
        <StarDetailCard
          item={selectedItem}
          done={statsMap[selectedItem.id]?.actions ?? []}
          anchor={anchor}
          onClose={() => { setSelectedId(null); setAnchor(null); }}
        />
      )}

      <style jsx>{`
        :global(.star-node) {
          transition: r 200ms ease, filter 200ms ease;
        }
        :global(svg g:hover .star-node) {
          filter: brightness(1.6) drop-shadow(0 0 6px currentColor);
        }
        /* ambient 星场（小点 + 极轻的 vignette） */
        :global(.starfield-veil) {
          background: radial-gradient(
            ellipse 110% 110% at 50% 50%,
            rgba(15, 20, 36, 0.20) 0%,
            rgba(15, 20, 36, 0.30) 60%,
            rgba(15, 20, 36, 0.35) 100%
          );
        }
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
