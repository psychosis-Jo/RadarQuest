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
    <nav className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="flex items-center gap-1 border-b border-ink-700 px-4 sm:px-0">
        {TABS.map(t => {
          const meta = TAB_LABELS[t.key];
          const isActive = active === t.key;
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`group relative shrink-0 px-3 py-3 text-sm transition-colors sm:px-4 ${
                isActive ? 'text-bone-50' : 'text-bone-400 hover:text-bone-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="font-display">{meta.zh}</span>
              <span className="ml-1.5 hidden text-[10px] uppercase tracking-widest text-bone-400 sm:inline">
                {meta.en}
              </span>
              {isActive && (
                <span className="absolute -bottom-px left-2 right-2 h-px bg-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
