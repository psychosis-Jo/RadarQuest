import Link from 'next/link';
import { getUserStats } from '@/lib/data/stats';
import { getActiveBosses } from '@/lib/data/boss';
import { CompassRose } from '../hand-drawn/Divider';

export async function Header() {
  const stats = await getUserStats();
  const bosses = await getActiveBosses();
  const bossText = bosses.length === 0 ? '无活跃' : bosses.length === 1 ? bosses[0].name.slice(0, 10) : `${bosses.length} 个活跃`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <CompassRose size={20} className="text-gold" />
          <span className="font-display text-xl text-bone-50">
            Radar <span className="italic text-gold">Quest</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <Stat label="Lv" value={stats.level} highlight />
          <Stat label="XP" value={stats.total_xp} sub={`+${stats.today_xp} 今日`} />
          <Stat label="🔥" value={stats.action_streak} sub="天 streak" />
          <Stat label="星座" value={bossText} />
        </div>

        <nav className="flex items-center gap-3 text-xs">
          <Link href="/quests" className="text-bone-200 hover:text-bone-50">任务</Link>
          <Link href="/skills" className="text-bone-200 hover:text-bone-50">技能</Link>
          <Link href="/bosses" className="text-bone-200 hover:text-bone-50">星座</Link>
          <Link href="/settings" className="text-bone-200 hover:text-bone-50">设置</Link>
        </nav>
      </div>
    </header>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: any; sub?: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] uppercase tracking-wider text-bone-400">{label}</span>
        <span className={`num ${highlight ? 'font-display text-base text-gold' : 'text-sm text-bone-50'}`}>
          {value}
        </span>
      </div>
      {sub && <span className="num text-[10px] text-bone-400">{sub}</span>}
    </div>
  );
}
