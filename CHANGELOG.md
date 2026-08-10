# CHANGELOG

## 0.1.0 · 2026-08-10 · Phase 0 scaffolding

### Added
- 仓库结构（monorepo: apps/web + packages/shared + scripts + supabase + data + docs）
- 全部规划文档（9 份）：VISION / DESIGN / DATA_MODEL / GAMIFICATION / ARCHITECTURE / BUILD_PLAN / REPO_SPLIT / KEYWORDS / ROADMAP
- README（v0.1 状态说明）
- 默认配置：`data/keywords.default.json`、`data/sources.default.json`
- `.env.example`、`.gitignore`、`pnpm-workspace.yaml`、`tsconfig.base.json`
- 根 `package.json`（workspace + scripts）
- `apps/web`：
  - Next.js 15 + TypeScript + Tailwind + PostCSS + ESLint 配置
  - `tailwind.config.ts`：自定义 ink / bone / gold / celestial / amber / mist 配色，字体栈
  - `src/styles/globals.css`：星点背景层、手绘卡片、减弱动效
  - `src/app/layout.tsx`：Fraunces + Inter + JetBrains Mono 字体
  - `src/app/page.tsx`：v0.1 着陆页（展示 Radar / Quest / Starlight 三段式）
  - `src/lib/db.ts`：Supabase client（browser + server）
  - `src/lib/i18n/`：next-intl 配置 + zh.json / en.json
  - `src/lib/sources/`：6 个抓取源（github / producthunt / hackernews / reddit / newsletter / wechat）
- `packages/shared`：纯函数包（keywords / tags / game，无运行时依赖）
- `scripts/`：fetch.ts（抓取入口）、compute-tags.ts（标签计算）、seed-sample.ts（默认配置种子）
- `supabase/migrations/0001_init.sql`：6 张表 + 索引 + 默认 settings
- `.github/workflows/daily-fetch.yml`：UTC 1 点 cron 跑 fetch + compute-tags

### Not done yet
- 图片资产（Logo / 空状态 / 成就徽章 / Boss 形象 / 装饰元素）—— Phase 1
- 5 个 Tab 页面 UI —— Phase 5
- 游戏化交互层（XP / 等级 / 技能树 / Boss）—— Phase 6
- 动效 + 音效 —— Phase 7
- RSS / 导出 / 示例数据 —— Phase 8-9
- 部署 —— Phase 10
