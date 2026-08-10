import Link from 'next/link';
import { TAB_LABELS } from '@radar-quest/shared';

const TABS = [
  { key: 'trending', href: '/' },
  { key: 'spike',    href: '/spike' },
  { key: 'rise',     href: '/rise' },
  { key: 'density',  href: '/density' },
  { key: 'cross',    href: '/cross' }
] as const;

export function TabNav({ active }: { active: string }) {
  return (
    <nav className="flex items-center gap-1 border-b border-ink-700">
      {TABS.map(t => {
        const meta = TAB_LABELS[t.key];
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={`group relative px-4 py-3 text-sm transition-colors
              ${isActive ? 'text-bone-50' : 'text-bone-400 hover:text-bone-200'}`}
          >
            <span className="font-display">{meta.zh}</span>
            <span className="ml-1.5 text-[10px] uppercase tracking-wider text-bone-400">
              {meta.en}
            </span>
            {isActive && (
              <span className="absolute -bottom-px left-2 right-2 h-px bg-gold" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
