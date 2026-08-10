import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';
import { TOPIC_COLORS } from '@radar-quest/shared';
import { ActionBar } from './ActionBar';

const SOURCE_LABEL: Record<string, { label: string }> = {
  github:     { label: 'GitHub' },
  ph:         { label: 'Product Hunt' },
  hn:         { label: 'Hacker News' },
  reddit:     { label: 'Reddit' },
  wechat:     { label: '公众号' },
  newsletter: { label: 'Newsletter' }
};

const TOPIC_LABELS_ZH: Record<string, string> = {
  AI: 'AI 应用',
  'one-person': '一人公司',
  'self-mgmt': '自我管理'
};

export function ItemCard({ item, done }: { item: Item; done: ActionType[] }) {
  const src = SOURCE_LABEL[item.source] ?? { label: item.source };
  const stars = (item.metrics as any)?.stars;
  const score = (item.metrics as any)?.score;
  const comments = (item.metrics as any)?.comments;
  const metric = stars ? `★ ${stars.toLocaleString()}` : score ? `▲ ${score}` : '';

  // 找到第一个 topic（用于左边一条极淡的指示条）
  const leadTopic = item.topics[0];
  const leadColor = leadTopic ? (TOPIC_COLORS as Record<string, string>)[leadTopic] : null;

  return (
    <article className="hand-drawn-border group relative flex gap-4 rounded p-5 transition-colors hover:bg-ink-800/80 sm:p-6">
      {/* Topic 指示条（极细，左侧） */}
      {leadColor && (
        <span
          aria-hidden
          className="absolute left-0 top-5 bottom-5 w-px sm:top-6 sm:bottom-6"
          style={{ background: leadColor, opacity: 0.4 }}
        />
      )}

      <div className="min-w-0 flex-1">
        {/* Meta: source + metric */}
        <div className="num flex items-center gap-3 text-[10px] uppercase tracking-widest text-bone-400">
          <span>{src.label}</span>
          {metric && <span className="text-bone-200">{metric}</span>}
          {comments ? <span>💬 {comments}</span> : null}
        </div>

        {/* 标题 */}
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block font-display text-lg leading-snug text-bone-50 transition-colors hover:text-gold sm:text-xl"
        >
          {item.title}
        </a>

        {/* 摘要 */}
        {item.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bone-200">
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
                  className="rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                  style={{
                    borderColor: color ? color + '50' : 'var(--ink-700)',
                    color: color ?? 'var(--bone-200)'
                  }}
                >
                  {TOPIC_LABELS_ZH[t] ?? t}
                </span>
              );
            })}
            {item.matched_keywords.slice(0, 3).map(kw => (
              <span
                key={kw}
                className="rounded bg-ink-700/60 px-2 py-0.5 text-[10px] text-bone-400"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* 5 动作 */}
        <div className="mt-4">
          <ActionBar itemId={item.id} done={done} />
        </div>
      </div>
    </article>
  );
}
