// 5 个标签的计算逻辑

export type TabKey = 'trending' | 'spike' | 'rise' | 'density' | 'cross';

export const TAB_LABELS: Record<TabKey, { zh: string; en: string; description: { zh: string; en: string } }> = {
  trending: {
    zh: 'Trending 榜',
    en: 'Trending',
    description: {
      zh: '今天在榜单上',
      en: "On today's leaderboard"
    }
  },
  spike: {
    zh: '短时间爆发',
    en: 'Sudden Spike',
    description: {
      zh: '7 天内突然涨起来',
      en: 'Surged in the last 7 days'
    }
  },
  rise: {
    zh: '持续上升',
    en: 'Steady Rise',
    description: {
      zh: '30 天里稳步上扬',
      en: 'Steadily rising over 30 days'
    }
  },
  density: {
    zh: '讨论密度',
    en: 'Discussion Density',
    description: {
      zh: '评论、PR、讨论最活跃',
      en: 'Most active discussions'
    }
  },
  cross: {
    zh: '跨平台提及',
    en: 'Cross-Platform',
    description: {
      zh: '在多个信源都出现',
      en: 'Mentioned across platforms'
    }
  }
};

/**
 * Trending 得分：来自平台官方榜单的原始排名归一化
 */
export function trendingScore(rankInSource: number, sourceCount: number): number {
  if (rankInSource <= 0) return 0;
  return Math.max(0, 100 - (rankInSource / sourceCount) * 100);
}

/**
 * Spike 分数：过去 7 天的增量倍数
 * @param current 当前指标
 * @param weekAgo 7 天前指标
 * @returns 0-100 分数，倍数越高分越高
 */
export function spikeScore(current: number, weekAgo: number): number {
  if (weekAgo <= 0) {
    // 没有 7 天前数据，无法计算
    return 0;
  }
  const ratio = current / weekAgo;
  // ratio = 2 -> 50, ratio = 5 -> 80, ratio = 10+ -> 100
  return Math.min(100, Math.log2(ratio) * 25);
}

/**
 * Rise 分数：过去 30 天的整体趋势
 * 用线性回归斜率，归一化到 0-100
 * @param history 30 天的数据，按时间正序
 */
export function riseScore(history: number[]): number {
  if (history.length < 7) return 0; // 数据不足
  const n = history.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = history.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * history[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  // slope 为正就说明上升，归一化
  return Math.max(0, Math.min(100, slope * 5));
}

/**
 * Density 分数：评论 / PR / upvotes 加权
 */
export function densityScore(metrics: { comments?: number; prs?: number; upvotes?: number }): number {
  const c = metrics.comments ?? 0;
  const p = metrics.prs ?? 0;
  const u = metrics.upvotes ?? 0;
  return Math.min(100, Math.log2(1 + c) * 5 + Math.log2(1 + p) * 3 + Math.log2(1 + u) * 2);
}

/**
 * Cross 分数：跨多少个信源
 */
export function crossScore(sources: string[]): number {
  const unique = new Set(sources).size;
  if (unique < 2) return 0;
  return Math.min(100, unique * 30);
}
