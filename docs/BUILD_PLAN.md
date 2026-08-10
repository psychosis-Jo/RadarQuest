# BUILD PLAN

> 12 阶段。每阶段有"完成定义"，全部走通才进下一步。**总预估 25-30 天。**

## Phase 0 · 脚手架（半天）

- [ ] 0.1 建 monorepo（pnpm workspaces）+ Next.js 15 + TS + Tailwind
- [ ] 0.2 装依赖：shadcn/ui、motion、howler、@supabase/supabase-js、rss-parser、cheerio、node-fetch、next-intl、zod
- [ ] 0.3 创建 Supabase 项目，跑 `0001_init.sql` 迁移
- [ ] 0.4 写 `.env.example`，配置本地 env
- [ ] 0.5 初始化 Git 仓库（`radar-quest`），分支保护规则
- [ ] 0.6 写 `tsconfig.base.json`、根 `package.json` scripts

**完成定义**：`pnpm dev` 起得来，Supabase 连接 OK

## Phase 1 · 设计系统（2-3 天）

- [ ] 1.1 装 `Fraunces` + `Inter` + `JetBrains Mono`（next/font）
- [ ] 1.2 写 `tailwind.config.ts`：自定义色板、字体、阴影
- [ ] 1.3 主题 CSS variables（深色为主，预留浅色）
- [ ] 1.4 用 imagegen 生成**手绘资产第一批**：Logo、3 张空状态、5 段分割线、12 个成就徽章、3 个 Boss 形象、装饰元素
- [ ] 1.5 封装 `hand-drawn/` 组件（手绘按钮、卡片边框、装饰分隔）
- [ ] 1.6 音效库（8 个 .mp3/.ogg，<10KB 每个），封装 `useSound` hook
- [ ] 1.7 动效原语（XP 数字滚动、粒子、星座连线绘制）
- [ ] 1.8 写 `/dev` 页面展示所有资产和动效

**完成定义**：dev 页面把所有资产和动效展示出来，设计师能验收

## Phase 2 · 数据层（1-2 天）

- [ ] 2.1 写完整 SQL 迁移（6 张表 + 索引 + 约束）
- [ ] 2.2 写 `lib/db.ts`：Supabase client（server + client 两种）
- [ ] 2.3 写 `types/`：所有表的 TS 类型
- [ ] 2.4 写 `lib/seed.ts`：插默认 settings 行、默认关键词、默认 Boss
- [ ] 2.5 写 `data/keywords.default.json`、`data/sources.default.json`
- [ ] 2.6 写 `packages/shared/`：关键词匹配、标签计算纯函数

**完成定义**：本地能 `pnpm seed` 灌入默认数据

## Phase 3 · 数据抓取（3-4 天）

- [ ] 3.1 `lib/sources/github.ts`：GitHub Trending（走 search API）
- [ ] 3.2 `lib/sources/producthunt.ts`：PH GraphQL API
- [ ] 3.3 `lib/sources/hackernews.ts`：HN top stories
- [ ] 3.4 `lib/sources/reddit.ts`：r/programming、r/MachineLearning、r/IndieHackers、r/productivity
- [ ] 3.5 `lib/sources/newsletter.ts`：通用 RSS
- [ ] 3.6 `lib/sources/wechat.ts`：自托管 RSSHub
- [ ] 3.7 `lib/keywords.ts`：关键词匹配（中英双向，支持权重）
- [ ] 3.8 `scripts/fetch.ts`：总入口

**完成定义**：手动跑一次能从 6 个源拉到 ≥30 条 item，关键词匹配正确

## Phase 4 · 标签计算（2-3 天）

- [ ] 4.1 `lib/tags/trending.ts`：当天来源榜单得分聚合
- [ ] 4.2 `lib/tags/spike.ts`：过去 7 天增量倍数（**无历史返回空集**）
- [ ] 4.3 `lib/tags/rise.ts`：过去 30 天单调上升（**无历史返回空集**）
- [ ] 4.4 `lib/tags/density.ts`：评论 / PR / upvotes 加权和
- [ ] 4.5 `lib/tags/cross.ts`：跨 ≥2 源提及合并
- [ ] 4.6 `scripts/compute-tags.ts`：写回 snapshots.tag_scores

**完成定义**：5 个查询函数各自能返回正确结果集

## Phase 5 · 核心 UI（3-4 天）

- [ ] 5.1 布局：顶栏 + 侧栏 + 主区（响应式）
- [ ] 5.2 `ItemCard` 组件
- [ ] 5.3 5 个 tab 页面（共用 ItemList + 不同 query）
- [ ] 5.4 动作记录 API（`/api/actions` POST）
- [ ] 5.5 设置页：强度档位、关键词编辑、信源开关
- [ ] 5.6 移动端基础适配

**完成定义**：能浏览 5 个 tab，能点 5 个动作，数据持久化

## Phase 6 · 游戏机制（3-4 天）

- [ ] 6.1 `lib/game.ts`：XP 规则、Level 公式
- [ ] 6.2 `SkillTree` 组件：3 主题进度条（手绘星座风格）
- [ ] 6.3 Streak 计算：双 streak，含宽限期
- [ ] 6.4 `lib/quests.ts`：每日任务生成
- [ ] 6.5 `Boss` 组件：HP 槽位、击破动效
- [ ] 6.6 Boss 管理（设置页 CRUD）
- [ ] 6.7 `lib/achievements.ts`：12+ 预置成就
- [ ] 6.8 顶部统计条、侧栏任务卡、Stats 页面
- [ ] 6.9 主页"星图"视图（30 天星点散落）

**完成定义**：点 Watch 后顶部 XP 数字动起来、技能树前进、Boss 计数 +1

## Phase 7 · 动效 + 音效集成（2-3 天）

- [ ] 7.1 XP 动效
- [ ] 7.2 升级弹层
- [ ] 7.3 Boss 击破动效
- [ ] 7.4 技能树填充
- [ ] 7.5 Tab 切换
- [ ] 7.6 成就解锁通知
- [ ] 7.7 音效与档位联动
- [ ] 7.8 背景氛围（Full+ 档）

**完成定义**：所有动作都有正确视觉/听觉反馈

## Phase 8 · RSS + 导出（1 天）

- [ ] 8.1 `/rss.xml` 路由
- [ ] 8.2 导出 endpoint：actions.json、notes.md、output-links.csv
- [ ] 8.3 RSS 验证（w3c validator）

**完成定义**：RSS 通过 validator，导出文件可下载

## Phase 9 · 示例数据（1 天）

- [ ] 9.1 写 3 天历史快照脚本（手工构造覆盖各场景）
- [ ] 9.2 包含：≥30 条 items、跨多源、有 spike、有 rise、有用户动作、有 1 个进行中的 Boss
- [ ] 9.3 新装时自动 seed

**完成定义**：删库重 seed 后，新用户看到完整 dashboard

## Phase 10 · 部署（1-2 天）

- [ ] 10.1 Vercel 部署 Next.js
- [ ] 10.2 GitHub Actions `daily-fetch.yml`：每天 UTC+0 跑 fetch + compute-tags
- [ ] 10.3 Supabase 计划选 free tier
- [ ] 10.4 监控：Actions 运行日志、Supabase 用量
- [ ] 10.5 连续 3 天自动跑成功

**完成定义**：cron 稳定运行

## Phase 11 · 打磨（2-3 天）

- [ ] 11.1 移动端完整适配
- [ ] 11.2 Loading / Empty / Error 三态全部用对应手绘插画
- [ ] 11.3 性能（图片优化、字体子集、代码分割）
- [ ] 11.4 无障碍（键盘、ARIA、对比度）
- [ ] 11.5 Lighthouse > 90

**完成定义**：手机端可用，无明显卡顿

## Phase 12 · 开源准备（1-2 天）

- [ ] 12.1 README：截图、特性、Quick Start、部署指南
- [ ] 12.2 全部 docs/
- [ ] 12.3 CONTRIBUTING.md、CODE_OF_CONDUCT.md、MIT LICENSE
- [ ] 12.4 写一篇发布到独立开发社区的文案
- [ ] 12.5 别人能 30 分钟内跑起来

**完成定义**：v1 上线

---

## v1 完成的硬标准

- [ ] `pnpm dev` 起来后，本地能浏览 5 个 tab
- [ ] 6 个数据源都能拉到数据
- [ ] 关键词匹配按 3 主题正确归类
- [ ] 5 个动作都能记录，XP / Level / Skill / Streak / Boss 全部联动
- [ ] 强度档位 0-4 切换正常，音效 / 动效按档位显隐
- [ ] RSS 输出有效
- [ ] 设置页改完关键词后立即生效
- [ ] 桌面端 + 移动端都能用
- [ ] 删库重 seed 后新用户看到完整 dashboard
- [ ] Vercel 部署 + GitHub Actions cron 连续 3 天成功
- [ ] README 让陌生人 30 分钟内能跑起来
