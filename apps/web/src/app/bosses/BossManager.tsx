'use client';
import { useState } from 'react';
import { BossForm } from '@/components/boss/BossForm';

interface Boss {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline?: string;
  topic?: 'AI' | 'one-person' | 'self-mgmt' | '';
  status: 'active' | 'completed' | 'abandoned';
  const_id?: string;
  const_tier?: 1 | 2 | 3;
  created_at: string;
  completed_at?: string;
}

const TOPIC_COLORS: Record<string, string> = {
  AI: '#5FE0C7',
  'one-person': '#E8B86F',
  'self-mgmt': '#B8A4D4',
  '': '#A8B0C8'
};

export function BossManager({
  active,
  completed,
  abandoned,
  usedConstellationIds = []
}: {
  active: Boss[];
  completed: Boss[];
  abandoned: Boss[];
  usedConstellationIds?: string[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Boss | null>(null);

  return (
    <>
      {/* 活跃 */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg text-flame">活跃 ({active.length})</h2>
          {!creating && !editing && (
            <button
              onClick={() => setCreating(true)}
              className="rounded border border-gold bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold/20"
            >
              + 新建 Boss
            </button>
          )}
        </div>

        {creating && <div className="mb-4"><BossForm usedConstellationIds={usedConstellationIds} onClose={() => setCreating(false)} /></div>}

        <div className="space-y-3">
          {active.map(b => {
            const pct = Math.min(100, (b.current / b.target) * 100);
            const topicColor = TOPIC_COLORS[b.topic ?? ''] ?? '#A8B0C8';
            return (
              <div key={b.id} className="hand-drawn-border rounded bg-ink-800/60 p-5">
                {editing?.id === b.id ? (
                  <BossForm existing={b} usedConstellationIds={usedConstellationIds} onClose={() => setEditing(null)} />
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg text-bone-50">{b.name}</h3>
                        {b.description && <p className="mt-1 text-xs text-bone-200">{b.description}</p>}
                      </div>
                      <div className="text-right">
                        <span className="num text-flame">{b.current} / {b.target}</span>
                        <p className="num mt-0.5 text-[10px] text-bone-400">{pct.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-700">
                      <div className="h-full rounded-full bg-flame transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-3 text-bone-400">
                        {b.topic && <span style={{ color: topicColor }}>● {b.topic}</span>}
                        {b.deadline && <span className="num">截止 {b.deadline}</span>}
                      </div>
                      <button
                        onClick={() => setEditing(b)}
                        className="text-bone-400 hover:text-bone-50"
                      >
                        编辑
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {active.length === 0 && !creating && (
            <div className="rounded border border-dashed border-ink-700 bg-ink-800/30 p-8 text-center">
              <p className="text-sm text-bone-400">还没有活跃的 Boss</p>
              <button
                onClick={() => setCreating(true)}
                className="mt-3 text-xs text-gold hover:underline"
              >
                创建你的第一个 →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 已完成 */}
      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display mb-3 text-lg text-celestial">已完成 ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map(b => (
              <div key={b.id} className="rounded border border-celestial/30 bg-celestial/5 p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-bone-50">{b.name}</p>
                  <span className="num text-xs text-celestial">✓ {b.current}/{b.target}</span>
                </div>
                <p className="num mt-1 text-[10px] text-celestial">
                  {b.completed_at?.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 已放弃 */}
      {abandoned.length > 0 && (
        <section>
          <h2 className="font-display mb-3 text-lg text-bone-400">已放弃 ({abandoned.length})</h2>
          <div className="space-y-2">
            {abandoned.map(b => (
              <div key={b.id} className="rounded border border-ink-700 bg-ink-800/30 p-3">
                <p className="text-sm text-bone-400 line-through">{b.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
