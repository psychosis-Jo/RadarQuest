'use client';
import { useState } from 'react';

interface DeadlinePickerProps {
  value?: string;  // YYYY-MM-DD
  onChange: (v: string | undefined) => void;
}

const PRESETS = [
  { label: '1 个月后',  months: 1,  emoji: '☽' },
  { label: '3 个月后',  months: 3,  emoji: '☽' },
  { label: '6 个月后',  months: 6,  emoji: '☽' },
  { label: '今年底',    endOfYear: true, emoji: '☉' },
  { label: '明年',      nextYear: true, emoji: '✷' }
];

const MONTHS_ZH = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function applyPreset(p: typeof PRESETS[number]): string {
  const now = new Date();
  if (p.endOfYear) return fmt(new Date(now.getFullYear(), 11, 31));
  if (p.nextYear) return fmt(new Date(now.getFullYear() + 1, 11, 31));
  const target = new Date(now);
  target.setMonth(target.getMonth() + (p.months ?? 0));
  return fmt(target);
}

function chineseDate(s: string): string {
  if (!s) return '';
  const d = new Date(s);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function daysFromNow(s: string): number {
  if (!s) return 0;
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);
}

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const initial = value ? new Date(value) : new Date();
  const [pickerOpen, setPickerOpen] = useState(value ? !PRESETS.some(p => applyPreset(p) === value) : false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | undefined>(initial.getDate());

  function isPreset(s?: string): boolean {
    return !!s && PRESETS.some(p => applyPreset(p) === s);
  }

  function commit(year: number, month0: number, day: number) {
    onChange(fmt(new Date(year, month0, day)));
    setSelectedDay(day);
  }

  const days = daysFromNow(value ?? '');

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
              onClick={() => { onChange(target); setPickerOpen(false); setSelectedDay(parseInt(target.slice(8, 10))); setViewYear(parseInt(target.slice(0, 4))); setViewMonth(parseInt(target.slice(5, 7)) - 1); }}
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
          onClick={() => { setPickerOpen(!pickerOpen); if (!pickerOpen) onChange(undefined); }}
          className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-all
            ${pickerOpen
              ? 'border-celestial bg-celestial/10 text-celestial'
              : 'border-ink-700 text-bone-200 hover:border-ink-600'}`}
        >
          <span>✎</span>
          <span>自定义</span>
        </button>
      </div>

      {/* 自定义日期选择器：年 / 月 / 日 三段 */}
      {pickerOpen && (
        <div className="mt-3 rounded border border-ink-700 bg-ink-900 p-3">
          {/* 年份选择 */}
          <div className="flex items-center gap-2">
            <span className="num text-[10px] uppercase tracking-widest text-bone-400">年</span>
            <div className="flex flex-wrap gap-1">
              {[viewYear - 1, viewYear, viewYear + 1, viewYear + 2].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setViewYear(y); if (selectedDay) commit(y, viewMonth, Math.min(selectedDay, daysInMonth(y, viewMonth))); }}
                  className={`num rounded px-2.5 py-1 text-xs transition-all
                    ${viewYear === y
                      ? 'border border-gold bg-gold/15 text-gold shadow-glow'
                      : 'border border-transparent text-bone-200 hover:border-ink-700 hover:bg-ink-800'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* 月份选择 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="num text-[10px] uppercase tracking-widest text-bone-400">月</span>
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
              {MONTHS_ZH.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setViewMonth(idx); if (selectedDay) commit(viewYear, idx, Math.min(selectedDay, daysInMonth(viewYear, idx))); }}
                  className={`num rounded px-1.5 py-1 text-xs transition-all
                    ${viewMonth === idx
                      ? 'border border-gold bg-gold/15 text-gold shadow-glow'
                      : 'border border-transparent text-bone-200 hover:border-ink-700 hover:bg-ink-800'}`}
                  title={`${idx + 1} 月`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 日选择 */}
          <div className="mt-3">
            <span className="num text-[10px] uppercase tracking-widest text-bone-400">日</span>
            <div className="mt-1.5 grid grid-cols-7 gap-1">
              {WEEKDAYS_ZH.map(d => (
                <div key={d} className="num text-center text-[10px] text-bone-400">{d}</div>
              ))}
              {/* 月初偏移 */}
              {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {Array.from({ length: daysInMonth(viewYear, viewMonth) }, (_, i) => i + 1).map(day => {
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => commit(viewYear, viewMonth, day)}
                    className={`num aspect-square rounded text-xs transition-all
                      ${isSelected
                        ? 'border border-gold bg-gold/20 text-gold shadow-glow'
                        : 'border border-transparent text-bone-200 hover:border-ink-700 hover:bg-ink-800'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="mt-3 w-full rounded border border-ink-700 py-1.5 text-xs text-bone-200 hover:border-celestial/50 hover:text-celestial"
          >
            完成 · 收起
          </button>
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

          {/* 星座连线 + 三个关键节点：今天 → 截止 */}
          <div className="mt-3 flex items-center justify-between">
            <StarNode label="今天"   date={fmt(new Date()).slice(5)} color="bone" />
            <ConstellationLine />
            <StarNode label="截止"   date={value.slice(5)} color="gold" filled />
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
      <p className="num text-[10px] text-bone-400">{date}</p>
    </div>
  );
}

function ConstellationLine() {
  return (
    <div className="relative flex-1 px-2">
      <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none" className="text-gold/40">
        <line x1="0" y1="6" x2="100" y2="6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="20" cy="6" r="0.8" fill="currentColor" />
        <circle cx="50" cy="6" r="1" fill="currentColor" />
        <circle cx="80" cy="6" r="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}
