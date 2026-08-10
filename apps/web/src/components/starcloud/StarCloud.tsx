'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Item } from '@/lib/data/types';
import type { ActionType } from '@radar-quest/shared';
import { TOPIC_COLORS, TOPIC_LABELS } from '@radar-quest/shared';
import { TopicCluster } from './TopicCluster';
import { ItemDrawer } from './ItemDrawer';

type Stats = { actions: ActionType[]; totalXp: number };
type ClusterKey = 'AI' | 'one-person' | 'self-mgmt' | '__unmapped__';

const CLUSTER_ORDER: ClusterKey[] = ['AI', 'one-person', 'self-mgmt', '__unmapped__'];

export function StarCloud({
  items,
  statsMap
}: {
  items: Item[];
  statsMap: Record<string, Stats>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topicFilter, setTopicFilter] = useState<ClusterKey | null>(null);

  // 按 lead topic 分组
  const clusters = useMemo(() => {
    const byTopic: Record<ClusterKey, Item[]> = {
      'AI': [], 'one-person': [], 'self-mgmt': [], '__unmapped__': []
    };
    for (const item of items) {
      const lead = item.topics[0];
      const key: ClusterKey = (lead && (lead in byTopic)) ? (lead as ClusterKey) : '__unmapped__';
      byTopic[key].push(item);
    }
    return byTopic;
  }, [items]);

  // 当前选中的 item（从 URL ?i= 读）
  const selectedId = searchParams.get('i');
  const selectedItem = useMemo(
    () => (selectedId ? items.find(i => i.id === selectedId) ?? null : null),
    [selectedId, items]
  );

  function openItem(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('i', id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }
  function closeItem() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('i');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }

  // 标签 chips 显示哪些簇
  const visibleClusters = topicFilter
    ? ([topicFilter] as ClusterKey[])
    : CLUSTER_ORDER;

  return (
    <>
      {/* Topic filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          active={!topicFilter}
          onClick={() => setTopicFilter(null)}
          color="var(--bone-200)"
          label="全部"
          count={items.length}
        />
        {CLUSTER_ORDER.filter(t => t !== '__unmapped__').map(t => {
          const count = (clusters[t] ?? []).length;
          if (count === 0) return null;
          return (
            <FilterChip
              key={t}
              active={topicFilter === t}
              onClick={() => setTopicFilter(topicFilter === t ? null : t)}
              color={TOPIC_COLORS[t]}
              label={TOPIC_LABELS[t].zh}
              count={count}
            />
          );
        })}
        {clusters.__unmapped__.length > 0 && (
          <FilterChip
            active={topicFilter === '__unmapped__'}
            onClick={() => setTopicFilter(topicFilter === '__unmapped__' ? null : '__unmapped__')}
            color="var(--bone-400)"
            label="未分类"
            count={clusters.__unmapped__.length}
          />
        )}
      </div>

      {/* 簇 */}
      <div className="space-y-8">
        {visibleClusters.map(t => {
          const list = clusters[t] ?? [];
          if (list.length === 0) return null;
          return (
            <TopicCluster
              key={t}
              topic={t}
              items={list}
              statsMap={statsMap}
              onItemClick={openItem}
            />
          );
        })}
      </div>

      {/* Drawer */}
      {selectedItem && (
        <ItemDrawer
          item={selectedItem}
          done={statsMap[selectedItem.id]?.actions ?? []}
          onClose={closeItem}
        />
      )}
    </>
  );
}

function FilterChip({
  active, onClick, color, label, count
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors ${
        active
          ? 'border-current'
          : 'border-ink-700 text-bone-200 hover:border-ink-600'
      }`}
      style={active ? { color } : undefined}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
      <span className="num text-[10px] opacity-60">{count}</span>
    </button>
  );
}
