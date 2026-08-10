# ARCHITECTURE

> 单仓 monorepo：一个 Next.js 应用 + 一个共享纯函数包 + Supabase 当数据库。

## 1. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Next.js 15 (App Router) + TypeScript | 你的"上云"最干净的部署形态；TS 强制类型 |
| 样式 | Tailwind CSS + shadcn/ui | 组件可改、不是黑盒、活跃社区 |
| 动效 | motion（原 framer-motion） | React 生态最成熟 |
| 音效 | howler.js | 轻量、好用 |
| 数据库 | Supabase（Postgres） | Auth + DB + Storage 一站式；免费 tier 个人够用 |
| 定时任务 | GitHub Actions cron | 你优先 GitHub |
| 部署 | Vercel | Next.js 一等公民 |
| RSS | rss-parser | Node 标准 |
| 抓取 | cheerio + node-fetch | 自托管 RSSHub 配合 |
| 国际化 | next-intl | 简单、官方推荐 |
| 测试 | Vitest + Playwright | 单元 + 端到端 |
| 包管理 | pnpm | monorepo 友好、磁盘高效 |

## 2. 仓库结构

```
radar-quest/
├── .github/
│   ├── workflows/
│   │   ├── daily-fetch.yml          # GitHub Actions cron
│   │   └── ci.yml
│   └── ISSUE_TEMPLATE/
├── apps/
│   └── web/                         # Next.js 应用
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx                   # dashboard 主页
│       │   │   │   ├── trending/page.tsx
│       │   │   │   ├── spike/page.tsx
│       │   │   │   ├── rise/page.tsx
│       │   │   │   ├── density/page.tsx
│       │   │   │   ├── cross/page.tsx
│       │   │   │   ├── quests/page.tsx
│       │   │   │   ├── skills/page.tsx
│       │   │   │   ├── bosses/page.tsx
│       │   │   │   ├── output/page.tsx
│       │   │   │   ├── settings/page.tsx
│       │   │   │   └── rss.xml/route.ts
│       │   │   └── api/
│       │   │       ├── fetch/route.ts             # 手动触发抓取
│       │   │       ├── actions/route.ts
│       │   │       ├── quests/today/route.ts
│       │   │       └── seed/route.ts              # 首次种子
│       │   ├── components/
│       │   │   ├── ui/                            # shadcn 基础
│       │   │   ├── theme/                         # 主题、字体
│       │   │   ├── hand-drawn/                    # 手绘 SVG 组件
│       │   │   ├── game/                          # XP / 等级 / streak
│       │   │   ├── item-card/
│       │   │   ├── quest/
│       │   │   ├── skill-tree/
│       │   │   ├── boss/
│       │   │   └── layout/
│       │   ├── lib/
│       │   │   ├── db.ts                          # Supabase client
│       │   │   ├── sources/
│       │   │   │   ├── github.ts
│       │   │   │   ├── producthunt.ts
│       │   │   │   ├── hackernews.ts
│       │   │   │   ├── reddit.ts
│       │   │   │   ├── newsletter.ts
│       │   │   │   └── wechat.ts
│       │   │   ├── tags/
│       │   │   │   ├── trending.ts
│       │   │   │   ├── spike.ts
│       │   │   │   ├── rise.ts
│       │   │   │   ├── density.ts
│       │   │   │   └── cross.ts
│       │   │   ├── keywords.ts
│       │   │   ├── quests.ts
│       │   │   ├── game.ts
│       │   │   ├── achievements.ts
│       │   │   ├── seed.ts
│       │   │   ├── i18n/
│       │   │   └── utils.ts
│       │   ├── styles/
│       │   │   └── globals.css
│       │   └── types/
│       ├── public/
│       │   ├── fonts/
│       │   ├── illustrations/
│       │   │   ├── empty-states/
│       │   │   ├── achievements/
│       │   │   ├── bosses/
│       │   │   └── decorations/
│       │   └── sounds/
│       ├── messages/
│       │   ├── zh.json
│       │   └── en.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   └── shared/                       # 可复用的纯函数（关键词匹配、标签计算等）
│       ├── src/
│       │   ├── keywords.ts
│       │   ├── tags.ts
│       │   └── index.ts
│       └── package.json
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql
│   └── seed.sql
├── scripts/
│   ├── fetch.ts                      # 抓取入口
│   ├── compute-tags.ts
│   ├── seed-sample.ts
│   └── export.ts
├── data/
│   ├── keywords.default.json
│   └── sources.default.json
├── docs/
│   ├── VISION.md
│   ├── DESIGN.md
│   ├── DATA_MODEL.md
│   ├── GAMIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── BUILD_PLAN.md
│   ├── REPO_SPLIT.md
│   ├── KEYWORDS.md
│   └── ROADMAP.md
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## 3. 模块边界

### `apps/web` — Next.js 应用
- 路由、UI、API route
- 调用 `lib/` 下的业务逻辑
- 不直接写 SQL；用 `lib/db.ts` 提供的函数

### `packages/shared` — 纯函数包
- 关键词匹配算法
- 标签计算公式
- XP / Level 公式
- **不依赖任何运行时**（无 Next、无 Supabase）
- 可以在 scripts/ 和 apps/web 复用

### `scripts/` — 离线脚本
- `fetch.ts`：被 GitHub Actions 调用，每天跑一次
- `compute-tags.ts`：抓完后跑
- `seed-sample.ts`：开发 / 新用户首次
- `export.ts`：用户数据导出

### `data/` — 静态配置
- `keywords.default.json`：默认关键词（v1 列表）
- `sources.default.json`：默认信源配置

## 4. 数据流

### 每日自动流程（GitHub Actions cron）

```
[GitHub Actions] daily-fetch.yml
  ↓
  pnpm fetch
  ↓
  lib/sources/*.ts → 各源 API
  ↓
  关键词匹配 → topics + matched_keywords
  ↓
  upsert 到 items 表
  ↓
  insert 到 snapshots 表
  ↓
  pnpm compute-tags
  ↓
  lib/tags/*.ts → 5 标签分数
  ↓
  update snapshots.tag_scores
```

### 用户交互流程

```
[User clicks Watch on item]
  ↓
POST /api/actions { item_id, type: 'watch' }
  ↓
insert into actions
  ↓
recompute XP / Level / Skill / Streak
  ↓
return { new_xp, new_level, new_streak, achievement_unlocked? }
  ↓
[UI] 动效 + 音效 + 顶部统计条更新
```

## 5. 环境变量

`.env.example`：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=              # 仅 server-side（抓取脚本用）

# GitHub（提升 API 速率）
GITHUB_TOKEN=

# Product Hunt
PRODUCTHUNT_API_TOKEN=

# RSSHub（自托管）
RSSHUB_BASE_URL=https://rsshub.app      # 建议自托管

# 应用
NEXT_PUBLIC_APP_NAME="Radar Quest"
NEXT_PUBLIC_DEFAULT_LOCALE=zh
```

## 6. 部署形态

```
GitHub repo (radar-quest)
   │
   ├── main branch → Vercel (auto deploy on push)
   │
   └── .github/workflows/daily-fetch.yml
         → 每天 UTC+0 跑一次
         → 调用 Supabase + 各 API
         → 写回 Supabase
```

**为什么 GitHub Actions cron 跑抓取，而不是 Vercel Cron**：
- Vercel Cron 触发的是 Next.js API route，会消耗 Function 调用时间
- GitHub Actions 跑的是独立 Node 脚本，不受应用部署影响
- 抓取失败不影响主应用

## 7. 测试策略

- **单元测试**（Vitest）：`packages/shared/` 全部 + `apps/web/src/lib/` 业务逻辑
- **API route 测试**：用 Next.js 内置测试
- **E2E**（Playwright）：关键流程
  - 浏览 5 Tab
  - 点击 5 个动作 → 检查 XP 上涨
  - 改设置 → 检查生效
  - 生成 RSS

## 8. 性能与缓存

- 首页（dashboard 主页）：服务端渲染（SSR）+ 5 分钟缓存
- 5 Tab：客户端渲染 + SWR 缓存
- 设置：纯客户端
- 抓取脚本：直接打 API，不经 Next.js

## 9. 安全

- Supabase RLS（Row Level Security）v1 不开（个人单用户），但 schema 设计预留 row_id 字段方便 v2 加
- Service role key 仅 server-side 使用，不进 client bundle
- 抓取脚本鉴权用环境变量，不进 git
