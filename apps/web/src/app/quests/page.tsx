import { AppShell } from '@/components/layout/AppShell';
import { Starfield } from '@/components/hand-drawn/Starfield';
import { getItemsByTab } from '@/lib/data/items';

export default async function QuestsPage() {
  const items = await getItemsByTab('trending', 3);
  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">今日任务</h1>
        <p className="mt-1 text-sm text-bone-400">系统自动从今天热点里挑的 3 个</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="hand-drawn-border group relative overflow-hidden rounded bg-ink-800/60 p-5 transition-all hover:bg-ink-800 hover:shadow-glow"
          >
            <p className="num text-[10px] uppercase tracking-widest text-bone-400">
              Quest {i + 1}
            </p>
            <p className="font-display mt-2 line-clamp-2 text-base text-bone-50 group-hover:text-gold">
              {item.title}
            </p>
            {item.summary && <p className="mt-2 line-clamp-2 text-xs text-bone-200">{item.summary}</p>}
            <p className="num mt-3 text-[10px] text-bone-400">
              来源: {item.source}
            </p>
          </a>
        ))}
      </div>

      {items.length === 0 && (
        <div className="rounded border border-dashed border-ink-700 bg-ink-800/30 p-12 text-center">
          <p className="font-display text-lg text-bone-50">没有可推荐的任务</p>
          <p className="mt-2 text-sm text-bone-400">先做一次 fetch 让数据进来</p>
        </div>
      )}
    </AppShell>
  );
}
