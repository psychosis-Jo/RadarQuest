'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { applyAudioSettings, type SoundMode, type IntensityLevel } from '@/lib/audio/controller';
import { toast } from '@/components/toast/Toaster';

const INTENSITY_LEVELS: { value: IntensityLevel; name: string; desc: string }[] = [
  { value: 0, name: 'Pure Data', desc: '关掉游戏化 · 纯数据' },
  { value: 1, name: 'Stealth',   desc: '后台算 XP · 不显示' },
  { value: 2, name: 'Standard',  desc: '任务卡 + 进度条（推荐）' },
  { value: 3, name: 'Full',      desc: '5 任务 + 动效 + 音效' },
  { value: 4, name: 'Hardcore',  desc: '全力冲刺 · 无宽限' }
];

// 工具：扁平化 + 去重
const flattenKeywords = (k: any): string[] => {
  if (!k) return [];
  const arr = [...(k.keywords_zh ?? []), ...(k.keywords_en ?? [])];
  return Array.from(new Set(arr));
};

// 6 个信源在 UI 里的展示顺序 + 列表字段
// 列表字段以外的技术参数（min_score / query / sort 等）暂不暴露
type SourceListField = { key: string; label: string; placeholder: string };

const SOURCE_DEFS: {
  id: 'github' | 'producthunt' | 'hackernews' | 'reddit' | 'newsletter' | 'wechat';
  label: string;
  desc: string;
  list?: SourceListField;
}[] = [
  { id: 'github',     label: 'GitHub',       desc: 'GitHub Search API · 高 star 新仓库' },
  { id: 'producthunt',label: 'Product Hunt', desc: 'PH 今日 Top · 需 API token' },
  { id: 'hackernews', label: 'Hacker News',  desc: 'HN Top Stories · 100+ 分' },
  { id: 'reddit',     label: 'Reddit',       desc: '编程 / ML / 独立开发 / 效率 / 自我提升',
    list: { key: 'subreddits', label: 'Subreddits', placeholder: 'r/localLLM, 回车加' } },
  { id: 'newsletter', label: 'Newsletter',   desc: 'RSS 订阅 · 加 feed URL',
    list: { key: 'feeds', label: 'RSS Feeds', placeholder: 'https://example.com/feed.xml' } },
  { id: 'wechat',     label: '公众号',       desc: '通过 RSSHub 抓取 · 需自部署实例',
    list: { key: 'accounts', label: '公众号 ID', placeholder: '公众号 biz / username' } }
];

export function SettingsForm({ initial }: { initial: any }) {
  const router = useRouter();
  const [intensity, setIntensity] = useState<IntensityLevel>(initial?.intensity_level ?? 2);
  const [soundMode, setSoundMode] = useState<SoundMode>(initial?.sound_mode ?? 'publish');
  const [animationMode, setAnimationMode] = useState(initial?.animation_mode ?? 'standard');
  const [dailyCount, setDailyCount] = useState(initial?.daily_quest_count ?? 3);
  const [keywords, setKeywords] = useState<Record<string, string[]>>(() => ({
    AI: flattenKeywords(initial?.keywords?.AI),
    'one-person': flattenKeywords(initial?.keywords?.['one-person']),
    'self-mgmt': flattenKeywords(initial?.keywords?.['self-mgmt'])
  }));
  // sources：{ [id]: { enabled, config: { ...listField: [...] } } }
  const initialSources: Record<string, any> = initial?.sources ?? {};
  const [sources, setSources] = useState<Record<string, any>>(() => {
    const out: Record<string, any> = {};
    for (const def of SOURCE_DEFS) {
      const fromDb = initialSources[def.id];
      out[def.id] = {
        enabled: fromDb?.enabled ?? true,
        config: { ...(fromDb?.config ?? {}) }
      };
    }
    return out;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  // 进入页面时同步 audio 状态（处理 SSR / 多端 / 改库后）
  useEffect(() => {
    applyAudioSettings({ soundMode, intensityLevel: intensity });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    // 把扁平关键词数组转回嵌套结构（中文优先）
    const toNested = (arr: string[]) => ({
      keywords_zh: arr.filter(k => /[\u4e00-\u9fa5]/.test(k)),
      keywords_en: arr.filter(k => !/[\u4e00-\u9fa5]/.test(k))
    });
    const nested = {
      AI:           { ...toNested(keywords.AI),           color: '#5FE0C7', weight: 1.0, label_zh: 'AI 应用',  label_en: 'AI Applied' },
      'one-person': { ...toNested(keywords['one-person']), color: '#E8B86F', weight: 1.0, label_zh: '一人公司', label_en: 'One-Person Business' },
      'self-mgmt':  { ...toNested(keywords['self-mgmt']),  color: '#B8A4D4', weight: 1.0, label_zh: '自我管理', label_en: 'Self-Management' }
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
          keywords: nested,
          sources
        })
      });
      if (res.ok) {
        setSaved(true);
        // 同步音频设置（mute + intensity）
        applyAudioSettings({ soundMode, intensityLevel: intensity });
        toast('设置已保存', { tone: 'gold' });
        setTimeout(() => router.refresh(), 500);
      } else {
        toast('保存失败：' + (await res.text()), { tone: 'warning' });
      }
    } catch (err) {
      toast('网络错误：' + (err as Error).message, { tone: 'warning' });
    } finally {
      setSaving(false);
    }
  }

  async function resetSources() {
    if (!confirm('恢复默认信源配置？\n你自定义的 enable 开关和列表（subreddits / feeds / accounts）会被清空，其他设置不动。')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/settings/reset-sources', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const next: Record<string, any> = {};
        for (const def of SOURCE_DEFS) {
          const fromServer = data.sources?.[def.id];
          next[def.id] = {
            enabled: fromServer?.enabled ?? true,
            config: { ...(fromServer?.config ?? {}) }
          };
        }
        setSources(next);
        setSaved(true);
        setTimeout(() => router.refresh(), 500);
      } else {
        toast('重置失败：' + (await res.text()), { tone: 'warning' });
      }
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 强度档位 */}
      <section className="hand-drawn-border rounded-card bg-ink-800/60 p-6">
        <h2 className="font-display text-xl text-bone-50">游戏化强度</h2>
        <p className="mt-1 text-sm text-bone-400">0 = 完全关闭，4 = 全力冲刺</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {INTENSITY_LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => setIntensity(l.value)}
              className={`rounded-button border p-3 text-left transition-all
                ${intensity === l.value
                  ? 'border-gold bg-gold/10 shadow-glow'
                  : 'border-ink-700 bg-ink-900 hover:border-ink-600'}`}
            >
              <div className="num text-caption text-bone-400">Lv {l.value}</div>
              <div className="font-display text-sm text-bone-50">{l.name}</div>
              <div className="mt-1 text-[10px] text-bone-400">{l.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 独立开关 */}
      <section className="hand-drawn-border rounded-card bg-ink-800/60 p-6">
        <h2 className="font-display text-xl text-bone-50">独立开关</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="音效" value={soundMode} options={['off', 'action', 'publish', 'all']} onChange={setSoundMode} />
          <Field label="动效" value={animationMode} options={['off', 'subtle', 'standard', 'rich']} onChange={setAnimationMode} />
          <Field label="每日任务数" value={String(dailyCount)} options={['0', '3', '5']} onChange={(v: string) => setDailyCount(parseInt(v))} />
        </div>
      </section>

      {/* 关键词 */}
      <section className="hand-drawn-border rounded-card bg-ink-800/60 p-6">
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

      {/* 信源 */}
      <section className="hand-drawn-border rounded-card bg-ink-800/60 p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-xl text-bone-50">信源</h2>
            <p className="mt-1 text-sm text-bone-400">
              启用哪些平台抓取数据 · 列表类源可加账号/feed
            </p>
          </div>
          <button
            onClick={resetSources}
            disabled={resetting}
            className="rounded-button border border-ink-700 px-3 py-1.5 text-xs text-bone-300 hover:border-warning hover:text-warning disabled:opacity-50"
          >
            {resetting ? '重置中…' : '恢复默认'}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {SOURCE_DEFS.map(def => (
            <SourceRow
              key={def.id}
              def={def}
              state={sources[def.id]}
              onChange={(s) => setSources({ ...sources, [def.id]: s })}
            />
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-celestial">✓ 已保存</span>}
        <button
          onClick={save}
          disabled={saving}
          className="rounded-button border border-gold bg-gold/10 px-6 py-2 font-display text-bone-50 hover:bg-gold/20 disabled:opacity-50"
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
      <label className="num text-caption text-bone-400">{label}</label>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map((o: string) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-button border px-3 py-1 text-xs transition-all
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
    const trimmed = input.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
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
        <button onClick={add} className="rounded-button border border-ink-700 px-3 py-1 text-xs text-bone-200 hover:border-gold/50">+</button>
      </div>
    </div>
  );
}

function SourceRow({ def, state, onChange }: { def: any; state: any; onChange: (s: any) => void }) {
  const enabled = state?.enabled ?? true;
  const list: string[] = state?.config?.[def.list?.key ?? ''] ?? [];
  return (
    <div className={`rounded-card border p-4 transition-opacity ${enabled ? 'border-ink-700 bg-ink-900/40' : 'border-ink-800 bg-ink-900/20 opacity-60'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display text-base text-bone-50">{def.label}</p>
            {!enabled && <span className="num text-caption text-bone-400">已禁用</span>}
          </div>
          <p className="mt-0.5 text-xs text-bone-400">{def.desc}</p>
        </div>
        <button
          onClick={() => onChange({ ...state, enabled: !enabled })}
          className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors
            ${enabled ? 'border-celestial/60 bg-celestial/30' : 'border-ink-700 bg-ink-800'}`}
          title={enabled ? '已启用 · 点此禁用' : '已禁用 · 点此启用'}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full transition-all
              ${enabled ? 'left-5 bg-celestial' : 'left-0.5 bg-bone-400'}`}
          />
        </button>
      </div>
      {def.list && enabled && (
        <div className="mt-3 border-t border-ink-700 pt-3">
          <label className="num text-caption text-bone-400">
            {def.list.label}
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {list.map((item: string) => (
              <span key={item} className="flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs text-bone-200">
                {item}
                <button
                  onClick={() => onChange({
                    ...state,
                    config: { ...state.config, [def.list.key]: list.filter(x => x !== item) }
                  })}
                  className="text-bone-400 hover:text-warning"
                >×</button>
              </span>
            ))}
          </div>
          <SourceListInput
            placeholder={def.list.placeholder}
            onAdd={(v) => {
              const trimmed = v.trim();
              if (!trimmed) return;
              if (list.includes(trimmed)) return;
              onChange({
                ...state,
                config: { ...state.config, [def.list.key]: [...list, trimmed] }
              });
            }}
          />
        </div>
      )}
    </div>
  );
}

function SourceListInput({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [input, setInput] = useState('');
  function add() {
    if (!input.trim()) return;
    onAdd(input);
    setInput('');
  }
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && add()}
        placeholder={placeholder}
        className="flex-1 rounded border border-ink-700 bg-ink-900 px-2 py-1 text-xs text-bone-50 focus:border-gold/50 focus:outline-none"
      />
      <button
        onClick={add}
        className="rounded-button border border-ink-700 px-3 py-1 text-xs text-bone-200 hover:border-gold/50"
      >+</button>
    </div>
  );
}
