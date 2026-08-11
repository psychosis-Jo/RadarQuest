'use client';

import Link from 'next/link';
import { ACTION_LABELS } from '@radar-quest/shared';
import type { UserStats } from '@/lib/data/types';
import type { Boss } from '@/lib/data/boss';

const XP_PER_LEVEL = 100;

const QUICK_LINKS = [
  { href: '/my/quests',    icon: 'scroll',       label: '任务',     sub: '今日 3 个动作建议' },
  { href: '/my/skills',    icon: 'tree',         label: '技能树',   sub: '3 主题成长进度' },
  { href: '/my/bosses',    icon: 'star-four',    label: '星座',     sub: '点亮 IAU 88 真实星座' },
  { href: '/my/sky-atlas', icon: 'book-open',    label: '星图册',   sub: '你点亮的每一颗星' },
  { href: '/settings',     icon: 'gear-six',     label: '设置',     sub: '关键词 / 信源 / 强度' }
];

export function MyOverview({
  stats,
  activeBosses,
  skillCounts
}: {
  stats: UserStats;
  activeBosses: Boss[];
  skillCounts: Record<string, number>;
}) {
  const xpPct = (stats.xp_in_level / XP_PER_LEVEL) * 100;
  const todayByType = stats.today_by_type ?? { watch: 0, save: 0, note: 0, build: 0, publish: 0 };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl text-bone-50">我的</h1>
        <p className="mt-2 text-sm text-bone-200">
          等级、连续动作、在途星座 —— 沉淀下来的产出轨迹。
        </p>
      </header>

      {/* 4 张大卡：Lv / XP / Streak / 今日 */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigStat
          label="Level"
          value={stats.level}
          accent="gold"
          sub={stats.xp_to_next > 0 ? `再 +${stats.xp_to_next} XP 升级` : '已满级'}
        />
        <BigStat
          label="Total XP"
          value={stats.total_xp}
          sub={`今日 +${stats.today_xp}`}
          progress={xpPct}
        />
        <BigStat
          label="Streak"
          value={stats.action_streak}
          unit="天"
          accent="flame"
          sub={stats.publish_streak_weeks > 0 ? `出版连续 ${stats.publish_streak_weeks} 周` : '保持动作连续'}
        />
        <BigStat
          label="今日动作"
          value={stats.today_actions}
          sub={stats.today_publishes > 0 ? `已出版 ${stats.today_publishes} 件` : '记录每一次动作'}
        />
      </section>

      {/* 在途星座 */}
      {activeBosses.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between border-b border-ink-700 pb-2">
            <h2 className="font-display text-lg text-bone-50">在途星座</h2>
            <Link href="/my/bosses" className="num text-caption text-bone-400 hover:text-bone-50">
              管理 →
            </Link>
          </div>
          <div className="space-y-3">
            {activeBosses.slice(0, 5).map(b => {
              const pct = Math.min(100, (b.current / b.target) * 100);
              return (
                <div key={b.id} className="hand-drawn-border rounded-card bg-ink-800/40 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base text-bone-50">{b.name}</p>
                      {b.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-bone-400">{b.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="num text-sm text-flame">{b.current} / {b.target}</span>
                      <p className="num text-[10px] text-bone-400">{pct.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
                    <div className="h-full rounded-full bg-flame transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 今日动作分类 */}
      <section>
        <div className="mb-3 flex items-baseline justify-between border-b border-ink-700 pb-2">
          <h2 className="font-display text-lg text-bone-50">今日动作分布</h2>
          <span className="num text-caption text-bone-400">{stats.today_actions} 个动作</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(['watch', 'save', 'note', 'build', 'publish'] as const).map(t => {
            const count = todayByType[t] ?? 0;
            const lbl = ACTION_LABELS[t];
            return (
              <div key={t} className="rounded-card border border-ink-700 bg-ink-800/30 p-3 text-center">
                <i className={`ph-light ph-${lbl.icon} text-[22px] leading-none text-bone-200`} aria-hidden />
                <p className="num mt-2 text-lg text-bone-50">{count}</p>
                <p className="num mt-0.5 text-[10px] text-bone-400">{lbl.zh}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 快速入口 */}
      <section>
        <div className="mb-3 flex items-baseline justify-between border-b border-ink-700 pb-2">
          <h2 className="font-display text-lg text-bone-50">深入</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="hand-drawn-border group flex items-center gap-3 rounded-card bg-ink-800/40 p-4 transition-colors hover:bg-ink-800/70"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-ink-700/60 text-bone-200 group-hover:text-gold">
                <i className={`ph-light ph-${l.icon} text-[20px] leading-none`} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base text-bone-50 group-hover:text-gold">{l.label}</p>
                <p className="num mt-0.5 text-[11px] text-bone-400">{l.sub}</p>
              </div>
              <i className="ph-light ph-caret-right text-bone-400" aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  unit,
  sub,
  accent,
  progress
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: 'gold' | 'flame';
  progress?: number;
}) {
  const valueColor = accent === 'gold' ? 'text-gold' : accent === 'flame' ? 'text-flame' : 'text-bone-50';
  return (
    <div className="hand-drawn-border rounded-card bg-ink-800/40 p-5">
      <p className="num text-caption text-bone-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`num font-display text-display leading-none ${valueColor}`}>
          {value}
        </span>
        {unit && <span className="num text-sm text-bone-400">{unit}</span>}
      </div>
      {sub && <p className="num mt-2 text-[11px] text-bone-400">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}
