import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';
import { TOPIC_COLORS, TOPIC_LABELS } from '@radar-quest/shared';
import { CloudItem } from './CloudItem';

const CLUSTER_NAME: Record<string, string> = {
  AI: 'AI 簇',
  'one-person': '一人公司 簇',
  'self-mgmt': '自我管理 簇',
  __unmapped__: '未分类'
};

const CLUSTER_DESC: Record<string, string> = {
  AI: 'AI 应用 / 智能体 / 提效 / 编程',
  'one-person': '独立开发 / 副业 / 创作者经济',
  'self-mgmt': '自我管理 / 效率 / 习惯',
  __unmapped__: '未匹配上关键词，可手动归档'
};

export function TopicCluster({
  topic,
  items,
  statsMap,
  onItemClick
}: {
  topic: string;
  items: Item[];
  statsMap: Record<string, { actions: ActionType[]; totalXp: number }>;
  onItemClick: (id: string) => void;
}) {
  const color = topic === '__unmapped__' ? 'var(--bone-400)' : TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS];

  return (
    <section>
      <header className="mb-3 flex items-baseline gap-3">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        <h2 className="font-display text-lg text-bone-50">
          {CLUSTER_NAME[topic] ?? topic}
        </h2>
        <span className="num text-[10px] uppercase tracking-widest text-bone-400">
          {items.length}
        </span>
        <span className="hidden text-xs text-bone-400 sm:inline">· {CLUSTER_DESC[topic]}</span>
      </header>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <CloudItem
            key={item.id}
            item={item}
            stats={statsMap[item.id] ?? { actions: [], totalXp: 0 }}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
