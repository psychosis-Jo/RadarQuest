import { AppShell } from '@/components/layout/AppShell';
import { BossForm } from '@/components/boss/BossForm';
import { BossManager } from './BossManager';
import { getAllBosses, getUsedConstellationIds } from '@/lib/data/boss';
import { getUserStats } from '@/lib/data/stats';

// Supabase 数据按请求拉，不要静态化
export const dynamic = 'force-dynamic';

export default async function BossesPage() {
  const [bosses, stats, usedConstellationIds] = await Promise.all([getAllBosses(), getUserStats(), getUsedConstellationIds()]);
  // 缺 status 视为 active（兼容历史脏数据 / seed 没写 status 的情况）
  const isActive = (b: any) => !b.status || b.status === 'active';
  const active = bosses.filter(isActive);
  const completed = bosses.filter(b => b.status === 'completed');
  const abandoned = bosses.filter(b => b.status === 'abandoned');

  return (
    <AppShell activeTab="" showSidebar={false}>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-bone-50">你的星座</h1>
        <p className="mt-1 text-sm text-bone-400">
          中长期产出 · 每个 Publish 点亮一星 · 当前 Lv {stats.level} · 累计 {stats.total_xp ?? 0} XP
        </p>
      </header>

      {/* 使用说明 */}
      <div className="hand-drawn-border mb-6 rounded-card bg-ink-800/40 p-5">
        <p className="num text-caption text-bone-400">这是什么</p>
        <p className="mt-2 text-sm text-bone-200">
          星座是你给自己立的中长期产出。v1 用 IAU 88 真实星座做模板——小犬座（2 星）适合 1-2 次的小事，猎户座（7 星）适合中等产出，天龙座（12 星）适合 100 个 AI 作品这种大工程。
          每完成一次 Publish，对应在途的星座就点亮一星；全部点亮就自动"已发现"，永久进星图册。
        </p>
        <p className="mt-2 text-xs text-bone-400">
          用法：新建一个 → 在星云浏览时挑相关的 item 做 Publish → 该星座点亮一星 → 全部点亮自动发现
        </p>
      </div>

      <BossManager active={active} completed={completed} abandoned={abandoned} usedConstellationIds={usedConstellationIds} />
    </AppShell>
  );
}
