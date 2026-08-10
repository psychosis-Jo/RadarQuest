'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INTENSITY_LEVELS = [
  { value: 0, name: 'Pure Data', desc: '关掉游戏化 · 纯数据' },
  { value: 1, name: 'Stealth',   desc: '后台算 XP · 不显示' },
  { value: 2, name: 'Standard',  desc: '任务卡 + 进度条（推荐）' },
  { value: 3, name: 'Full',      desc: '5 任务 + 动效 + 音效' },
  { value: 4, name: 'Hardcore',  desc: '全力冲刺 · 无宽限' }
];

export function SettingsForm({ initial }: { initial: any }) {
  const router = useRouter();
  const [intensity, setIntensity] = useState(initial?.intensity_level ?? 2);
  const [soundMode, setSoundMode] = useState(initial?.sound_mode ?? 'publish');
  const [animationMode, setAnimationMode] = useState(initial?.animation_mode ?? 'standard');
  const [dailyCount, setDailyCount] = useState(initial?.daily_quest_count ?? 3);
  const [keywords, setKeywords] = useState<Record<string, string[]>>(() => {
    const k = initial?.keywords ?? {};
    // 数据库里的 keywords 是嵌套结构 { AI: { keywords_zh, keywords_en, ... }, ... }
    // 编辑器要扁平数组
    return {
      AI: k.AI ? [...(k.AI.keywords_zh ?? []), ...(k.AI.keywords_en ?? [])] : [],
      'one-person': k['one-person'] ? [...(k['one-person'].keywords_zh ?? []), ...(k['one-person'].keywords_en ?? [])] : [],
      'self-mgmt': k['self-mgmt'] ? [...(k['self-mgmt'].keywords_zh ?? []), ...(k['self-mgmt'].keywords_en ?? [])] : []
    };
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    // 把扁平关键词数组转回嵌套结构（保留 keywords_zh 优先，中文优先）
    const nested = {
      AI: {
        keywords_zh: keywords.AI.filter(k => /[\u4e00-\u9fa5]/.test(k)),
        keywords_en: keywords.AI.filter(k => !/[\u4e00-\u9fa5]/.test(k)),
        color: '#5FE0C7', weight: 1.0,
        label_zh: 'AI 应用', label_en: 'AI Applied'
      },
      'one-person': {
        keywords_zh: keywords['one-person'].filter(k => /[\u4e00-\u9fa5]/.test(k)),
        keywords_en: keywords['one-person'].filter(k => !/[\u4e00-\u9fa5]/.test(k)),
        color: '#E8B86F', weight: 1.0,
        label_zh: '一人公司', label_en: 'One-Person Business'
      },
      'self-mgmt': {
        keywords_zh: keywords['self-mgmt'].filter(k => /[\u4e00-\u9fa5]/.test(k)),
        keywords_en: keywords['self-mgmt'].filter(k => !/[\u4e00-\u9fa5]/.test(k)),
        color: '#B8A4D4', weight: 1.0,
        label_zh: '自我管理', label_en: 'Self-Management'
      }
    };
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intensity_level: intensity,
          sound_mode: soundMode,
          animation_mode: animationMode,
          daily_quest_count: dailyCount,
          keywords: nested
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.refresh(), 500);
      } else {
        alert('保存失败：' + (await res.text()));
      }
    } catch (err) {
      alert('网络错误：' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 强度档位 */}
      <section className="hand-drawn-border rounded bg-ink-800/60 p-6">
        <h2 className="font-display text-xl text-bone-50">游戏化强度</h2>
        <p className="mt-1 text-sm text-bone-400">0 = 完全关闭，4 = 全力冲刺</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {INTENSITY_LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setIntensity(l.value)}
              className={`rounded border p-3 text-left transition-all
                ${intensity === l.value
                  ? 'border-gold bg-gold/10 shadow-glow'
                  : 'border-ink-700 bg-ink-900 hover:border-ink-600'}`}
            >
              <div className="num text-[10px] uppercase tracking-widest text-bone-400">Lv {l.value}</div>
              <div className="font-display text-sm text-bone-50">{l.name}</div>
              <div className="mt-1 text-[10px] text-bone-400">{l.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 独立开关 */}
      <section className="hand-drawn-border rounded bg-ink-800/60 p-6">
        <h2 className="font-display text-xl text-bone-50">独立开关</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="音效" value={soundMode} options={['off', 'action', 'publish', 'all']} onChange={setSoundMode} />
          <Field label="动效" value={animationMode} options={['off', 'subtle', 'standard', 'rich']} onChange={setAnimationMode} />
          <Field label="每日任务数" value={String(dailyCount)} options={['0', '3', '5']} onChange={(v: string) => setDailyCount(parseInt(v))} />
        </div>
      </section>

      {/* 关键词 */}
      <section className="hand-drawn-border rounded bg-ink-800/60 p-6">
        <h2 className="font-display text-xl text-bone-50">关键词</h2>
        <p className="mt-1 text-sm text-bone-400">命中关键词的 item 会归到对应主题</p>
        <div className="mt-4 space-y-4">
          {(['AI', 'one-person', 'self-mgmt'] as const).map(t => (
            <KeywordEditor
              key={t}
              label={t === 'AI' ? 'AI 应用' : t === 'one-person' ? '一人公司' : '自我管理'}
              color={t === 'AI' ? '#5FE0C7' : t === 'one-person' ? '#E8B86F' : '#B8A4D4'}
              value={keywords[t]}
              onChange={(v: string[]) => setKeywords({ ...keywords, [t]: v })}
            />
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-celestial">✓ 已保存</span>}
        <button
          onClick={save}
          disabled={saving}
          className="rounded border border-gold bg-gold/10 px-6 py-2 font-display text-bone-50 hover:bg-gold/20 disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存设置'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="num text-[10px] uppercase tracking-widest text-bone-400">{label}</label>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map((o: string) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded border px-3 py-1 text-xs transition-all
              ${value === o ? 'border-celestial bg-celestial/10 text-celestial' : 'border-ink-700 text-bone-200 hover:border-ink-600'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function KeywordEditor({ label, color, value, onChange }: { label: string; color: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  function add() {
    if (!input.trim()) return;
    onChange([...value, input.trim()]);
    setInput('');
  }
  function remove(k: string) {
    onChange(value.filter(x => x !== k));
  }
  return (
    <div>
      <p className="text-sm" style={{ color }}>{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {value.map(k => (
          <span key={k} className="flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs text-bone-200">
            {k}
            <button onClick={() => remove(k)} className="text-bone-400 hover:text-warning">×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="加关键词，回车确认"
          className="flex-1 rounded border border-ink-700 bg-ink-900 px-2 py-1 text-xs text-bone-50 focus:border-gold/50 focus:outline-none"
        />
        <button onClick={add} className="rounded border border-ink-700 px-3 py-1 text-xs text-bone-200 hover:border-gold/50">+</button>
      </div>
    </div>
  );
}
