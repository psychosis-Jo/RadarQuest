// 游戏规则

export type ActionType = 'watch' | 'save' | 'note' | 'build' | 'publish';

export const XP_VALUES: Record<ActionType, number> = {
  watch: 5,
  save: 10,
  note: 20,
  build: 50,
  publish: 100
};

export const ACTION_LABELS: Record<ActionType, { zh: string; en: string; emoji: string }> = {
  watch:   { zh: '看',     en: 'Watch',   emoji: '👀' },
  save:    { zh: '收',     en: 'Save',    emoji: '🔖' },
  note:    { zh: '写',     en: 'Note',    emoji: '📝' },
  build:   { zh: '做',     en: 'Build',   emoji: '🛠' },
  publish: { zh: '发',     en: 'Publish', emoji: '📢' }
};

export const XP_PER_LEVEL = 100;

/**
 * 从总 XP 算 Level
 */
export function levelFromXP(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

/**
 * 当前 Level 已获得的 XP（用于进度条）
 */
export function xpInCurrentLevel(totalXP: number): number {
  return totalXP % XP_PER_LEVEL;
}

/**
 * 升到下一级还需要的 XP
 */
export function xpToNextLevel(totalXP: number): number {
  return XP_PER_LEVEL - xpInCurrentLevel(totalXP);
}

/**
 * 给 action 算 XP（考虑冷启动补偿）
 */
export function calculateXP(
  action: ActionType,
  options?: { topic_neglected_days?: number }
): number {
  let xp = XP_VALUES[action];
  // 冷启动补偿：如果某个主题被冷落 7+ 天，加 50% XP（一次性的）
  if (options?.topic_neglected_days && options.topic_neglected_days >= 7) {
    xp = Math.floor(xp * 1.5);
  }
  return xp;
}
