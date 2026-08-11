'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { TOPIC_COLORS } from '@starcatcher/shared';

type Tone = 'info' | 'success' | 'gold' | 'warning';

interface Toast {
  id: number;
  text: string;
  tone: Tone;
  ttl: number;
}

interface Ctx {
  toast: (text: string, opts?: { tone?: Tone; ttl?: number }) => void;
}

const ToasterCtx = createContext<Ctx>({ toast: () => {} });

export function useToaster() {
  return useContext(ToasterCtx);
}

let _seq = 0;
let _pushExternal: ((t: Omit<Toast, 'id'>) => void) | null = null;

/** 不在组件树里也能用：window.starCatcherToast(text, tone) */
export function toast(text: string, opts?: { tone?: Tone; ttl?: number }) {
  if (_pushExternal) {
    _pushExternal({ text, tone: opts?.tone ?? 'info', ttl: opts?.ttl ?? 2400 });
  } else {
    // Provider 还没 mount（SSR 阶段）—— 等 mount 后再补
    if (typeof window !== 'undefined') {
      window.__pendingToasts = window.__pendingToasts ?? [];
      window.__pendingToasts.push({ text, tone: opts?.tone ?? 'info' });
    }
  }
}
if (typeof window !== 'undefined') {
  (window as any).starCatcherToast = toast;
}

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++_seq;
    setItems(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setItems(prev => prev.filter(x => x.id !== id));
    }, t.ttl);
  }, []);

  useEffect(() => {
    _pushExternal = push;
    // 处理 Provider 未 mount 期间累积的 toast
    if (typeof window !== 'undefined' && window.__pendingToasts) {
      for (const p of window.__pendingToasts) push({ text: p.text, tone: p.tone, ttl: 2400 });
      window.__pendingToasts = [];
    }
    return () => { _pushExternal = null; };
  }, [push]);

  return (
    <ToasterCtx.Provider value={{ toast: (text, opts) => push({ text, tone: opts?.tone ?? 'info', ttl: opts?.ttl ?? 2400 }) }}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-16 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 sm:top-20">
        {items.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-button border px-4 py-2 text-sm shadow-2xl backdrop-blur-sm ${toneClass(t.tone)}`}
            style={{ animation: 'toast-pop 240ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {t.tone === 'gold' && <span className="mr-1.5 text-gold">✦</span>}
            {t.text}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-pop {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToasterCtx.Provider>
  );
}

function toneClass(t: Tone): string {
  switch (t) {
    case 'success': return 'border-celestial/40 bg-ink-900/90 text-bone-50';
    case 'gold':    return 'border-gold/50 bg-ink-900/90 text-bone-50';
    case 'warning': return 'border-warning/40 bg-ink-900/90 text-bone-50';
    default:        return 'border-ink-700 bg-ink-900/90 text-bone-50';
  }
}
