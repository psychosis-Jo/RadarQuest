'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TOPIC_COLORS, TOPIC_LABELS } from '@starcatcher/shared';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@starcatcher/shared';
import { ActionBar } from '@/components/item/ActionBar';

type TriageAction = 'keep' | 'save' | 'dismiss';

const SOURCE_LABEL: Record<string, string> = {
  github: 'GitHub',
  ph: 'Product Hunt',
  hn: 'Hacker News',
  reddit: 'Reddit',
  wechat: '公众号',
  newsletter: 'Newsletter'
};

const TRIAGE: { action: TriageAction; icon: string; label: string; tone: 'gold' | 'mist' | 'warning' }[] = [
  { action: 'keep',    icon: 'check',          label: '保留', tone: 'gold' },
  { action: 'save',    icon: 'star',           label: '收藏', tone: 'mist' },
  { action: 'dismiss', icon: 'x',              label: '忽略', tone: 'warning' }
];

const TONE_CLASS: Record<'gold' | 'mist' | 'warning', string> = {
  gold:    'text-gold border-gold/30 hover:bg-gold/10',
  mist:    'text-mist border-mist/30 hover:bg-mist/10',
  warning: 'text-warning border-warning/30 hover:bg-warning/10'
};

type Props = {
  initialUnprocessed: Item[];
  initialKept: Item[];
  initialActions: Record<string, ActionType[]>;
};

export function CaptureView({ initialUnprocessed, initialKept, initialActions }: Props) {
  const router = useRouter();
  const [unprocessed, setUnprocessed] = useState(initialUnprocessed);
  const [kept, setKept] = useState(initialKept);
  const [actions, setActions] = useState(initialActions);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const groups = useMemo(() => {
    const byTopic: Record<string, Item[]> = {
      AI: [],
      'one-person': [],
      'self-mgmt': [],
      __uncategorized__: []
    };
    for (const it of unprocessed) {
      const lead = it.topics[0];
      if (lead && byTopic[lead]) byTopic[lead].push(it);
      else byTopic['__uncategorized__'].push(it);
    }
    return [
      { key: 'AI', items: byTopic['AI'] },
      { key: 'one-person', items: byTopic['one-person'] },
      { key: 'self-mgmt', items: byTopic['self-mgmt'] },
      { key: '__uncategorized__', items: byTopic['__uncategorized__'] }
    ].filter(g => g.items.length > 0);
  }, [unprocessed]);

  async function triage(item: Item, action: TriageAction) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/items/${item.id}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'triage failed' }));
        alert('操作失败：' + (err.error ?? res.statusText));
        return;
      }
      setUnprocessed(prev => prev.filter(p => p.id !== item.id));
      if (action === 'keep') {
        setKept(prev => [item, ...prev]);
        setHint('已保留 → 这条会出现在星云主页');
      } else if (action === 'save') {
        setHint('已收藏 → 这条直接出现在星云主页（带收藏角标）');
      } else {
        setHint('已忽略 → 30 天后自动清理');
      }
      setTimeout(() => setHint(null), 2200);
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-3xl text-bone-50">捕捉</h1>
        <p className="mt-2 text-sm text-bone-200">
          共 <span className="num text-bone-50">{unprocessed.length}</span> 条未处理
          {kept.length > 0 && (
            <> · 已保留 <span className="num text-bone-50">{kept.length}</span> 条</>
          )}
        </p>
        <p className="mt-2 text-caption text-bone-400">
          按主题分组。看完一条，留下 / 收藏 / 忽略。
        </p>
      </header>

      {hint && (
        <div className="num fixed right-4 top-20 z-50 rounded-button border border-gold bg-ink-800 px-3 py-2 text-xs text-gold shadow-xl">
          {hint}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-700 bg-ink-800/30 p-16 text-center">
          <p className="font-display text-lg text-bone-50">暂未抓到新的信息</p>
          <p className="mt-2 text-sm text-bone-400">
            跑一次 <code className="num">pnpm fetch</code> 看看，或者回 <Link href="/" className="text-gold hover:underline">星云</Link>。
          </p>
        </div>
      ) : (
        groups.map(g => {
          const isUncat = g.key === '__uncategorized__';
          const color = isUncat ? '#A8B0C8' : (TOPIC_COLORS as Record<string, string>)[g.key];
          const label = isUncat ? '未分类' : (TOPIC_LABELS as any)[g.key]?.zh ?? g.key;
          return (
            <section key={g.key}>
              <div className="mb-4 flex items-baseline justify-between border-b border-ink-700 pb-2">
                <h2 className="font-display text-xl" style={{ color }}>
                  {label}
                </h2>
                <span className="num text-caption text-bone-400">
                  {g.items.length} 条
                </span>
              </div>
              <div className="space-y-3">
                {g.items.map(it => (
                  <CaptureCard
                    key={it.id}
                    item={it}
                    done={actions[it.id] ?? []}
                    busy={busyId === it.id || pending}
                    onTriage={a => triage(it, a)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      {kept.length > 0 && (
        <section className="border-t border-ink-700 pt-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg text-bone-50">已保留</h2>
            <span className="num text-caption text-bone-400">{kept.length} 条</span>
          </div>
          <p className="mb-4 text-caption text-bone-400">
            留在捕捉里等你再决定。⭐ 收藏后会直接进星云主页。
          </p>
          <div className="space-y-3">
            {kept.map(it => (
              <CaptureCard
                key={it.id}
                item={it}
                done={actions[it.id] ?? []}
                busy={busyId === it.id || pending}
                onTriage={a => triage(it, a)}
                isKept
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CaptureCard({
  item,
  done,
  busy,
  onTriage,
  isKept = false
}: {
  item: Item;
  done: ActionType[];
  busy: boolean;
  onTriage: (a: TriageAction) => void;
  isKept?: boolean;
}) {
  const src = SOURCE_LABEL[item.source] ?? item.source;
  const stars = (item.metrics as any)?.stars;
  const score = (item.metrics as any)?.score;
  const comments = (item.metrics as any)?.comments;
  const metric = stars ? `★ ${stars.toLocaleString()}` : score ? `▲ ${score}` : '';
  const leadTopic = item.topics[0];
  const leadColor = leadTopic ? (TOPIC_COLORS as Record<string, string>)[leadTopic] : null;

  return (
    <article className="hand-drawn-border group relative flex flex-col rounded-card bg-ink-800/40 p-5 transition-colors hover:bg-ink-800/70 sm:p-6">
      {leadColor && (
        <span
          aria-hidden
          className="absolute left-0 top-5 bottom-5 w-px sm:top-6 sm:bottom-6"
          style={{ background: leadColor, opacity: 0.4 }}
        />
      )}

      {/* Meta 行：来源 + 指标 + Triage 三动作（右上角，节省横向空间） */}
      <div className="flex items-start justify-between gap-3">
        <div className="num flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-bone-400">
          <span>{src}</span>
          {metric && <span className="text-bone-200">{metric}</span>}
          {comments ? <span>💬 {comments}</span> : null}
          {isKept && <span className="text-gold">· 已保留</span>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {TRIAGE.map(t => (
            <button
              key={t.action}
              onClick={() => onTriage(t.action)}
              disabled={busy}
              title={t.label}
              aria-label={t.label}
              className={`flex h-7 w-7 items-center justify-center rounded-button border transition-colors disabled:opacity-50 ${TONE_CLASS[t.tone]}`}
            >
              <i className={`ph-light ph-${t.icon} text-[15px] leading-none`} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {/* 标题 */}
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block font-display text-heading-sm leading-snug text-bone-50 transition-colors hover:text-gold"
      >
        {item.title}
      </a>

      {/* 摘要 */}
      {item.summary && (
        <p className="mt-2 line-clamp-2 text-body leading-relaxed text-bone-200">
          {item.summary}
        </p>
      )}

      {/* Topic 标签 + 关键词 */}
      {item.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {item.topics.map(t => {
            const color = (TOPIC_COLORS as Record<string, string>)[t];
            return (
              <span
                key={t}
                className="rounded border px-2 py-0.5 text-caption"
                style={{
                  borderColor: color ? color + '50' : 'var(--ink-700)',
                  color: color ?? 'var(--bone-200)'
                }}
              >
                {(TOPIC_LABELS as any)[t]?.zh ?? t}
              </span>
            );
          })}
          {item.matched_keywords.slice(0, 3).map(kw => (
            <span key={kw} className="rounded bg-ink-700/60 px-2 py-0.5 text-[10px] text-bone-400">
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* 5 动作 */}
      <div className="mt-4">
        <ActionBar itemId={item.id} done={done} />
      </div>
    </article>
  );
}
