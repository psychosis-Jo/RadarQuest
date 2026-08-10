'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

type Stats = { actions: ActionType[]; totalXp: number };
type ClusterKey = Topic;

const CLUSTER_ORDER: ClusterKey[] = ['AI', 'one-person', 'self-mgmt', '__unmapped__'];
const STORAGE_KEY = 'radar-quest:starcloud:positions:v1';

interface StoredPosition { x: number; y: number; topic: Topic; }

export function StarCanvas({
  items,
  statsMap
}: {
  items: Item[];
  statsMap: Record<string, Stats>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [mounted, setMounted] = useState(false);
  const [topicFilter, setTopicFilter] = useState<ClusterKey | null>(null);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ w: Math.max(800, width), h: Math.max(500, height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 跑一次模拟（或读 localStorage 缓存）
  useEffect(() => {
    if (items.length === 0 || size.w === 0) return;

    // 尝试从 localStorage 恢复
    const cacheKey = `${STORAGE_KEY}:${items.length}`;
    const stored = readStored(cacheKey);
    const itemIds = new Set(items.map(i => i.id));
    const allCached = stored && items.every(i => stored[i.id]);

    if (allCached) {
      // 秒开
      const pos = new Map<string, Position>();
      for (const i of items) {
        pos.set(i.id, stored[i.id]);
      }
      setPositions(pos);
      setMounted(true);
      return;
    }

    // 算
    const nodes = items.map(i => ({
      id: i.id,
      topic: (i.topics[0] as Topic) || '__unmapped__',
      radius: radiusForItem(statsMap[i.id]?.totalXp ?? 0, statsMap[i.id]?.actions.length ?? 0)
    }));
    const pos = simulateLayout(nodes, size.w, size.h);
    setPositions(pos);
    setMounted(true);

    // 缓存
    const toStore: Record<string, StoredPosition> = {};
    for (const [id, p] of pos) {
      const n = nodes.find(x => x.id === id)!;
      toStore[id] = { x: p.x, y: p.y, topic: n.topic };
    }
    writeStored(cacheKey, toStore);
  }, [items, size.w, size.h, statsMap]);

  // 分组 + 过滤
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

  // URL ?i= 状态
  const selectedId = searchParams.get('i');
  const selectedItem = useMemo(
    () => (selectedId ? items.find(i => i.id === selectedId) ?? null : null),
    [selectedId, items]
  );

  function openItem(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('i', id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }
  function closeItem() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('i');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }

  // 主题色 lookup
  const topicColor = (t: ClusterKey): string => {
    if (t === '__unmapped__') return '#6B7390'; // bone-400
    return TOPIC_COLORS[t as keyof typeof TOPIC_COLORS];
  };

  // 绘制用的 viewBox（保持宽高比）
  const viewBox = `0 0 ${size.w} ${size.h}`;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden sm:h-[calc(100vh-72px)]"
    >
      {/* 背景：深墨蓝 + 极淡微粒（CSS 渲染，固定） */}
      <div className="absolute inset-0 bg-ink-900" aria-hidden>
        <div className="starfield absolute inset-0" />
      </div>

      {/* SVG 画布 */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {items.map((item, idx) => {
          const lead = (item.topics[0] as ClusterKey) || '__unmapped__';
          const pos = positions.get(item.id);
          if (!pos) return null;
          // 过滤：没选中的 topic 淡出
          const dimmed = topicFilter && topicFilter !== lead;
          const hidden = topicFilter && !groups[topicFilter].some(i => i.id === item.id);
          const stats = statsMap[item.id] ?? { actions: [], totalXp: 0 };
          const r = radiusForItem(stats.totalXp, stats.actions.length);
          const color = topicColor(lead);
          const brightness = 0.35 + (stats.actions.length / 5) * 0.65;
          const isComplete = stats.actions.length >= 5;
          const isSelected = selectedId === item.id;
          const delay = Math.min(idx * 8, 1200); // 错峰渐入

          return (
            <g
              key={item.id}
              style={{
                opacity: mounted && !hidden ? (dimmed ? 0.15 : brightness) : 0,
                transition: `opacity 1200ms ${delay}ms ease-out`,
                cursor: 'pointer'
              }}
              onClick={() => openItem(item.id)}
            >
              {/* 选中态：金环 */}
              {isSelected && (
                <circle
                  cx={pos.x} cy={pos.y} r={r + 6}
                  fill="none"
                  stroke="#D4A574"
                  strokeWidth={1}
                  opacity={0.8}
                />
              )}
              {/* 5 动作全做：金色光圈 */}
              {isComplete && !isSelected && (
                <circle
                  cx={pos.x} cy={pos.y} r={r + 4}
                  fill="none"
                  stroke="#D4A574"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              )}
              {/* 星本体 */}
              <circle
                cx={pos.x} cy={pos.y} r={r}
                fill={color}
                className="star-node"
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              >
                <title>{item.title}{item.source ? ` · ${item.source}` : ''}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* 底部左 chips（画布内、零背景） */}
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

      {/* 右上：统计小字 */}
      <div className="num absolute right-4 top-4 z-10 text-right text-[10px] uppercase tracking-widest text-bone-400 sm:right-6 sm:top-6">
        <div className="text-bone-200">
          {items.length} 颗 ·{' '}
          {Object.values(statsMap).reduce((s, v) => s + v.totalXp, 0)} XP
        </div>
        <div className="mt-0.5 opacity-60">
          {mounted ? '点击星进入详情' : '正在定位星图…'}
        </div>
      </div>

      {/* 选中态：用 ItemDrawer 浮层 */}
      {selectedItem && (
        <DrawerMount item={selectedItem} done={statsMap[selectedItem.id]?.actions ?? []} onClose={closeItem} />
      )}

      {/* 极简的 CSS：让 hover 放大、starring 视觉 */}
      <style jsx>{`
        :global(.star-node) {
          transition: r 200ms ease, filter 200ms ease;
        }
        :global(.star-node:hover) {
          filter: brightness(1.4);
        }
        :global(svg g:hover .star-node) {
          filter: brightness(1.5);
        }
        :global(.starfield) {
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(244, 233, 216, 0.6) 50%, transparent 100%),
            radial-gradient(1px 1px at 70% 60%, rgba(244, 233, 216, 0.4) 50%, transparent 100%),
            radial-gradient(1px 1px at 40% 80%, rgba(244, 233, 216, 0.5) 50%, transparent 100%),
            radial-gradient(1px 1px at 90% 20%, rgba(244, 233, 216, 0.3) 50%, transparent 100%),
            radial-gradient(1px 1px at 10% 70%, rgba(244, 233, 216, 0.5) 50%, transparent 100%),
            radial-gradient(1px 1px at 55% 15%, rgba(244, 233, 216, 0.4) 50%, transparent 100%),
            radial-gradient(1px 1px at 85% 45%, rgba(244, 233, 216, 0.5) 50%, transparent 100%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
}

// 把 ItemDrawer 拆出来用动态 import 避免首屏 bundle
function DrawerMount({ item, done, onClose }: { item: Item; done: ActionType[]; onClose: () => void }) {
  const [Drawer, setDrawer] = useState<any>(null);
  useEffect(() => {
    import('./ItemDrawer').then(mod => setDrawer(() => mod.ItemDrawer));
  }, []);
  if (!Drawer) return null;
  return <Drawer item={item} done={done} onClose={onClose} />;
}

function readStored(key: string): Record<string, StoredPosition> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeStored(key: string, value: Record<string, StoredPosition>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
