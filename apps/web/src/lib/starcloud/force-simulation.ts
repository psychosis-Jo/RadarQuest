// 轻量力学布局 —— 同 topic 吸引、不同 topic 排斥、所有节点互斥
// 不依赖 d3，自己写迭代的 O(n²) 模拟

export type Topic = 'AI' | 'one-person' | 'self-mgmt' | '__unmapped__';

export interface SimNode {
  id: string;
  topic: Topic;
  radius: number;
}

export interface Position {
  x: number;
  y: number;
}

// viewBox 是固定的 1200x600（与 SVG 一致）
// 3 簇在三角形顶点，中心点放未分类
const TOPIC_CENTERS: Record<Topic, [number, number]> = {
  'AI':           [600, 110],  // 顶部正中
  'one-person':   [960, 480],  // 右下
  'self-mgmt':    [240, 480],  // 左下
  '__unmapped__': [600, 320]   // 中部（拉得弱，散开）
};

// 星半径：0 XP = 6px，满 XP ≈ 16px，5 动作全做 +2
export function radiusForItem(totalXp: number, actionCount: number): number {
  const base = 6 + Math.sqrt(totalXp) * 0.7;
  const bonus = actionCount >= 5 ? 2 : 0;
  return Math.min(20, base + bonus);
}

export function simulateLayout(
  nodes: SimNode[],
  width: number,
  height: number
): Map<string, Position> {
  const positions = new Map<string, Position>();
  const velocities = new Map<string, Position>();

  // 初始化：从 topic 中心出发，加随机扰动
  for (const n of nodes) {
    const [cx, cy] = TOPIC_CENTERS[n.topic] ?? TOPIC_CENTERS.__unmapped__;
    positions.set(n.id, {
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40
    });
    velocities.set(n.id, { x: 0, y: 0 });
  }

  const iterations = 180;
  const repulsionK = 1800;       // 节点间排斥
  const centerPull = 0.06;       // 拉向 topic 中心（强）
  const unmappedPull = 0.005;    // 未分类拉得弱（散开）
  const repelRange = 160;        // 排斥作用范围（超出不再排斥，让簇更紧）
  const damping = 0.78;
  const minDist = 0.5;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = Math.pow(1 - iter / iterations, 0.5);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const pa = positions.get(a.id)!;
      const va = velocities.get(a.id)!;
      let fx = 0, fy = 0;

      // 排斥力（限定作用范围）
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const b = nodes[j];
        const pb = positions.get(b.id)!;
        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), minDist);
        if (dist > repelRange) continue;
        const minGap = a.radius + b.radius + 6;
        const force = repulsionK * minGap / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }

      // 拉向 topic 中心
      const [cx, cy] = TOPIC_CENTERS[a.topic] ?? TOPIC_CENTERS.__unmapped__;
      const strength = a.topic === '__unmapped__' ? unmappedPull : centerPull;
      fx += (cx - pa.x) * strength;
      fy += (cy - pa.y) * strength;

      // 累积速度
      va.x = (va.x + fx * 0.0005) * damping * alpha;
      va.y = (va.y + fy * 0.0005) * damping * alpha;
    }

    // 应用速度
    for (const n of nodes) {
      const p = positions.get(n.id)!;
      const v = velocities.get(n.id)!;
      p.x += v.x;
      p.y += v.y;
      p.x = Math.max(n.radius + 4, Math.min(width  - n.radius - 4, p.x));
      p.y = Math.max(n.radius + 4, Math.min(height - n.radius - 4, p.y));
    }
  }

  return positions;
}
