import Link from 'next/link';

import { getUserStats } from '@/lib/data/stats';
import { getActiveBosses } from '@/lib/data/boss';
import { CompassRose } from '../hand-drawn/Divider';

export async function Header() {
  const stats = await getUserStats();
  const bosses = await getActiveBosses();
  const bossText = bosses.length === 0
    ? '无活跃'
    : bosses.length === 1
      ? bosses[0].name
      : `${bosses.length} 个活跃`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <CompassRose size={20} className="text-gold" />
          <span className="font-display text-lg text-bone-50 sm:text-xl">
            Radar <span className="italic text-gold">Quest</span>
          </span>
        </Link>

        {/* Stats — desktop full / mobile condensed */}
        <div className="hidden items-center gap-5 sm:flex">
          <Stat label="Lv" value={stats.level} accent="gold" />
          <Stat label="XP" value={stats.total_xp} sub={`+${stats.today_xp} 今日`} />
          <Stat label="Streak" value={stats.action_streak} sub="天" accent="flame" />
          <Stat label="星座" value={bossText} />
        </div>

        {/* Mobile condensed stats */}
        <div className="flex items-center gap-3 sm:hidden">
          <span className="num text-sm text-gold">Lv {stats.level}</span>
          <span className="num text-sm text-bone-200">{stats.total_xp} XP</span>
          {stats.action_streak > 0 && (
            <span className="num text-sm text-flame">{stats.action_streak}天</span>
          )}
        </div>

        {/* Nav — 4 项主 tab (Phosphor light web font) */}
        <nav className="flex items-center gap-1 text-xs sm:gap-1 sm:text-sm">
          <NavLink href="/capture" icon="book-open">捕捉</NavLink>
          <NavLink href="/" icon="star">星云</NavLink>
          <NavLink href="/my" icon="user">我的</NavLink>
          <NavLink href="/settings" icon="gear">设置</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-button px-2 py-1 text-bone-200 transition-colors hover:bg-ink-800 hover:text-bone-50 sm:px-3"
    >
      {icon && <i className={`ph-light ph-${icon} text-[18px] leading-none`} aria-hidden />}
      <span>{children}</span>
    </Link>
  );
}

function Stat({
  label,
  value,
  sub,
  accent
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'gold' | 'flame';
}) {
  const valueClass = accent === 'gold'
    ? 'num text-sm text-gold'
    : accent === 'flame'
      ? 'num text-sm text-flame'
      : 'num text-sm text-bone-50';
  return (
    <div className="flex flex-col items-end leading-tight">
      <div className="flex items-baseline gap-1.5">
        <span className="num text-caption text-bone-400">
          {label}
        </span>
        <span className={valueClass}>
          {value}
        </span>
      </div>
      {sub && <span className="num text-[10px] text-bone-400">{sub}</span>}
    </div>
  );
}
