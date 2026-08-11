import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export default function CapturePage() {
  return (
    <AppShell activeTab="capture">
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="num text-caption text-bone-400">/capture</p>
        <h1 className="mt-2 font-display text-heading text-bone-50">捕捉</h1>
        <p className="mt-4 text-body leading-relaxed text-bone-200">
          主题聚合卡片流（v1.2 规划中）。
        </p>
        <p className="mt-2 text-caption text-bone-400">
          按 topic（AI / 一人公司 / 自我管理）分组，保留 / 收藏 / 忽略三动作。
          详见 <a href="/IA.md" className="text-gold hover:underline">IA.md §4</a>。
        </p>
        <p className="mt-8 text-caption text-bone-400">页面在搭，先看 <Link href="/" className="text-gold hover:underline">星云</Link>。</p>
      </div>
    </AppShell>
  );
}
