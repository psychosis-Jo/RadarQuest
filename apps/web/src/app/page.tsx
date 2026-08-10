export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="space-y-12">
        <header className="space-y-4">
          <p className="num text-xs uppercase tracking-widest text-bone-400">
            2026 · v0.1 scaffolding
          </p>
          <h1 className="font-display text-5xl font-light leading-tight text-bone-50 sm:text-6xl">
            Radar <span className="italic text-gold">Quest</span>
          </h1>
          <p className="max-w-2xl text-lg text-bone-200">
            把"看到热点"变成"产出一个作品"。
            每完成一次，就点亮一颗星。慢慢地，你拥有了一整片自己的星图。
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { tag: 'Radar', zh: '扫描 6 个信源，按 5 维度聚合', color: 'celestial' },
            { tag: 'Quest', zh: '5 个动作层级，从看到到做出', color: 'amber' },
            { tag: 'Starlight', zh: '每次 Publish 点亮一颗星', color: 'gold' }
          ].map((item) => (
            <div
              key={item.tag}
              className="hand-drawn-border bg-ink-800 p-6 transition-shadow hover:shadow-glow"
            >
              <p className={`font-display text-2xl text-${item.color}`}>{item.tag}</p>
              <p className="mt-2 text-sm text-bone-200">{item.zh}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3 border-t border-ink-700 pt-12">
          <p className="num text-xs uppercase tracking-widest text-bone-400">
            Phase 0 · scaffold ready
          </p>
          <p className="text-bone-200">
            脚手架已就位。下一步进入 Phase 1：装字体、生成手绘资产、搭主题。
          </p>
          <ul className="num space-y-1 text-sm text-bone-400">
            <li>· Next.js 15 + TypeScript + Tailwind</li>
            <li>· Supabase schema 0001_init.sql</li>
            <li>· GitHub Actions daily-fetch.yml</li>
            <li>· docs/ 全部规划文档</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
