// 真实星座数据 + Boss 分配逻辑
// 数据来源：data/constellations.json
// 前 33 条为手写精确数据（基于 IAU 88 + 标准星图册）
// 后 55 条为 stub（仅 ID 占位），v2 用 HYG 星表程序化补全

import data from '../../../data/constellations.json';

export type Hemisphere = 'north' | 'south' | 'equatorial';
export type ConstellationTier = 1 | 2 | 3;

export interface ConstellationStar {
  name_en: string;
  name_zh?: string;
  x: number;        // 0-1 normalized, can extend slightly outside for tail stars
  y: number;        // 0-1 normalized
  magnitude: number;
}

export interface Constellation {
  id: string;
  name_en: string;
  name_zh: string;
  abbreviation: string;
  hemisphere: Hemisphere;
  best_month_en: string;
  best_month_zh: string;
  mythology_en: string;
  mythology_zh: string;
  tier: ConstellationTier;
  stars: ConstellationStar[];
  lines: Array<[number, number]>;
}

interface RawConstellationJson {
  schema_version: number;
  source: string;
  note_zh: string;
  constellations: Constellation[];
  stub_constellations: string[];
}

const constellationData = data as RawConstellationJson;

// ===== 静态数据 =====

/** 已实现精确星位的 33 个 IAU 星座（按 ID 排序） */
export const ALL_CONSTELLATIONS: readonly Constellation[] = Object.freeze(
  [...constellationData.constellations].sort((a, b) => a.id.localeCompare(b.id))
);

/** 仅占位、待 v2 程序化补全的 55 个星座 ID */
export const STUB_CONSTELLATION_IDS: readonly string[] = Object.freeze(
  [...constellationData.stub_constellations].sort()
);

/** 全部 88 个 IAU 星座 ID 列表（curated + stub） */
export const ALL_IAU_IDS: readonly string[] = Object.freeze([
  ...ALL_CONSTELLATIONS.map(c => c.id),
  ...STUB_CONSTELLATION_IDS
]);

// ===== 查找 =====

export function getConstellationById(id: string): Constellation | undefined {
  return ALL_CONSTELLATIONS.find(c => c.id === id);
}

export function getConstellationsByTier(tier: ConstellationTier): Constellation[] {
  return ALL_CONSTELLATIONS.filter(c => c.tier === tier);
}

// ===== Tier 计算 =====

/**
 * 把"目标动作数"映射到 tier：
 * - N ≤ 4 → 小 (1-3 个动作)
 * - 5 ≤ N ≤ 8 → 中 (4-7 个动作)
 * - N ≥ 9 → 大 (8+ 个动作)
 */
export function tierForStarCount(starCount: number): ConstellationTier {
  if (starCount <= 4) return 1;
  if (starCount <= 8) return 2;
  return 3;
}

/** tier 标签（用于 UI 显示） */
export const TIER_LABELS: Record<ConstellationTier, { zh: string; en: string }> = {
  1: { zh: '小星座', en: 'Small' },
  2: { zh: '中星座', en: 'Medium' },
  3: { zh: '大星座', en: 'Large' }
};

/** tier 的星数范围 */
export const TIER_RANGES: Record<ConstellationTier, { min: number; max: number }> = {
  1: { min: 2, max: 4 },
  2: { min: 5, max: 8 },
  3: { min: 9, max: 99 }
};

// ===== Boss 分配 =====

export interface PickResult {
  constellation: Constellation;
  /** 与目标星数的差值（绝对值） */
  starDiff: number;
  /** 实际匹配到的 tier（可能因同 tier 用尽而回退到相邻 tier） */
  matchedTier: ConstellationTier;
  /** 是否在首选 tier 内匹配 */
  isPreferredTier: boolean;
}

/**
 * 为一个 Boss 选一个星座：
 * 1. 排除已用过的
 * 2. 优先在首选 tier 找星数最接近的
 * 3. 同 tier 用完则回退到相邻 tier
 * 4. 88 个全用完返回 null
 */
export function pickConstellationForBoss(
  targetStars: number,
  usedIds: string[] = []
): Constellation | null {
  const available = ALL_CONSTELLATIONS.filter(c => !usedIds.includes(c.id));
  if (available.length === 0) return null;

  const preferred = tierForStarCount(targetStars);
  const tierOrder: ConstellationTier[] = preferred === 1
    ? [1, 2, 3]
    : preferred === 2
    ? [2, 1, 3]
    : [3, 2, 1];

  for (const tier of tierOrder) {
    const inTier = available.filter(c => c.tier === tier);
    if (inTier.length === 0) continue;
    return inTier.reduce((best, cur) => {
      const bestDiff = Math.abs(best.stars.length - targetStars);
      const curDiff = Math.abs(cur.stars.length - targetStars);
      return curDiff < bestDiff ? cur : best;
    });
  }

  return null;
}

/**
 * 带详细诊断的版本（用于 UI 展示"为什么是它"）
 */
export function pickConstellationForBossDetailed(
  targetStars: number,
  usedIds: string[] = []
): PickResult | null {
  const available = ALL_CONSTELLATIONS.filter(c => !usedIds.includes(c.id));
  if (available.length === 0) return null;

  const preferred = tierForStarCount(targetStars);
  const tierOrder: ConstellationTier[] = preferred === 1
    ? [1, 2, 3]
    : preferred === 2
    ? [2, 1, 3]
    : [3, 2, 1];

  for (const tier of tierOrder) {
    const inTier = available.filter(c => c.tier === tier);
    if (inTier.length === 0) continue;
    const pick = inTier.reduce((best, cur) => {
      const bestDiff = Math.abs(best.stars.length - targetStars);
      const curDiff = Math.abs(cur.stars.length - targetStars);
      return curDiff < bestDiff ? cur : best;
    });
    return {
      constellation: pick,
      starDiff: Math.abs(pick.stars.length - targetStars),
      matchedTier: tier,
      isPreferredTier: tier === preferred
    };
  }

  return null;
}
