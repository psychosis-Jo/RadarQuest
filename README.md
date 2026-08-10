# Radar Quest

> 把"看到热点"变成"产出一个作品"。每完成一次，就点亮一颗星。慢慢地，你拥有了一整片自己的星图。

Radar Quest 是一个面向内容创作者和独立开发者的个人技术雷达。
它从 GitHub、Product Hunt、Hacker News、Reddit、Newsletter、公众号（通过 RSSHub）抓取热点，
按 5 个维度（Trending 榜 / 短时间爆发 / 持续上升 / 讨论密度 / 跨平台提及）聚合，
再用一套浪漫的星图式游戏化机制，把"看到"变成"做到"，把"做到"变成"发布"。

## 核心想法

- **Radar**：扫描 6 个信源 + 你关心的关键词（AI 应用、一人公司、自我管理），构建你的个人技术雷达
- **Quest**：每条热点可以变成一次任务。5 个动作层级：👀 Watch → 🔖 Save → 📝 Note → 🛠 Build → 📢 Publish
- **Starlight**：每次 Publish 都在你的"星图"上点亮一颗星。Boss 完成 = 一组星座亮起。慢慢地，你拥有了一整片自己的宇宙

## 特性

- 6 个数据源（v1）
- 5 个维度的热度榜
- 3 主题技能树（AI / 一人公司 / 自我管理）
- 可自定义 Boss 关卡
- 每日任务 + 双 streak（行动 / 输出）
- 12+ 成就徽章
- 4 档游戏化强度（0-4）+ 7 个独立开关
- RSS 订阅 + 数据导出
- 中英双语
- 桌面端 + 移动端适配

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/<your-username>/radar-quest.git
cd radar-quest

# 2. 装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 填入 Supabase URL 和 anon key（见 docs/REPO_SPLIT.md）

# 4. 初始化数据库
# 在 Supabase 控制台 SQL 编辑器运行 supabase/migrations/0001_init.sql

# 5. 启动
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，首次进入会预置 3 天示例数据。

## 文档

- [VISION.md](docs/VISION.md) — 产品愿景与"星图"哲学
- [DESIGN.md](docs/DESIGN.md) — 视觉设计系统
- [DATA_MODEL.md](docs/DATA_MODEL.md) — 数据库模型
- [GAMIFICATION.md](docs/GAMIFICATION.md) — 游戏化机制
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — 技术架构
- [BUILD_PLAN.md](docs/BUILD_PLAN.md) — 12 阶段构建计划
- [REPO_SPLIT.md](docs/REPO_SPLIT.md) — 模板仓 + Supabase 数据策略
- [KEYWORDS.md](docs/KEYWORDS.md) — 默认关键词清单
- [ROADMAP.md](docs/ROADMAP.md) — v1 / v2 / v3 范围

## 技术栈

Next.js 15 · TypeScript · Tailwind · shadcn/ui · motion · howler · Supabase · GitHub Actions · Vercel

## 许可

MIT

## 环境变量注意

`.env` 文件**必须放在 `apps/web/.env`**（Next.js 只会读这里的）。
仓库根的 `.env` 是给 `scripts/` 下的脚本用的（它们用 `dotenv/config`）。

两个文件要保持一致。建议加个 npm script 自动同步（未来改进）。
