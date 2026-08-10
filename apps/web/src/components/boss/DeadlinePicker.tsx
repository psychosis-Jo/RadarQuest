'use client';
import { useState } from 'react';
import { StarIcon } from '../hand-drawn/Divider';

interface DeadlinePickerProps {
  value?: string;  // YYYY-MM-DD
  onChange: (v: string | undefined) => void;
}

const PRESETS = [
  { label: '1 个月后',  months: 1,  emoji: '☽' },
  { label: '3 个月后',  months: 3,  emoji: '☽' },
  { label: '6 个月后',  months: 6,  emoji: '☽' },
  { label: '今年底',    months: 0,  endOfYear: true, emoji: '☉' },
  { label: '明年',      months: 0,  nextYear: true, emoji: '✷' }
];

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function applyPreset(p: typeof PRESETS[number]): string {
  const now = new Date();
  if (p.endOfYear) {
    return fmt(new Date(now.getFullYear(), 11, 31));
  }
  if (p.nextYear) {
    return fmt(new Date(now.getFullYear() + 1, 11, 31));
  }
  const target = new Date(now);
  target.setMonth(target.getMonth() + p.months);
  return fmt(target);
}

function chineseDate(s: string): string {
  if (!s) return '';
  const d = new Date(s);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function daysFromNow(s: string): number {
  if (!s) return 0;
  const diff = new Date(s).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const [customOpen, setCustomOpen] = useState(value ? !PRESETS.some(p => applyPreset(p) === value) : false);
  const days = value ? daysFromNow(value) : 0;

  return (
    <div>
      <label className="num text-[10px] uppercase tracking-widest text-bone-400">
        截止日期（选填）
      </label>

      {/* 预设按钮区 */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map(p => {
          const target = applyPreset(p);
          const isActive = value === target;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => { onChange(target); setCustomOpen(false); }}
              className={`group flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-all
                ${isActive
                  ? 'border-gold bg-gold/10 text-gold shadow-glow'
                  : 'border-ink-700 bg-ink-900 text-bone-200 hover:border-gold/40 hover:bg-ink-800'}`}
            >
              <span className={isActive ? 'text-gold' : 'text-bone-400'}>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => { setCustomOpen(!customOpen); if (!customOpen) onChange(undefined); }}
          className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-all
            ${customOpen
              ? 'border-celestial bg-celestial/10 text-celestial'
              : 'border-ink-700 text-bone-200 hover:border-ink-600'}`}
        >
          <span>✎</span>
          <span>自定义</span>
        </button>
      </div>

      {/* 自定义日期输入 */}
      {customOpen && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-bone-400">☽</span>
          <input
            type="date"
            value={value ?? ''}
            onChange={e => onChange(e.target.value || undefined)}
            className="num flex-1 rounded border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-bone-50 focus:border-gold/50 focus:outline-none"
          />
        </div>
      )}

      {/* 当前选中：星图式展示 */}
      {value && (
        <div className="mt-4 rounded border border-ink-700 bg-ink-900/50 p-4">
          <div className="flex items-baseline justify-between">
            <p className="num text-[10px] uppercase tracking-widest text-bone-400">
              截止 · deadline
            </p>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[10px] text-bone-400 hover:text-warning"
            >
              清除
            </button>
          </div>

          {/* 星座连线 + 三个关键节点：今天 → 截止 → 任务完成 */}
          <div className="mt-3 flex items-center justify-between">
            <StarNode label="今天"   date={fmt(new Date())} color="bone" />
            <ConstellationLine days={days} />
            <StarNode label="截止"   date={value} color="gold" filled />
          </div>

          <p className="mt-3 font-display text-base text-bone-50">
            {chineseDate(value)}
          </p>
          <p className="num mt-1 text-[10px] text-bone-400">
            还有 {days} 天
          </p>
        </div>
      )}
    </div>
  );
}

function StarNode({ label, date, color, filled }: { label: string; date: string; color: 'bone' | 'gold'; filled?: boolean }) {
  const starColor = color === 'gold' ? '#D4A574' : '#A8B0C8';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-8 w-8">
        {/* 光晕 */}
        {filled && <div className="absolute inset-0 animate-twinkle rounded-full bg-gold/20 blur-md" />}
        <svg viewBox="0 0 12 12" className="absolute inset-0 m-auto h-6 w-6">
          <path
            d="M6 1 L7 5 L11 6 L7 7 L6 11 L5 7 L1 6 L5 5 Z"
            fill={filled ? starColor : 'none'}
            stroke={starColor}
            strokeWidth="1"
          />
        </svg>
      </div>
      <p className="num text-[10px] uppercase tracking-wider" style={{ color: starColor }}>
        {label}
      </p>
      <p className="num text-[10px] text-bone-400">{date.slice(5)}</p>
    </div>
  );
}

function ConstellationLine({ days }: { days: number }) {
  // 用天的多少决定连线长度 + 描边金光的"完成度"
  return (
    <div className="relative flex-1 px-2">
      <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none" className="text-gold/40">
        <line x1="0" y1="6" x2="100" y2="6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        {/* 几个装饰小星点 */}
        <circle cx="20" cy="6" r="0.8" fill="currentColor" />
        <circle cx="50" cy="6" r="1" fill="currentColor" />
        <circle cx="80" cy="6" r="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}
