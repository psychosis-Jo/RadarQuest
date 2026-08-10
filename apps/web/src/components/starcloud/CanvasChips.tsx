'use client';
import type { Topic } from '@/lib/starcloud/force-simulation';
import { TOPIC_LABELS } from '@radar-quest/shared';

interface Counts {
  all: number;
  AI: number;
  'one-person': number;
  'self-mgmt': number;
  __unmapped__: number;
}

const CHIPS: Array<{
  key: 'all' | Topic;
  label: string;
  color: string;
}> = [
  { key: 'all',         label: '全部',     color: '#F4E9D8' }, // bone-50
  { key: 'AI',          label: 'AI',       color: '#5FE0C7' },
  { key: 'one-person',  label: '一人公司', color: '#E8B86F' },
  { key: 'self-mgmt',   label: '自我管理', color: '#B8A4D4' },
  { key: '__unmapped__',label: '未分类',   color: '#6B7390' }
];

export function CanvasChips({
  counts,
  active,
  onChange
}: {
  counts: Counts;
  active: Topic | null;
  onChange: (t: Topic | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
      {CHIPS.map(c => {
        const isAll = c.key === 'all';
        const isActive = isAll ? !active : active === c.key;
        const count = isAll ? counts.all : counts[c.key as keyof Counts];
        if (!isAll && count === 0) return null;
        return (
          <button
            key={c.key}
            onClick={() => {
              if (isAll) onChange(null);
              else onChange(isActive ? null : (c.key as Topic));
            }}
            className="group flex items-center gap-1.5 px-1 py-0.5 transition-opacity hover:opacity-100"
            style={{ opacity: isActive ? 1 : 0.55 }}
            title={isAll ? '看全部' : `只看 ${c.label}`}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full transition-transform"
              style={{
                background: c.color,
                transform: isActive ? 'scale(1.4)' : 'scale(1)'
              }}
            />
            <span
              className={`transition-colors ${isActive ? 'text-bone-50' : 'text-bone-200'}`}
            >
              {c.label}
            </span>
            <span className="num text-[10px] text-bone-400">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
