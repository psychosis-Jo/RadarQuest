import type { Item } from '@/lib/data/types';
import { TOPIC_COLORS, TOPIC_LABELS } from '@radar-quest/shared';
import { ActionBar } from './ActionBar';
import { StarIcon } from '../hand-drawn/Divider';

const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
  github:     { label: 'GitHub',     color: 'text-bone-200' },
  ph:         { label: 'ProductHunt', color: 'text-flame' },
  hn:         { label: 'Hacker News', color: 'text-flame' },
  reddit:     { label: 'Reddit',     color: 'text-flame' },
  wechat:     { label: '公众号',     color: 'text-celestial' },
  newsletter: { label: 'Newsletter', color: 'text-amber' }
};

const TOPIC_LABELS_ZH = {
  AI: 'AI 应用',
  'one-person': '一人公司',
  'self-mgmt': '自我管理'
};

export function ItemCard({ item, actions }: { item: Item; actions: { type: string; count: number }[] }) {
  const src = SOURCE_LABEL[item.source] ?? { label: item.source, color: 'text-bone-200' };
  const stars = (item.metrics as any)?.stars;
  const score = (item.metrics as any)?.score;
  const comments = (item.metrics as any)?.comments;
  const metric = stars ? `★ ${stars.toLocaleString()}` : score ? `▲ ${score}` : '';
  const doneTypes = actions.map(a => a.type);

  return (
    <article className="hand-drawn-border group rounded bg-ink-800/60 p-5 transition-all hover:bg-ink-800 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="font-display text-lg leading-snug text-bone-50 hover:text-gold"
          >
            {item.title}
          </a>
          {item.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-bone-200">
              {item.summary}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className={`num text-xs ${src.color}`}>{src.label}</p>
          {metric && <p className="num mt-1 text-xs text-bone-400">{metric}</p>}
          {comments ? <p className="num text-[10px] text-bone-400">💬 {comments}</p> : null}
        </div>
      </div>

      {/* 主题标签 */}
      {item.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.topics.map(t => (
            <span
              key={t}
              className="num rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                borderColor: TOPIC_COLORS[t as keyof typeof TOPIC_COLORS] + '60',
                color: TOPIC_COLORS[t as keyof typeof TOPIC_COLORS]
              }}
            >
              {TOPIC_LABELS_ZH[t as keyof typeof TOPIC_LABELS_ZH] ?? t}
            </span>
          ))}
          {item.matched_keywords.slice(0, 3).map(kw => (
            <span key={kw} className="num rounded bg-ink-700 px-2 py-0.5 text-[10px] text-bone-400">
              {kw}
            </span>
          ))}
        </div>
      )}

      <ActionBar itemId={item.id} done={doneTypes} />
    </article>
  );
}
