# REPO SPLIT

> 公开代码 + 私有数据。**一个公开模板仓 + Supabase 存你的数据**。

## 方案 A（推荐）

### 公开仓：`yourname/starcatcher`
- 全部应用代码
- 默认配置（`data/keywords.default.json` 等）
- `docs/` 全部
- 其他人可以 fork 跟着用
- `.env.example` 不带真实凭据

### 数据：Supabase
- 你的 items、snapshots、actions、settings 全部在 Supabase Postgres
- 你的个人关键词、Boss、个人动作记录
- 你的 RSSHub 实例 URL（如果自托管）
- 免费 tier 个人够用：500MB DB、1GB 存储、2GB 出站流量

### 为什么这样好
- 代码公开、个人隐私不暴露
- 不需要维护两个仓
- Supabase 的 RLS 未来可以加，v1 单用户不开
- 备份简单：Supabase 自动备份 + 你随时可以 export

## 方案 B（备选）

如果你想完全离线 / 不依赖云服务：

### 公开仓：`yourname/starcatcher`（代码）
- 同上

### 私有仓：`yourname/starcatcher-data`（配置）
- 你的真实关键词 JSON
- 你的真实 Boss 配置 JSON
- 你的导出（每月一次）

### 数据：仍用 Supabase
- 即使没有"公开仓"，抓取脚本和查询都依赖 Supabase

**这个方案只在你不希望把任何配置存到第三方时才需要。** 对 v1 个人使用来说**过度**。

## 用户视角：如何 fork + 部署

1. 访问 `github.com/yourname/starcatcher`
2. 点 "Use this template" → 命名 `starcatcher`
3. 克隆到本地
4. 注册 Supabase 账号（免费）
5. 在 Supabase SQL 编辑器跑 `supabase/migrations/0001_init.sql`
6. 复制 project URL + anon key 到 `.env`
7. （可选）自托管 RSSHub（Docker 一行）
8. `pnpm install && pnpm seed && pnpm dev`
9. 部署到 Vercel：导入 GitHub 仓，配置 env vars
10. 在 GitHub 仓 settings → Secrets 配置 Supabase keys + RSSHub URL
11. 等第二天看 cron 自动跑的结果

## 升级路径

- **v1.1** 多人版：加 Supabase Auth，每个用户独立数据
- **v1.2** 社区层：增加 `users` 表 + RLS
- **v2.0** 跨用户数据：增加 Boss 进度分享、灵感卡组收藏

数据模型里已经预留 `user_id` 字段但 v1 不启用（实际跑在单用户模式下）。
