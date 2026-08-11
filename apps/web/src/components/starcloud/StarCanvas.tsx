'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@starcatcher/shared';
import { TOPIC_COLORS, TOPIC_LABELS } from '@starcatcher/shared';
import { CanvasChips } from './CanvasChips';
import { StarDetailCard, type Anchor } from './StarDetailCard';

type Stats = { actions: ActionType[]; totalXp: number };
type ClusterKey = 'AI' | 'one-person' | 'self-mgmt' | '__unmapped__';

// 归一化坐标 (0-1) 簇中心：AI 顶中、一人在右下、自我管理在左下、未分类在中央
const CLUSTERS: Record<ClusterKey, { nx: number; ny: number }> = {
  'AI':           { nx: 0.50, ny: 0.18 },
  'one-person':   { nx: 0.80, ny: 0.80 },
  'self-mgmt':    { nx: 0.20, ny: 0.80 },
  '__unmapped__': { nx: 0.50, ny: 0.53 }
};

const CLUSTER_RADIUS = 0.10;     // 簇内抖动半径
const AMBIENT_COUNT = 180;       // ambient 星数量
const LINE_NEAR_DIST = 0.14;     // 主题线：同主题近邻阈值（归一化）
const DRAG_THRESHOLD = 3;        // 拖拽判定阈值（px）
const HIT_RADIUS_MIN = 10;       // 最小命中半径（px）
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const WHEEL_STEP_IN = 1.08;
const WHEEL_STEP_OUT = 0.93;

const TOPIC_COLORS_MAP: Record<ClusterKey, string> = {
  'AI': TOPIC_COLORS.AI,
  'one-person': TOPIC_COLORS['one-person'],
  'self-mgmt': TOPIC_COLORS['self-mgmt'],
  '__unmapped__': '#A8B0C8'
};

interface AmbientStar {
  nx: number; ny: number;
  r: number;
  phase: number; speed: number; // twinkle
}

interface ContentPos { nx: number; ny: number }

// 简单的字符串 hash → uint32（用于确定性位置）
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededPos(id: string, topic: ClusterKey): ContentPos {
  const seed = hashStr(id);
  const c = CLUSTERS[topic] ?? CLUSTERS.__unmapped__;
  const angle = ((seed % 100000) / 100000) * Math.PI * 2;
  const dist = (((seed >>> 8) % 100000) / 100000) * CLUSTER_RADIUS;
  return {
    nx: c.nx + Math.cos(angle) * dist,
    ny: c.ny + Math.sin(angle) * dist * 0.6
  };
}

export function StarCanvas({
  items,
  statsMap,
  showBackground = true
}: {
  items: Item[];
  statsMap: Record<string, Stats>;
  /** showBackground=false 时由 HomePage 在外层画底色 + vignette */
  showBackground?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [topicFilter, setTopicFilter] = useState<ClusterKey | null>(null);

  // view state 用 ref 不触发重渲染
  const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, lastX: 0, lastY: 0, moved: false });
  const ambientRef = useRef<AmbientStar[]>([]);
  const rafRef = useRef<number | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const filterRef = useRef<ClusterKey | null>(null);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { filterRef.current = topicFilter; }, [topicFilter]);

  // 内容星位置：hash 确定性，刷新 / 数据变更都不跳
  const contentPositions = useMemo(() => {
    const out = new Map<string, ContentPos>();
    for (const it of items) {
      const t = (it.topics[0] as ClusterKey) || '__unmapped__';
      out.set(it.id, seededPos(it.id, t));
    }
    return out;
  }, [items]);

  // 分组
  const groups = useMemo(() => {
    const out: Record<ClusterKey, Item[]> = {
      'AI': [], 'one-person': [], 'self-mgmt': [], '__unmapped__': []
    };
    for (const it of items) {
      const t = (it.topics[0] as ClusterKey) || '__unmapped__';
      out[t].push(it);
    }
    return out;
  }, [items]);

  // 主题连线：每个 topic 内部做最近邻
  const lines = useMemo(() => {
    const out: Array<{ aId: string; bId: string; topic: ClusterKey }> = [];
    for (const t of Object.keys(CLUSTERS) as ClusterKey[]) {
      const arr = (groups[t] ?? []).filter(it => contentPositions.has(it.id));
      for (let i = 0; i < arr.length; i++) {
        const a = contentPositions.get(arr[i].id)!;
        let nearestId: string | null = null;
        let nearestD = LINE_NEAR_DIST;
        for (let j = 0; j < arr.length; j++) {
          if (i === j) continue;
          const b = contentPositions.get(arr[j].id)!;
          const d = Math.hypot(a.nx - b.nx, a.ny - b.ny);
          if (d < nearestD) { nearestD = d; nearestId = arr[j].id; }
        }
        if (nearestId) out.push({ aId: arr[i].id, bId: nearestId, topic: t });
      }
    }
    return out;
  }, [groups, contentPositions]);

  // ambient 星只生成一次
  useEffect(() => {
    const arr: AmbientStar[] = [];
    for (let i = 0; i < AMBIENT_COUNT; i++) {
      arr.push({
        nx: Math.random(),
        ny: Math.random(),
        r: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8
      });
    }
    ambientRef.current = arr;
  }, []);

  // 主绘制循环 + 交互
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener('resize', resize);

    // 归一化 → 屏幕（中心锚缩放 + 偏移）
    function toScreen(nx: number, ny: number, W: number, H: number) {
      const { scale, offsetX, offsetY } = viewRef.current;
      const cx = W / 2, cy = H / 2;
      return {
        x: (nx * W - cx) * scale + cx + offsetX,
        y: (ny * H - cy) * scale + cy + offsetY
      };
    }

    function hexA(color: string, alpha: number) {
      let h = color.replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function draw(time: number) {
      const rect = container!.getBoundingClientRect();
      const W = rect.width, H = rect.height;
      ctx!.clearRect(0, 0, W, H);

      const { scale } = viewRef.current;
      const sel = selectedIdRef.current;
      const filter = filterRef.current;

      // 1) Ambient 星（带 twinkle）
      for (const s of ambientRef.current) {
        const p = toScreen(s.nx, s.ny, W, H);
        // 视口外剔除
        if (p.x < -2 || p.x > W + 2 || p.y < -2 || p.y > H + 2) continue;
        const r = s.r * scale;
        const tw = 0.5 + 0.5 * Math.sin(time / 1100 * s.speed + s.phase);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = hexA('#F4E9D8', 0.18 + 0.4 * tw);
        ctx!.fill();
      }

      // 2) 簇光晕（cluster glow）
      for (const [t, c] of Object.entries(CLUSTERS) as [ClusterKey, { nx: number; ny: number }][]) {
        if (filter && filter !== t) continue;
        const p = toScreen(c.nx, c.ny, W, H);
        const radius = 200 * scale;
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        const color = TOPIC_COLORS_MAP[t];
        grad.addColorStop(0, hexA(color, 0.22));
        grad.addColorStop(0.5, hexA(color, 0.07));
        grad.addColorStop(1, hexA(color, 0));
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 3) 主题线
      ctx!.lineWidth = 1;
      for (const l of lines) {
        if (filter && filter !== l.topic) continue;
        const a = contentPositions.get(l.aId);
        const b = contentPositions.get(l.bId);
        if (!a || !b) continue;
        const pa = toScreen(a.nx, a.ny, W, H);
        const pb = toScreen(b.nx, b.ny, W, H);
        const isSel = sel && (sel === l.aId || sel === l.bId);
        const c = TOPIC_COLORS_MAP[l.topic];
        ctx!.beginPath();
        ctx!.moveTo(pa.x, pa.y);
        ctx!.lineTo(pb.x, pb.y);
        ctx!.strokeStyle = hexA(c, isSel ? 0.45 : 0.16);
        if (!isSel) ctx!.setLineDash([2, 4]);
        else ctx!.setLineDash([]);
        ctx!.stroke();
      }
      ctx!.setLineDash([]);

      // 4) 内容星（glow + core + ring）
      for (const it of items) {
        const pos = contentPositions.get(it.id);
        if (!pos) continue;
        const topic = (it.topics[0] as ClusterKey) || '__unmapped__';
        if (filter && filter !== topic) continue;
        const p = toScreen(pos.nx, pos.ny, W, H);
        // 视口外剔除
        if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;

        const color = TOPIC_COLORS_MAP[topic];
        const stats = statsMap[it.id] ?? { actions: [], totalXp: 0 };
        const baseR = 1.5 + Math.sqrt(stats.totalXp) * 0.7;
        const r = Math.min(8, baseR) * scale;
        const brightness = 0.55 + (stats.actions.length / 5) * 0.45;
        const isComplete = stats.actions.length >= 5;
        const isSelected = sel === it.id;

        // 选中 / 完成 ring
        if (isSelected) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, r + 7, 0, Math.PI * 2);
          ctx!.strokeStyle = '#D4A574';
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
        } else if (isComplete) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
          ctx!.strokeStyle = hexA('#D4A574', 0.7);
          ctx!.lineWidth = 1.2;
          ctx!.stroke();
        }

        // glow halo（径向渐变）
        const glowR = r * 6;
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, hexA(color, 0.55 * brightness));
        grad.addColorStop(0.4, hexA(color, 0.15 * brightness));
        grad.addColorStop(1, hexA(color, 0));
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx!.fill();

        // core
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = hexA(color, brightness);
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [items, statsMap, lines, contentPositions]);

  // --- 交互：pointer + wheel ---

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.lastX;
    const dy = e.clientY - d.lastY;
    if (Math.abs(e.clientX - d.startX) > DRAG_THRESHOLD ||
        Math.abs(e.clientY - d.startY) > DRAG_THRESHOLD) {
      d.moved = true;
    }
    if (d.moved) {
      viewRef.current.offsetX += dx;
      viewRef.current.offsetY += dy;
    }
    d.lastX = e.clientX;
    d.lastY = e.clientY;
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch {}
    if (d.moved) return;  // 是拖拽，不触发命中

    // 命中测试
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = rect.width, H = rect.height;
    const { scale, offsetX, offsetY } = viewRef.current;
    const cx = W / 2, cy = H / 2;
    const nx = ((mx - offsetX - cx) / scale + cx) / W;
    const ny = ((my - offsetY - cy) / scale + cy) / H;

    let best: { id: string; d: number } | null = null;
    for (const it of items) {
      const p = contentPositions.get(it.id);
      if (!p) continue;
      const topic = (it.topics[0] as ClusterKey) || '__unmapped__';
      if (topicFilter && topicFilter !== topic) continue;
      const stats = statsMap[it.id] ?? { actions: [], totalXp: 0 };
      const baseR = 1.5 + Math.sqrt(stats.totalXp) * 0.7;
      const r = Math.max(HIT_RADIUS_MIN, Math.min(8, baseR) * scale + 4);
      const dx = (p.nx - nx) * W;
      const dy = (p.ny - ny) * H;
      const d2 = Math.hypot(dx, dy);
      if (d2 <= r && (!best || d2 < best.d)) {
        best = { id: it.id, d: d2 };
      }
    }
    if (best) {
      setAnchor({ x: mx, y: my, containerW: W, containerH: H });
      setSelectedId(best.id);
    } else {
      // miss: 关闭
      setSelectedId(null);
      setAnchor(null);
    }
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const v = viewRef.current;
    v.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.scale * (e.deltaY < 0 ? WHEEL_STEP_IN : WHEEL_STEP_OUT)));
  }

  function onDoubleClick() {
    viewRef.current = { scale: 1, offsetX: 0, offsetY: 0 };
  }

  const selectedItem = useMemo(
    () => selectedId ? items.find(i => i.id === selectedId) ?? null : null,
    [selectedId, items]
  );

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden sm:h-[calc(100vh-72px)]"
    >
      {showBackground && (
        <div className="absolute inset-0 bg-ink-900" aria-hidden>
          <div className="starfield-veil absolute inset-0" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        role="img"
        aria-label={`星云画布：${items.length} 颗内容星 + ${AMBIENT_COUNT} 颗 ambient 星。拖拽平移，滚轮缩放，双击重置。`}
      />

      {/* 顶部 chips 浮在 canvas 上面 */}
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

      {/* 底部统计 + 重置提示 */}
      <div className="num pointer-events-none absolute bottom-4 right-4 z-10 text-right text-[10px] text-bone-400 sm:bottom-6 sm:right-6">
        <div>{items.length} 颗 · 已留下的星</div>
        <div className="mt-0.5 opacity-70">拖拽平移 · 滚轮缩放 · 双击重置</div>
      </div>

      {/* 弹卡 */}
      {selectedItem && anchor && (
        <StarDetailCard
          item={selectedItem}
          done={statsMap[selectedItem.id]?.actions ?? []}
          anchor={anchor}
          onClose={() => { setSelectedId(null); setAnchor(null); }}
        />
      )}

      <style jsx>{`
        :global(.starfield-veil) {
          background: radial-gradient(
            ellipse 110% 110% at 50% 50%,
            rgba(15, 20, 36, 0.20) 0%,
            rgba(15, 20, 36, 0.30) 60%,
            rgba(15, 20, 36, 0.35) 100%
          );
        }
      `}</style>
    </div>
  );
}
