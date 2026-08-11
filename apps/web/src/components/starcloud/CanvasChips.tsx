'use client';
import { TOPIC_COLORS, TOPIC_LABELS } from '@starcatcher/shared';

type Topic = 'AI' | 'one-person' | 'self-mgmt' | '__unmapped__';

interface Counts {
  all: number;
  AI: number;
  'one-person': number;
  'self-mgmt': number;
  __unmapped__: number;
}

// 用 token 不用 raw hex —— per DESIGN §15.7
const BONE_50 = '#F4E9D8'; // bone-50
const BONE_400 = '#6B7390'; // bone-400
const CHIPS: Array<{
  key: 'all' | Topic;
  label: string;
  color: string;
}> = [
  { key: 'all',         label: '全部',     color: BONE_50 },
  { key: 'AI',          label: TOPIC_LABELS.AI.zh,           color: TOPIC_COLORS.AI },
  { key: 'one-person',  label: TOPIC_LABELS['one-person'].zh,  color: TOPIC_COLORS['one-person'] },
  { key: 'self-mgmt',   label: TOPIC_LABELS['self-mgmt'].zh,   color: TOPIC_COLORS['self-mgmt'] },
  { key: '__unmapped__',label: '未分类',   color: BONE_400 }
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
