import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export default function MyPage() {
  return (
    <AppShell activeTab="my">
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="num text-caption text-bone-400">/my</p>
        <h1 className="mt-2 font-display text-heading text-bone-50">我的</h1>
        <p className="mt-4 text-body leading-relaxed text-bone-200">
          概览（v1.2 规划中）—— Level / XP / Streak / 今日动作数。
        </p>
        <p className="mt-2 text-caption text-bone-400">
          未来子页签：<code className="num">/my/quests</code> · <code className="num">/my/skills</code> · <code className="num">/my/bosses</code> · <code className="num">/my/sky-atlas</code>
        </p>
        <p className="mt-2 text-caption text-bone-400">
          详见 <a href="/IA.md" className="text-gold hover:underline">IA.md §6</a>。
        </p>
        <p className="mt-8 text-caption text-bone-400">页面在搭，先看 <Link href="/" className="text-gold hover:underline">星云</Link> 或 <Link href="/settings" className="text-gold hover:underline">设置</Link>。</p>
      </div>
    </AppShell>
  );
}
