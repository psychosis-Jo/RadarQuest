'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACTION_LABELS } from '@starcatcher/shared';

interface Item {
  id: string;
  title: string;
  source: string;
  topics: string[];
  summary: string;
  url: string;
  metrics: Record<string, number>;
}

interface Quest {
  id: number;
  quest_type: string;
  title: string;
  description: string;
  related_topic: string;
  related_item_id: string;
  action_type: string | null;
  status: string;
}

const TOPIC_LABELS: Record<string, { zh: string; color: string }> = {
  AI: { zh: 'AI 应用', color: '#5FE0C7' },
  'one-person': { zh: '一人公司', color: '#E8B86F' },
  'self-mgmt': { zh: '自我管理', color: '#B8A4D4' }
};

const ACTION_HINT: Record<string, { zh: string; icon: string; xp: number }> = {
  watch: { zh: '扫一眼', icon: ACTION_LABELS.watch.icon,   xp: 5 },
  save:  { zh: '收藏',   icon: ACTION_LABELS.save.icon,    xp: 10 },
  note:  { zh: '写笔记', icon: ACTION_LABELS.note.icon,    xp: 20 },
  build: { zh: '动手做', icon: ACTION_LABELS.build.icon,   xp: 50 }
};

function pickQuests(candidates: Item[]): { items: Item[]; hints: string[] } {
  if (candidates.length === 0) return { items: [], hints: [] };
  // 按主题分组
  const byTopic: Record<string, Item[]> = { AI: [], 'one-person': [], 'self-mgmt': [] };
  const other: Item[] = [];
  for (const c of candidates) {
    if (c.topics.length > 0) {
      // 优先第一个 topic
      const t = c.topics[0];
      if (byTopic[t]) byTopic[t].push(c);
      else other.push(c);
    } else {
      other.push(c);
    }
  }
  // 从每个主题抽 1 个（如果不够用 other 补）
  const picked: Item[] = [];
  const hints = ['watch', 'save', 'build'];
  for (const t of ['AI', 'one-person', 'self-mgmt'] as const) {
    if (byTopic[t].length > 0) {
      picked.push(byTopic[t].shift()!);
    } else if (other.length > 0) {
      picked.push(other.shift()!);
    } else if (byTopic[t === 'AI' ? 'one-person' : t === 'one-person' ? 'self-mgmt' : 'AI'].length > 0) {
      picked.push(byTopic[t === 'AI' ? 'one-person' : t === 'one-person' ? 'self-mgmt' : 'AI'].shift()!);
    }
  }
  // 如果还不够 3 个，循环补
  let i = 0;
  while (picked.length < 3 && candidates.length > picked.length) {
    const candidate = candidates[(i++) % candidates.length];
    if (!picked.find(p => p.id === candidate.id)) {
      picked.push(candidate);
    }
    if (i > candidates.length * 2) break;
  }
  return { items: picked.slice(0, 3), hints };
}

export function QuestManager({ initialQuests, candidates }: { initialQuests: Quest[]; candidates: Item[] }) {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (candidates.length === 0) {
      setError('还没有 item。先跑一次 pnpm fetch 抓数据。');
      return;
    }
    setGenerating(true);
    setError(null);
    const { items, hints } = pickQuests(candidates);
    if (items.length === 0) {
      setError('生成失败：没有候选 item');
      setGenerating(false);
      return;
    }
    // 删掉今天已存在的 quest
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replaceDate: today,
          quests: items.map((it, i) => ({
            quest_type: 'daily',
            title: it.title,
            description: `${ACTION_HINT[hints[i]].zh}这条`,
            related_topic: it.topics[0] ?? '',
            related_item_id: it.id,
            action_type: hints[i]
          }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests);
        router.refresh();
      } else {
        setError('生成失败：' + (await res.text()));
      }
    } finally {
      setGenerating(false);
    }
  }

  async function complete(quest: Quest) {
    if (!confirm(`标记「${quest.title.slice(0, 30)}...」为完成？${quest.action_type ? `\n这会记录一次「${ACTION_HINT[quest.action_type]?.zh ?? quest.action_type}」并点亮 XP` : ''}`)) return;
    const res = await fetch(`/api/quests/${quest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    if (res.ok) {
      const data = await res.json();
      setQuests(quests.map(q => q.id === quest.id ? { ...q, status: 'completed' } : q));
      // 提示用户：实际记的 action 情况
      if (data.actionResult) {
        if (data.actionResult.alreadyDone) {
          alert('✓ 任务完成（这个动作之前已经记过，XP 不重复加）');
        } else if (data.actionResult.xp > 0) {
          alert(`✓ 任务完成 +${data.actionResult.xp} XP`);
        }
      }
      router.refresh();
    } else {
      alert('更新失败');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="num text-xs text-bone-400">{quests.length} 个任务</p>
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-button border border-ink-700 px-3 py-1.5 text-xs text-bone-200 hover:border-gold/50 disabled:opacity-50"
        >
          {generating ? '生成中…' : '🔄 重新生成今日任务'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-card border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
          {error}
        </div>
      )}

      {quests.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-700 bg-ink-800/30 p-12 text-center">
          <p className="font-display text-lg text-bone-50">今天还没有任务</p>
          <p className="mt-2 text-sm text-bone-400">点上面的"重新生成"按钮</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {quests.map((q, i) => {
            const item = candidates.find(c => c.id === q.related_item_id);
            const topic = TOPIC_LABELS[q.related_topic];
            const hint = q.action_type ? ACTION_HINT[q.action_type] : null;
            const isDone = q.status === 'completed';
            return (
              <div
                key={q.id}
                className={`hand-drawn-border group relative rounded-card p-5 transition-all
                  ${isDone ? 'border-celestial/50 bg-celestial/5' : 'bg-ink-800/60 hover:bg-ink-800 hover:shadow-glow'}`}
              >
                <div className="flex items-baseline justify-between">
                  <p className="num text-caption text-bone-400">
                    Quest {i + 1}
                  </p>
                  {topic && (
                    <p className="num text-[10px]" style={{ color: topic.color }}>● {topic.zh}</p>
                  )}
                </div>
                <p className={`font-display mt-2 line-clamp-2 text-base ${isDone ? 'text-bone-400 line-through' : 'text-bone-50 group-hover:text-gold'}`}>
                  {q.title}
                </p>
                <p className="mt-2 text-xs text-bone-400">{q.description}</p>
                {hint && (
                  <p className="num mt-2 flex items-center gap-1 text-[10px] text-gold">
                    <i className={`ph-light ph-${hint.icon} text-[12px] leading-none`} aria-hidden />
                    <span>+{hint.xp} XP</span>
                  </p>
                )}
                {item && (
                  <div className="mt-3 space-y-1.5 text-[10px] text-bone-400">
                    <p>来源: {item.source}</p>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  {item && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-button border border-ink-700 px-2 py-1 text-[10px] text-bone-200 hover:border-gold/50"
                    >
                      打开 →
                    </a>
                  )}
                  {!isDone && (
                    <button
                      onClick={() => complete(q)}
                      className="rounded-button border border-celestial/50 bg-celestial/10 px-2 py-1 text-[10px] text-celestial hover:bg-celestial/20"
                    >
                      ✓ 完成
                    </button>
                  )}
                  {isDone && <span className="text-[10px] text-celestial">✓ 已完成</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
