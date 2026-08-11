import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { BossManager } from '@/components/boss/BossManager';
import { getAllBosses, getUsedConstellationIds } from '@/lib/data/boss';
import { getUserStats } from '@/lib/data/stats';

export const dynamic = 'force-dynamic';

export default async function MyBossesPage() {
  const [bosses, stats, usedConstellationIds] = await Promise.all([
    getAllBosses(),
    getUserStats(),
    getUsedConstellationIds()
  ]);
  const isActive = (b: any) => !b.status || b.status === 'active';
  const active = bosses.filter(isActive);
  const completed = bosses.filter(b => b.status === 'completed');
  const abandoned = bosses.filter(b => b.status === 'abandoned');

  return (
    <AppShell activeTab="my" showSidebar={false}>
      <header className="mb-6">
        <Link href="/my" className="num text-caption text-bone-400 hover:text-bone-50">← 我的</Link>
        <h1 className="mt-1 font-display text-3xl text-bone-50">你的星座</h1>
        <p className="mt-1 text-sm text-bone-400">
          中长期产出 · 每个 Publish 点亮一星 · 当前 Lv {stats.level} · 累计 {stats.total_xp ?? 0} XP
        </p>
      </header>

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

      <BossManager
        active={active}
        completed={completed}
        abandoned={abandoned}
        usedConstellationIds={usedConstellationIds}
      />
    </AppShell>
  );
}
