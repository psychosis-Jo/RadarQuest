// 轻量力学布局 —— 同 topic 吸引、不同 topic 排斥、所有节点互斥
// 不依赖 d3，自己写 200 次迭代的 O(n²) 模拟
// n < 200 性能 OK；n > 500 该用 quadtree 重写

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

// 3 簇的归一化中心（0-1，会按画布实际尺寸缩放）
// 三角形分布，留出中间和边缘给未分类
const TOPIC_CENTERS: Record<Topic, [number, number]> = {
  'AI':           [0.5,  0.18],  // 顶部正中
  'one-person':   [0.78, 0.78],  // 右下
  'self-mgmt':    [0.22, 0.78],  // 左下
  '__unmapped__': [0.5,  0.5]    // 中心
};

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
      x: cx * width  + (Math.random() - 0.5) * 80,
      y: cy * height + (Math.random() - 0.5) * 80
    });
    velocities.set(n.id, { x: 0, y: 0 });
  }

  const iterations = 220;
  const repulsion = 1200;        // 节点间排斥强度
  const centerPull = 0.004;      // 拉向 topic 中心的强度
  const unmappedPull = 0.0005;   // 未分类拉得弱一些（让它散开）
  const damping = 0.82;
  const minDist = 0.5;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = Math.pow(1 - iter / iterations, 0.6); // cooling（缓启动）

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const pa = positions.get(a.id)!;
      const va = velocities.get(a.id)!;
      let fx = 0, fy = 0;

      // 排斥力
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const b = nodes[j];
        const pb = positions.get(b.id)!;
        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), minDist);
        const minGap = a.radius + b.radius + 4;
        const force = repulsion * minGap / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }

      // 拉向 topic 中心
      const [cx, cy] = TOPIC_CENTERS[a.topic] ?? TOPIC_CENTERS.__unmapped__;
      const strength = a.topic === '__unmapped__' ? unmappedPull : centerPull;
      fx += (cx * width  - pa.x) * strength;
      fy += (cy * height - pa.y) * strength;

      // 更新速度（带 cooling）
      va.x = (va.x + fx * 0.0008) * damping * alpha + va.x * (1 - alpha) * 0;
      va.y = (va.y + fy * 0.0008) * damping * alpha + va.y * (1 - alpha) * 0;
    }

    // 应用速度到位置
    for (const n of nodes) {
      const p = positions.get(n.id)!;
      const v = velocities.get(n.id)!;
      p.x += v.x;
      p.y += v.y;
      // 边界 clamp
      p.x = Math.max(n.radius + 2, Math.min(width  - n.radius - 2, p.x));
      p.y = Math.max(n.radius + 2, Math.min(height - n.radius - 2, p.y));
    }
  }

  return positions;
}

// 用 item 推算星半径
export function radiusForItem(totalXp: number, actionCount: number): number {
  // 0 XP = 3px 起步；满 XP = ~10px
  const base = 3 + Math.sqrt(totalXp) * 0.5;
  // 已完成 5 动作的星略大
  const bonus = actionCount >= 5 ? 1.5 : 0;
  return Math.min(12, base + bonus);
}
