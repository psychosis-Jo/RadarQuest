import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';

const SOURCE_LABEL: Record<string, string> = {
  github: 'GitHub', ph: 'Product Hunt', hn: 'Hacker News',
  reddit: 'Reddit', wechat: '公众号', newsletter: 'Newsletter'
};

const ACTION_ORDER: ActionType[] = ['watch', 'save', 'note', 'build', 'publish'];

export function CloudItem({
  item,
  stats,
  onClick
}: {
  item: Item;
  stats: { actions: ActionType[]; totalXp: number };
  onClick: () => void;
}) {
  const isUnmapped = item.topics.length === 0;
  const src = SOURCE_LABEL[item.source] ?? item.source;
  const actionCount = stats.actions.length;
  const hasAll = actionCount >= 5;
  const stars = (item.metrics as any)?.stars;
  const score = (item.metrics as any)?.score;
  const metric = stars ? `★ ${Number(stars).toLocaleString()}` : score ? `▲ ${score}` : '';

  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded border p-3 text-left transition-colors ${
        isUnmapped
          ? 'border-ink-700/50 bg-ink-800/30 opacity-60 hover:opacity-100'
          : hasAll
            ? 'border-gold/40 bg-gold/5 hover:bg-gold/10'
            : 'border-ink-700 bg-ink-800/40 hover:border-ink-600 hover:bg-ink-800/70'
      }`}
    >
      {/* Meta: source + metric + XP */}
      <div className="num flex items-center justify-between text-[10px] uppercase tracking-widest text-bone-400">
        <span>{src}</span>
        <div className="flex items-center gap-2">
          {metric && <span className="text-bone-200">{metric}</span>}
          {actionCount > 0 && <span className="text-gold">+{stats.totalXp}</span>}
        </div>
      </div>

      {/* Title */}
      <p className="mt-1.5 line-clamp-2 font-display text-sm leading-snug text-bone-50 group-hover:text-gold">
        {item.title}
      </p>

      {/* 5 个 action 进度条 */}
      <div className="mt-2.5 flex items-center gap-1">
        {ACTION_ORDER.map(a => {
          const done = stats.actions.includes(a);
          const isPublish = a === 'publish';
          return (
            <span
              key={a}
              className={`h-1 flex-1 rounded-full ${
                done
                  ? isPublish
                    ? 'bg-gold'
                    : 'bg-celestial'
                  : 'bg-ink-700'
              }`}
              title={a}
            />
          );
        })}
      </div>
    </button>
  );
}
