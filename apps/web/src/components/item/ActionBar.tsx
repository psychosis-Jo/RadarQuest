'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ACTION_LABELS, type ActionType, XP_VALUES } from '@starcatcher/shared';
import { playActionSound, type SoundMode } from '@/lib/audio/controller';
import { toast } from '@/components/toast/Toaster';

const ACTIONS: ActionType[] = ['watch', 'save', 'note', 'build', 'publish'];

export function ActionBar({ itemId, done, compact = false }: { itemId: string; done: string[]; compact?: boolean }) {
  const [soundMode, setSoundMode] = useState<SoundMode>(() => {
    if (typeof window === 'undefined') return 'publish';
    const v = (window as any).__starcatcherSoundMode;
    return (v === 'off' || v === 'action' || v === 'publish' || v === 'all') ? v : 'publish';
  });
  const [state, setState] = useState<{ type: ActionType | null; xp: number; hint?: string } | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [publishing, setPublishing] = useState(false);
  const [noteOpen, setNoteOpen] = useState<ActionType | null>(null);
  const [noteText, setNoteText] = useState('');
  const [pubRef, setPubRef] = useState({ ref: '', title: '' });

  async function record(action: ActionType, note?: string, outputRef?: string, outputTitle?: string) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, action, note, outputRef, outputTitle })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast('操作失败：' + (err.error ?? res.statusText), { tone: 'warning' });
          return;
        }
        const data = await res.json();
        // alreadyDone = true 表示之前已经记过 — 不显示 +XP 浮窗，改为轻提示
        if (data.alreadyDone) {
          setState({ type: action, xp: 0, hint: '已记录' });
        } else {
          setState({ type: action, xp: data.xp });
          // 触发动作音（受 soundMode 过滤）
          playActionSound(action, soundMode);
          // 触发 Boss 完成音 + toast
          if (data.completedBosses && data.completedBosses.length > 0) {
            for (const name of data.completedBosses) {
              if (typeof window !== 'undefined' && window.StarCatcherAudio) {
                window.StarCatcherAudio.play('constellation');
              }
              toast(`星座点亮：${name}`, { tone: 'gold', ttl: 3600 });
            }
          }
          // 升级音 + toast
          if (data.levelUp) {
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.StarCatcherAudio) {
                window.StarCatcherAudio.play('levelup');
              }
              toast(`升级 → Lv ${data.levelUp.to}`, { tone: 'gold', ttl: 3200 });
            }, 300);
          }
        }
        // 立即清掉 +XP 浮窗 + 用 router refresh 拿新数据 (避免 full page reload 切断动画/音频)
        setTimeout(() => setState(null), 1200);
        router.refresh();
      } catch (err) {
        toast('网络错误', { tone: 'warning' });
      }
    });
  }

  function handleClick(action: ActionType) {
    if (action === 'note') {
      setNoteOpen('note');
      return;
    }
    if (action === 'publish') {
      setPublishing(true);
      return;
    }
    record(action);
  }

  function submitNote() {
    if (!noteText.trim()) {
      toast('写点什么吧', { tone: 'warning' });
      return;
    }
    record('note', noteText);
    setNoteOpen(null);
    setNoteText('');
  }

  function submitPublish() {
    if (!pubRef.title.trim()) {
      toast('至少写个标题', { tone: 'warning' });
      return;
    }
    record('publish', undefined, pubRef.ref, pubRef.title);
    setPublishing(false);
    setPubRef({ ref: '', title: '' });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {ACTIONS.map(t => {
        const a = ACTION_LABELS[t];
        const xp = XP_VALUES[t];
        const isDone = done.includes(t);
        if (compact) {
          return (
            <button
              key={t}
              onClick={() => handleClick(t)}
              disabled={isPending || isDone}
              className={`flex h-7 w-7 items-center justify-center rounded-button border transition-colors disabled:opacity-50 ${
                isDone
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-ink-700 bg-ink-800/40 text-bone-200 hover:border-ink-600 hover:bg-ink-800 hover:text-bone-50'
              }`}
              title={`${a.zh}（+${xp} XP）`}
              aria-label={`${a.zh}（+${xp} XP）`}
            >
              <i className={`ph-light ph-${a.icon} text-[15px] leading-none`} aria-hidden />
            </button>
          );
        }
        return (
          <button
            key={t}
            onClick={() => handleClick(t)}
            disabled={isPending || isDone}
            className={`group flex items-center gap-1 rounded-button border px-2 py-1 text-xs transition-colors ${
              isDone
                ? 'border-gold/40 bg-gold/10 text-gold'
                : 'border-ink-700 bg-ink-800/40 text-bone-200 hover:border-ink-600 hover:bg-ink-800 hover:text-bone-50'
            } disabled:opacity-50`}
            title={`${a.zh}（+${xp} XP）`}
            aria-label={`${a.zh}（+${xp} XP）`}
          >
            <i className={`ph-light ph-${a.icon} text-[14px] leading-none`} aria-hidden />
            <span className="hidden sm:inline">{a.zh}</span>
            <span className="num text-[10px] opacity-60">+{xp}</span>
          </button>
        );
      })}

      {/* Note 弹层 */}
      {noteOpen === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-4">
          <div className="w-full max-w-md rounded-modal border border-gold/30 bg-ink-800 p-6">
            <h3 className="flex items-center gap-2 font-display text-xl text-bone-50"><i className="ph-light ph-note-pencil text-[20px] leading-none" aria-hidden />写一句笔记</h3>
            <p className="mt-1 text-xs text-bone-400">这对我有什么用？（+20 XP）</p>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="例：这个 agent 抽象很干净，公众号可以写横评…"
              className="mt-3 h-32 w-full rounded border border-ink-700 bg-ink-900 p-3 text-sm text-bone-50 placeholder:text-bone-400 focus:border-gold/50 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setNoteOpen(null)} className="rounded-button px-3 py-1.5 text-xs text-bone-400 hover:text-bone-50">取消</button>
              <button onClick={submitNote} className="rounded-button border border-gold bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold/20">写下</button>
            </div>
          </div>
        </div>
      )}

      {/* Publish 弹层 */}
      {publishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-4">
          <div className="w-full max-w-md rounded-modal border border-gold bg-ink-800 p-6">
            <h3 className="flex items-center gap-2 font-display text-xl text-bone-50"><i className="ph-light ph-megaphone text-[20px] leading-none text-gold" aria-hidden />发布作品</h3>
            <p className="mt-1 text-xs text-bone-400">关联到你的公众号文章 / 开源项目 / 推文（+100 XP）</p>
            <input
              value={pubRef.title}
              onChange={e => setPubRef({ ...pubRef, title: e.target.value })}
              placeholder="作品标题（必填）"
              className="mt-3 w-full rounded border border-ink-700 bg-ink-900 p-2 text-sm text-bone-50 focus:border-gold/50 focus:outline-none"
            />
            <input
              value={pubRef.ref}
              onChange={e => setPubRef({ ...pubRef, ref: e.target.value })}
              placeholder="URL（可选）"
              className="mt-2 w-full rounded border border-ink-700 bg-ink-900 p-2 text-sm text-bone-50 focus:border-gold/50 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setPublishing(false)} className="rounded-button px-3 py-1.5 text-xs text-bone-400 hover:text-bone-50">取消</button>
              <button onClick={submitPublish} className="rounded-button border border-gold bg-gold/15 px-3 py-1.5 font-display text-sm text-gold hover:bg-gold/25">点亮星图 ✦</button>
            </div>
          </div>
        </div>
      )}

      {state && (
        <div className="num fixed right-4 top-16 z-50 rounded-button border border-gold bg-ink-800 px-3 py-2 text-xs text-gold shadow-xl sm:top-20">
          {state.hint ?? `+${state.xp} XP`}
        </div>
      )}
    </div>
  );
}
