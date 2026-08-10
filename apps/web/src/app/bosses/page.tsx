import { AppShell } from '@/components/layout/AppShell';
import { BossForm } from '@/components/boss/BossForm';
import { BossManager } from './BossManager';
import { getAllBosses, getUsedConstellationIds } from '@/lib/data/boss';
import { getUserStats } from '@/lib/data/stats';

export default async function BossesPage() {
  const [bosses, stats, usedConstellationIds] = await Promise.all([getAllBosses(), getUserStats(), getUsedConstellationIds()]);
  const active = bosses.filter(b => b.status === 'active');
  const completed = bosses.filter(b => b.status === 'completed');
  const abandoned = bosses.filter(b => b.status === 'abandoned');

  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">Boss 关卡</h1>
        <p className="mt-1 text-sm text-bone-400">
          长期战役 · 每个 Publish 都是一击 · 当前 Lv {stats.level} · 累计 {stats.total_xp ?? 0} XP
        </p>
      </header>

      {/* 使用说明 */}
      <div className="hand-drawn-border mb-6 rounded bg-ink-800/40 p-5">
        <p className="num text-[10px] uppercase tracking-widest text-bone-400">这是什么</p>
        <p className="mt-2 text-sm text-bone-200">
          Boss 是你给自己设的长期目标。常见的 Boss 形态：写 50 篇公众号、做 100 个 AI 作品、读 12 本自我管理书。
          系统会追踪你的 Publish 次数，自动给活跃 Boss 加 1 击破，到目标就完成。
        </p>
        <p className="mt-2 text-xs text-bone-400">
          用法：创建一个 → 在主页浏览时挑相关的 item 做 Publish → 进度自动涨 → 击破时自动标记完成
        </p>
      </div>

      <BossManager active={active} completed={completed} abandoned={abandoned} usedConstellationIds={usedConstellationIds} />
    </AppShell>
  );
}
