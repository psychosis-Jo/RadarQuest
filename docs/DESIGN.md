# Radar Quest — DESIGN.md

> Personal tech radar for content creators.
> "Saw a trend" → "Shipped a work"。

---

## 0. 主题描述

**Theme:** dark · 古典星图册 · 真实天图代入

> constellation on indigo vellum — 每一颗 Publish 是一颗被你点亮的星。
> 你的产出史是一片**会生长的星云**，你的 Boss 是**真实星座**的轮廓。

Radar Quest 是一片夜空，不是 productivity 工作台。深墨蓝 vellum 是底，金色 ink 是点缀，三个主题色（星辉青 / 琥珀金 / 雾紫）只描亮你真正在意的信号。视觉中心是**你自己的星云**——所有你留下过痕迹的热点散落其中，按话题聚拢成簇，按状态显示亮度。**每点一次 Publish，天上就多一颗星**。

**Boss 来自真实星座**：v1 用 IAU 88 星座做 Boss 模板（猎户、天鹅、仙后...），用户自命名任务、点燃对应的星。完成后的星座移入"星图册"——这是你的产出史。

**字面规则（也写给 AI）：**
- 基底 = `#0F1424` 深墨蓝 vellum，**不是**纯黑、**不是**暗紫、**不是** `#0a0a0a`
- 唯一允许的"重金"是 `#D4A574` 古董金（XP / Publish / 成就），出现频率 < 5%
- 三个主题色是 **topic signal**（AI/一人公司/自我管理），**不是**装饰渐变
- 永远不做：渐变背景、玻璃拟态、纯白 SaaS、霓虹、emoji 头像
- 永远不用真实星座做"装饰星空"——星座**专属于 Boss**，不和用户星云混

---

## 1. 前台核心结构

```
┌──────────────────────────────────────────────────────────┐
│  HEADER: 🧭 Radar Quest · Lv · XP(+今日) · Streak · 星座 │
│          导航：任务 / 技能 / 星座 / 设置（sticky 顶栏）    │
├──────────────────────────────────────────────┬───────────┤
│                                              │ 侧栏 280px│
│           ★  ★    ★      ★                   │ ┌───────┐ │
│     ★  ·  ★        ·  ★                      │ │技能树  │ │
│     ·  ★  ·  ★   ·  ★  ·   ★                 │ │3 主题  │ │
│       ·  ·  ★  ·  ★     （主页 = 星云画布）   │ │进度条  │ │
│    ★  ·  ★  ·   ★                            │ ├───────┤ │
│       ·       ·                              │ │在途星座│ │
│                                              │ │进度条  │ │
│  左下：topic 筛选 chips                       │ └───────┘ │
│  右上：N 颗 · 总 XP                           │ <lg 隐藏  │
└──────────────────────────────────────────────┴───────────┘
       移动端：顶栏折叠为一行数字（Lv / XP / Streak），侧栏隐藏
```

**主视图 = 你的星云**（满屏力导向画布，不是列表）

**流转**：
- 抓来 → 近 14 天最多 120 条 item 全部进入星云
- 按第一 topic 分簇（AI / 一人公司 / 自我管理）；无 topic 进「未分类」簇
- 点击星 → 右侧 Drawer（Item Detail）→ 触发 5 动作，星随 XP 变亮变大
- 5 动作全部完成 → 星带金色光圈
- 完成 Boss → 对应星座点亮（星图册页规划中，见 §7）

> ⏳ 规划中（未实现）：5 Tab 入站视图（见 §8）、云上 1-click triage（见 §5.3）

---

## 2. Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ink Vellum 900 | `#0F1424` | `--ink-900` | Page canvas，section backgrounds，负空间——深墨蓝 vellum，是基底 |
| Ink Vellum 800 | `#1A2138` | `--ink-800` | 卡片 / 区块底色（极少用） |
| Ink Vellum 700 | `#2A3149` | `--ink-700` | 手绘细线描边、divider（hairline） |
| Ink Vellum 600 | `#3A4263` | `--ink-600` | 输入框 border |
| Bone 50 | `#F4E9D8` | `--bone-50` | 标题、正文、icon——唯一允许的"高亮"文字色 |
| Bone 200 | `#A8B0C8` | `--bone-200` | 次级正文、metadata |
| Bone 400 | `#6B7390` | `--bone-400` | 弱化提示、占位、helper text |
| Antique Gold | `#D4A574` | `--gold` | XP、Publish、成就、活跃 Boss 边框、已发现星座——**整页用量 < 5%** |
| Celestial | `#5FE0C7` | `--celestial` | AI / AI 框架 topic signal、星辉粒子、已发布高亮 |
| Amber | `#E8B86F` | `--amber` | 一人公司 topic signal |
| Mist | `#B8A4D4` | `--mist` | 自我管理 topic signal（**只作辅助色，不作主色**） |
| Flame | `#F4A261` | `--flame` | Streak 火焰、连续动作指示 |
| Warning | `#C77B7B` | `--warning` | 断 streak 等负向反馈 |
| Dim Link | `rgba(244, 233, 216, 0.12)` | `--dim-link` | 自动双链（细线、低对比） |
| Solid Link | `rgba(212, 165, 116, 0.6)` | `--solid-link` | 手动双链（粗实线、金色） |

**Topic 主题色使用规则：**
- 每个 item 卡片最多 2 个 topic dot
- 多 topic 用"1 大 2 小"排列
- 同一簇内星点不带 topic 色（位置即分类，色 = 状态）——目标设计；
  当前实现星点带 topic 色（见 §5.1）

---

## 3. Tokens — Typography

### 字体

| 角色 | 字体 | 字重 | 用途 |
|------|------|------|------|
| Display / 标题 | `Fraunces` | 400, 500, 600 | H1/H2、Logo、Boss 名、成就名、level 数字——带 optical sizing |
| Body | `Inter` | 400, 500, 600 | 正文、按钮、nav、表单 |
| Mono | `JetBrains Mono` | 400, 500 | 数字、XP、计数、date、source id——tabular nums 开启 |

加载：next/font self-host，subset 常用中文字重（400/500/600）。

### Type Scale

Base = 16px，Minor Third（1.2）步进。

| Token | Size | Line | Tracking | Weight | 用途 |
|-------|------|------|----------|--------|------|
| `--text-display` | 56px | 1.05 | -0.025em | Fraunces 500 | Level 数字、Publish 庆祝 |
| `--text-heading-lg` | 40px | 1.1 | -0.02em | Fraunces 500 | 页面 H1、星图册星座名 |
| `--text-heading` | 28px | 1.2 | -0.015em | Fraunces 500 | 区块 H2、Boss 名 |
| `--text-heading-sm` | 20px | 1.3 | -0.01em | Fraunces 500 | 卡片标题、item 标题 |
| `--text-subheading` | 18px | 1.4 | -0.005em | Inter 500 | 副标题 |
| `--text-body` | 15px | 1.55 | 0 | Inter 400 | 正文、描述、笔记 |
| `--text-caption` | 13px | 1.45 | 0 | Inter 400 | metadata、日期、来源 |
| `--text-num` | varies | 1.0 | 0 | JetBrains Mono 500 | XP、count、date |

**原则：** 层次靠**尺寸 + tracking**，不靠加粗。

---

## 4. Tokens — Spacing & Shape

**Base unit:** 4px · **Density:** comfortable

| Token | Value | 用途 |
|-------|-------|------|
| `--space-1` | 4px | icon-文字间距 |
| `--space-2` | 8px | 按钮 padding-y |
| `--space-3` | 12px | 卡片 padding-xs |
| `--space-4` | 16px | 卡片 padding-sm |
| `--space-6` | 24px | 卡片 padding-md |
| `--space-8` | 32px | section 间距 |
| `--space-12` | 48px | 大区块 |
| `--space-16` | 64px | hero padding |

**Max width:** 1280px（主内容），640px（侧栏）。

**Border radius:**

| 元素 | Radius | Token | 备注 |
|------|--------|-------|------|
| 按钮 | **8px** | `rounded-button` | 不做 pill |
| 卡片 | **8px** | `rounded-card` | 原 12px 偏 SaaS，古典星图册减到 8px 更像素描簿 |
| 模态 / 浮层 | **12px** | `rounded-modal` | 原 16px，模态本身 max-w-md 够用 |
| 成就徽章 | 50%（圆形）| `rounded-full` | |
| Chip / Tag | 4px | `rounded` | 小颗粒用最小值 |
| 输入框 / textarea | 4px | `rounded` | 同 chip |

> **Radius 是 token，不是建议值。** 别名 `rounded-button` / `rounded-card` / `rounded-modal` 直接写进 `tailwind.config.ts`，组件里不要散落 `rounded-[Npx]`。

---

## 5. 星云 · 主视图

### 5.1 状态编码（XP → 视觉）

XP 阶梯：5 → 15 → 30 → 50 → 100，**最后一级翻倍**（呼应 Publish 是真正的产出）。

**当前实现**（`StarCanvas.tsx` + `radiusForItem()`，以代码为准）：

| 视觉通道 | 规则 |
|---------|------|
| 颜色 | 第一 topic 的主题色；未分类 = `--bone-400` |
| 半径 | `6 + 0.7×√XP`，5 动作全完成 +2，上限 20 |
| 亮度 | `0.55 + (已完成动作数 / 5) × 0.45` |
| 5 动作全完成 | 金色光圈（`--gold`，opacity 0.5） |
| 选中 | 金色描环（半径 +8） |
| hover | 星体提亮 1.5x + 同色辉光 |

簇背景有该 topic 色的极淡辐射光晕（nebula 感），帮助定位 3 个簇。

> ⏳ 目标设计（未实现）：颜色改由状态主导（同簇内星点不带 topic 色，位置即分类），
> Publish 级为「星 + 4 道光芒」的 discrete 形态：

| 状态 | 累计 XP | 颜色 | 透明度 | 半径 | 形 | 触发动作 |
|------|--------|------|--------|------|----|---------|
| 0 · 刚抓来 | 0 | `--bone-400` | 0.4 | 1.5px | 单点 | （自动入云） |
| 1 · 👀 Watch | 5 | `--bone-200` | 0.6 | 2px | 单点 | 单击星 / Keep |
| 2 · 🔖 Save | 15 | `--bone-50` | 0.85 | 2.5px | 单点 | 收藏角标 / Star |
| 3 · 📝 Note | 30 | `--bone-50` + 微金 | 1.0 | 3px | 单点 | 写笔记 |
| 4 · 🛠 Build | 50 | `--gold` | 0.9 | 3.5px | 单点 + 极淡外晕 | 实际动手做 |
| 5 · 📢 Publish | 100 | `--gold` + `--shadow-glow` | 1.0 | 4.5px | **星 + 4 道光芒** | **发布——点亮时刻** |

### 5.2 空间编码（位置 = 话题）

- 3 个 topic 簇中心：AI 簇 / 一人公司簇 / 自我管理簇
- 力导向布局：item 向所属 topic 中心**吸引**，同簇内 item 互相**排斥**
- 布局由力模拟一次生成，结果缓存 localStorage（下次直接进入，无重新抖动）
- 无 topic 的 item 归入画布中央的「未分类」簇

> ⏳ 规划中（未实现）：多 topic item 落在两簇之间；用户手动拖动并记住位置

### 5.3 Triage · 3 个快速操作（不打开详情）

> ⏳ 规划中（未实现）。当前 triage 发生在 Drawer 内：点击星 → Item Detail → 5 动作。
> 云上没有 1-click 快捷操作。

目标设计：抓来即在云上（状态 0），用户可在云上**直接 1-click**：

| 动作 | 触发 | 效果 |
|------|------|------|
| ✅ Keep | 单击星体 | 状态 0 → 1（Watch），星亮一档 |
| ⭐ Star | hover 时 ⭐ 角标 | 状态 0 → 2（Save），直接跳 2 档 |
| ❌ Dismiss | hover 时 ❌ 角标 | 从星云消失，记入"已阅过 · 不感兴趣"；30 天后若该 item 再次 spike，自动召回（带"上次看过"标记） |

**Dismiss 不删数据**。已 Dismiss item 不再入云，直到真正再爆发。

### 5.4 双链 · 关系图谱

> ⏳ 规划中（未实现）。当前星云只画星点，不画任何连线。

| 关系 | 视觉 | 触发 |
|------|------|------|
| 自动双链 | 细线 `--dim-link` (1px) | 同 topic 自动连 |
| 手动双链 | 粗实线 `--solid-link` (2px) | 用户在 detail 面板里手动 link |

- 同 topic 1 个 item 自动连最多 3 个最近邻（避免视觉过载）
- 手动双链无限
- 鼠标悬停双链 → 浮出两端 item 标题

### 5.5 视口 & 缩放

> ⏳ 规划中（未实现）。当前画布固定 viewBox 1200×600，
> `preserveAspectRatio="xMidYMid meet"` 自适应视口，无缩放 / 平移。

- 默认 zoom = 1，鼠标滚轮 + cmd/ctrl 缩放（0.4x ~ 2.5x）
- 拖拽空白处平移
- 右上角"重置视角"按钮

---

## 6. Boss · 真实星座关卡

### 6.1 数据源

**v1 = IAU 88 星座**（88 个），按"主星数"分档：

| 档位 | 主星数 | 适合 Boss | 例 |
|------|--------|----------|-----|
| 小 | 3-4 | 1-3 个动作（轻量任务）| 南十字 4 星、天蝎主星 4 |
| 中 | 5-8 | 4-7 个动作（标准任务）| 猎户 7、仙后 5、天鹅 5 |
| 大 | 9+ | 8+ 个动作（史诗任务）| 大熊 7+、天龙 12、长蛇 9+ |

### 6.2 形态 = 真实星座

每个 Boss = 一个真实星座的**虚线轮廓**：
- N 个空心位置（按真实星座星数）
- 虚线连接（按真实星座的连线规则）
- 每次完成对应动作 → 点亮 1 颗

**不是装饰星空**——星座**专属于 Boss**，不和用户星云混。

### 6.3 分配规则（默认）

- **系统按动作数自动配**：用户建 Boss 时输入目标动作数，系统挑同档位星座
- **右键可换**：用户不喜欢当前星座可在 detail 面板换一个
- **已用过的不会重复**（除非用户主动重置）

### 6.4 命名

- Boss 名 = 用户的真实任务（"完成 5 篇公众号"）
- Boss 视觉 = 选定的真实星座（"猎户座"）
- 显示：`完成 5 篇公众号 · 猎户座`

### 6.5 进度视觉

- 虚线：`--bone-400` 1px dashed
- 已点亮位置：`--gold` 实心圆
- 进度数字：`3 / 7`（JetBrains Mono + tabular-nums）
- 进度条：**不用进度条**，用"已亮 / 总数"
- 截止日：JetBrains Mono 14px，到期前 24h 虚线变 `--warning`

### 6.6 完成

- 全部点亮那一刻：星座**一笔写完**（从 dashed 变实线 + 缓慢金色脉冲一次）
- 弹出"已发现 [Boss 名] · 对应星座" 成就卡片
- 星座从侧栏"活跃 Boss"列表消失
- **移入"星图册"区**（独立页面）

### 6.7 数据扩展（v2+）

88 个用完（约 1-2 年）后：
- 用户手画：拖点成图，自定义连线
- 程序化生成：按 N 个点 + 连接规则生成
- 复用真实星图：二十八宿、三垣、托勒密 48 星座等

---

## 7. Sky Atlas · 已发现星座区

**位置**：侧栏入口「📖 星图册」+ 独立页面 `/sky-atlas`。

### 7.1 页面布局

- 整页深墨蓝 vellum
- 已完成 Boss 散落为**小星座图案**（每个约 80-120px 容器）
- 按完成时间排序（最新在最上）
- 每个星座下方：
  - Boss 名（Fraunces 18px / 500）
  - 对应真实星座名（Inter 13px / 400，`--bone-200`）
  - 完成日期（JetBrains Mono 12px）
  - 一段你写的 note（可选，Inter 14px / 1.5）

### 7.2 视觉规则

- 完成星座 = 亮的金色 + 细描边
- 永远不用作"装饰星空"（不和主星云混）
- 没有任何星座重叠——按时间顺序网格排列

### 7.3 导览

- 顶部一个数字：`已发现 12 / 88`
- 完成第 88 个时显示特别庆祝——你的"完整星图册"达成

---

## 8. 5 Tab · 入站视图

> ⏳ 规划中（页面未实现）。5 个维度的标签数据已由 `compute-tags` 计算并写入
> snapshots，只差 UI 页面。当前 `ItemCard` 组件实际用于星云的 Item Detail Drawer。

5 Tab 是**外部世界**的视图，不是你的星云。

| Tab | 数据源 | 用途 |
|------|--------|------|
| Trending 榜 | 6 源 + trendingScore | "现在大家都在聊什么" |
| 短时间爆发 | 7 天增量 | "突然冒出来的" |
| 持续上升 | 30 天趋势 | "慢慢爬上来的" |
| 讨论密度 | 评论/讨论数 | "圈内讨论最多的" |
| 跨平台提及 | 跨多少源 | "多源都在提" |

**卡片 = Item Card**（不是星云元素）：

```
┌─────────────────────────────────────────────────┐
│ [source]  Title in Fraunces 500 / 20px   [••]  │  ← 2 个 topic dot
│  摘要 Inter 400 / 15px，2 行截断                │
│  ─────────────── hairline ───────────────       │
│  👀 7  🔖 12  📝 3  🛠 1  📢 0    5h ago · GH   │  ← 5 动作 + meta
│  [Triage: ✅ Keep] [⭐ Star] [❌ Dismiss]       │  ← 入站 quick action
└─────────────────────────────────────────────────┘
```

- 点击标题 → 打开 Item Detail 浮层
- 触发 Watch/Save/Note/Build/Publish → item 加入主星云
- Trigger 任何动作前，item 不在主星云上显示（注意：与当前实现不同——
  现在所有近期 item 都在云上，此规则随 5 Tab 页面一起落地时再对齐）

---

## 9. Item Detail 浮层

点击星云上的星 → 打开右侧 Drawer（桌面 `max-w-2xl`，移动端占满宽度），
ESC 或点遮罩关闭。

```
┌──────────────────────────────────────────┐
│  Source logo · 标题（Fraunces 20px）  ✕  │
│  ──────────── hairline ──────────────    │
│  摘要 / 全文（Inter 15px）                │
│  ──────────── hairline ──────────────    │
│  双链：X 手动 · Y 自动    [+ Add link]   │
│  ──────────── hairline ──────────────    │
│  5 动作：👀 🔖 📝 🛠 📢 （大图标）       │
│  ──────────── hairline ──────────────    │
│  笔记：已有 3 条 / [新建]                │
│  进度：XP / 状态 / 进入星云时间          │
└──────────────────────────────────────────┘
```

---

## 10. 动效 Tokens

| Token | 时长 | Easing | 触发 |
|-------|------|--------|------|
| `--motion-quick` | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | hover、focus |
| `--motion-base` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | tab 切换、triage 反馈 |
| `--motion-slow` | 600ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | XP 涨、boss 击破、星点亮 |
| `--motion-celebrate` | 1500ms | `cubic-bezier(0.16, 1, 0.3, 1)` | 升级、Boss 完成、成就解锁 |
| `--ease-in-out` | — | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认 |

**关键动效：**

| 场景 | 动效 | Token |
|------|------|-------|
| 星点亮（Publish） | 该星位置 + 4 道金色光芒扩散 + 远洋钟声 | `--motion-celebrate` |
| 状态升级 | 星半径放大 1.2x + 颜色渐变 + 短脉冲 | `--motion-slow` |
| Triage Dismiss | 星缩为 0 + 消散 | `--motion-base` |
| Boss 进度 | 虚线被"擦"出一段实线 | `--motion-slow` |
| Boss 完成 | 全部虚线 → 实线 + 金色脉冲 + 卡片滑入 | `--motion-celebrate` |
| 升级 | 星座背景渐亮 + Fraunces 大字淡入 | `--motion-celebrate` |
| Tab 切换 | 轻微旋转 + 淡入 | `--motion-base` |
| 卡片 hover | 上升 2px + 暖光描边 | `--motion-quick` |

`prefers-reduced-motion: reduce` 时所有动效降到 0ms，只保留 opacity。

---

## 11. 音效 Tokens

8 个音效，**每个 < 10KB**，受 `settings.sound_mode` 控制。

| 触发 | 声音 | 时长 |
|------|------|------|
| Keep / Watch | 极轻风铃 | 0.2s |
| Star / Save | 书页翻动 | 0.3s |
| Note | 羽毛笔划写 | 0.4s |
| Build | 木材 / 金属轻击 | 0.3s |
| **Publish** | **远洋钟声 + 弦乐上扬 + 金光粒子** | 0.8s |
| 升级 | 上行音乐盒 3 音 | 0.6s |
| **Boss 完成** | **低频海浪 + 短促凯旋 + 全星座脉冲** | 1.0s |
| 断 streak | 单音下行 | 0.4s |

**调性**：音乐盒、风铃、远洋钟声、纸页翻动、羽毛笔、海浪。
**禁**：8-bit、叮咚、电子音效。

---

## 12. 强度档位

| 档位 | 动效 | 音效 | 背景氛围 |
|------|------|------|----------|
| Off | 关闭所有 | 关闭 | 静态 vellum |
| Standard | 基础 4 项 | 关闭 | 静态 vellum |
| **Full+**（默认） | 全部 | 全部 | 5% 星点 + Full+ 时星座极慢绘制 |

用户在 Settings 调整。

---

## 13. 国际化 & 可访问性

- `zh-CN` 为主，`en` 兜底
- 关键文案双套：UI（菜单、按钮）+ 教程 / 空状态（"你的星图在等你点亮第一颗星"）
- 键盘导航全支持；ARIA 标签完整
- 色彩对比度 ≥ WCAG AA（bone-50 on ink-900 = 14.2:1）
- 音效默认 `off`（Standard 档），用户主动开
- 桌面优先；移动端**能读 + 关键操作（点星、Drawer 内 5 动作）能用**
- 星云视图提供"列表视图"切换（移动端 fallback）

---

## 14. Guidelines

### Do

- **Do** 用 `#0F1424` vellum 当所有 section 背景
- **Do** 状态用**尺寸 + 透明度**编码，不用纯颜色变化
- **Do** 所有标题用 Fraunces **不加粗**
- **Do** 数字（XP / Level / date）用 JetBrains Mono + tabular-nums
- **Do** Publish 那一刻同时触发：金色光圈 + 远洋钟声 + 星图多点一星
- **Do** Dismiss 永远不删数据，留 30 天"召回"机制
- **Do** 真实星座**专属于 Boss**，不和主星云混
- **Do** 已发现星座有专属页面，不叠加在主星云上

### Don't

- **Don't** 用渐变背景、玻璃拟态、纯白 SaaS 风格
- **Don't** 把 mist 紫作主色，它只是 topic signal
- **Don't** 加 emoji 当 icon（5 个 action 用 unicode emoji 是有意为之）
- **Don't** 用 `font-bold` 给标题
- **Don't** 用 shadow / border 给卡片做容器感
- **Don't** 把 streak 火焰放金色，那是 flame `#F4A261` 的专属
- **Don't** 显示"已达成 X / 100%"，Boss 进度只显示"3/12"（实/目标）
- **Don't** 把"真实星座"用作装饰星空——星座永远是 Boss 的壳

---

## 15. 实施补充规格（v1 实际实现与 §5.1 的差异）

§5.1 是设计稿，v1 落地时为了"沉浸感 / 震撼"做了三处放大调整。这节是**实际参数**——以后看代码 / 改代码以这节为准。

### 15.1 星体实际尺寸 & 透明度

| 项 | §5.1 spec | v1 实际 | 为什么改 |
|----|----------|---------|----------|
| 星半径 | 1.5-4.5px | **6-20px** | 1.5px 在 1920×1080 屏上肉眼不可见；6px 起步才有"星"感；满 XP ≈ 20px 是视觉锚点 |
| 透明度 | 0.4-1.0 | **0.55-1.0** | 0.4 配 6px 起步几乎看不见；0.55 是"能看见但明显不抢"的下限 |
| 5 动作完成 | 4.5px + 4 道光芒 | **r+5 金色光圈**（stroke 0.8 / opacity 0.5）| 真实星图没有"光芒"那种 UI 夸张感；金色光圈更"盖章" |
| 选中 | — | **r+8 金环**（stroke 1.5 / opacity 0.9）| 比完成光圈更亮更粗，避免混淆 |
| 颜色 | 状态色（bone→gold）| **始终是 topic 色** | 状态靠尺寸 + 透明度编码；色 = topic 分类（位置即分类） |

> 公式：星半径 = `6 + sqrt(totalXp) * 0.7`，5 动作全做 `+2`，封顶 20px。
> 公式：透明度 = `0.55 + (actionCount / 5) * 0.45`。

### 15.2 簇光晕（nebula 焦点）

DESIGN §0 禁"渐变背景"，但**没说禁前景装饰**。v1 在 3 个 topic 簇中心各放一个 r=220 的 `radialGradient`，作为 nebula 焦点：

```
AI 簇中心 (600, 110)   → #5FE0C7 三段渐变 (0.18 / 0.08 / 0)
一人公司 (960, 480)    → #E8B86F 同上
自我管理 (240, 480)    → #B8A4D4 同上
```

**约束**：
- 只用于主星云页 `/` 前景
- 不出现在 `/bosses` `/sky-atlas` `/settings` —— 避免和"真实星座"或表单视觉冲突
- 透明度上限 0.18（够看出"这里有簇"，不会变成"彩色雾团"）

### 15.3 背景星场（仅主星云页）

主星云背景叠两层 dot 模拟纵深，**不是真实星座**：

- 近景 `.starfield`：7 颗，1.2-1.5px，bone-50 opacity 0.4-0.7
- 远景 `.starfield-far`：18 颗，0.5px，bone-50 opacity 0.2-0.3
- 总计 ~25 颗，远少于星云主体（50+ 颗）
- 极淡、不闪烁（无 `twinkle` 动效，避免分散注意力）

**约束**：
- 仅出现在 `/`
- **不要**在 `/bosses`（那里有真实星座）或 `/sky-atlas`（那是已发现星座册）用
- 永远不画"连线"，保持"单点散布"感

### 15.4 Item Detail Drawer 视觉

DESIGN §9 是文字描述，v1 落地的视觉规则：

- **容器**：固定右侧 50% 宽（`max-w-2xl`），全屏高，**左边压一层 `bg-ink-900/60` 蒙层**
- **border**：`border-l border-ink-700` —— 不用 shadow 浮起来
- **header**：`px-5 py-3`，左 `text-caption text-bone-400`（不用 uppercase tracking-widest，那是 SaaS 风）
- **关闭按钮**：`rounded-button` (8px)，`text-bone-400 hover:text-bone-50`
- **drawer 本身**：不用 `shadow-2xl`（per DESIGN 14 Don't）

### 15.5 Item Card 视觉（5 Tab / Drawer 内通用）

- 容器：`.hand-drawn-border`（`bg-ink-800/50` + 1px ink-700 border + 4px radius）—— 不是用 token `rounded-card`，因为它是"inline 在抽屉里"的小卡，不是 section card
- **标题**：`font-display text-heading-sm` (20px)，**移动端不缩**（DESIGN 没有移动端断点，桌面 20px 一致到底）
- **摘要**：`text-body` (15px)，`line-clamp-2`
- **meta 行**：`text-caption text-bone-400`（13px），不用 `text-[10px] uppercase`
- **topic 标签**：4px radius，1px border `topic-color/30`，文字 10px uppercase tracking-wider —— **是 chip 不是 text**，10px 在 chip 内可读
- **5 动作**：每个 8px radius (token `rounded-button`)，24px 高，icon + 文字 + 数字三件套

### 15.6 Action Modal 视觉

Note / Publish 两个模态的视觉规则（DESIGN §9 没写细节）：

- 容器：`rounded-modal` (12px)，**不用 shadow-2xl**（与 Drawer 同样的"古典"原则）
- 标题：`font-display text-heading-sm` (20px)，Fraunces 400
- 描述：`text-caption text-bone-400` (13px)
- 输入：`.hand-drawn-border` 风格，focus 时 border 变 `gold/50`
- 模态外层蒙层：`bg-ink-900/80`
- **主按钮配色**：
  - Note → `border-gold/30 bg-gold/10 text-gold`（中等重要度）
  - Publish → **`border-gold bg-gold/15 text-gold` + Fraunces 字体**（最重要，必须比 Note 更金更显眼）
  - **不要**用 celestial 给 Publish，celestial 是 AI topic signal，**不是** Publish 色

### 15.7 CanvasChips 视觉

- 容器：无背景无 border，浮在画布上
- 每 chip：4px 圆点（6px 直径） + 文字（13px `text-caption`）+ 计数（10px `.num text-bone-400`）
- chip 间距：`gap-x-3 gap-y-1.5`
- 颜色：**用 `TOPIC_COLORS` token，不用 raw hex**（之前的 #5FE0C7 等是 bug）
- 激活态：圆点 `scale-1.4`，文字 `text-bone-50`，非激活 `text-bone-200` opacity 0.55
- hover：opacity → 1

### 15.8 Meta / Label 文字规则

| 场景 | 用 | 不用 |
|------|---|------|
| Drawer header "Item Detail" | `text-caption text-bone-400` | ~~`text-[10px] uppercase tracking-widest`~~ |
| StarCanvas 右上 "X 颗 · Y XP" | `text-caption text-bone-200` | ~~`text-[10px] uppercase tracking-widest`~~ |
| Item Card meta 行 | `text-caption text-bone-400` | ~~`text-[10px] uppercase tracking-widest`~~ |
| Settings 表单 label | `text-caption text-bone-200` | ~~`text-xs uppercase`~~ |

> **10px + uppercase + tracking-widest 是 SaaS Dashboard 风格**，不适合本产品的"古星图册"气质。仅在**真正技术 UI**（键盘快捷键浮层、API key 框）才用。

### 15.9 Mist 紫的实际用法

DESIGN §2 说 mist "只作辅助色，不作主色"。v1 的具体定义：

- ✓ **作 self-mgmt 簇内所有星点的颜色**（簇内颜色统一，方便和位置 / 透明度组合编码状态）
- ✓ **作 self-mgmt 卡片左缘 1px 细条**（已实现）
- ✗ **不作页面级 accent 色**（按钮、链接、边框）
- ✗ **不与 gold 同框出现**（两种"重要色"同框会打架）

### 15.10 首页背景：深空照片 + 椭圆 vignette

§0 写"基底 = `#0F1424` 深墨蓝 vellum"。v1.1 起**主页 `/` 引入一张深空天体照**做底图（用户自备图，1920×1080，青蓝星云调），但仍保留 vellum 气质。具体规则：

**层叠（从底到顶）：**
1. `bg-ink-900` —— 兜底
2. `.starfield-photo` —— 深空照片，CSS `background-image: url('/starfield-bg.jpg')`，`background-size: cover`
3. `.starfield-veil` —— **椭圆 vignette**，用 `radial-gradient(ellipse 80% 70% at 50% 45%, rgba(15,20,36,0.30) 0%, rgba(15,20,36,0.55) 55%, rgba(15,20,36,0.82) 100%)` 把中心 30% 蒙层、边缘 82% 蒙层
4. `.starfield` —— 近景 7 颗 CSS dot
5. `.starfield-far` —— 远景 18 颗 CSS dot
6. SVG 簇光晕 + 用户星点

**照片处理：**
- 桌面：1920×1080 JPEG q78（~530KB）
- 移动端（`max-width: 640px`）：960×540 JPEG q75（~150KB）
- CSS `filter: saturate(0.7) brightness(0.85)` —— 降饱和 + 压暗，避免照片太鲜艳抢戏

**用户星点为应对亮底图做的调整：**
- 加 `stroke="rgba(15, 20, 36, 0.6)"` 0.8px 细深色描边（保证在亮星云上仍有边）
- 加 `filter: drop-shadow(0 0 2px rgba(15,20,36,0.5))` 暗晕
- 簇光晕 inner opacity 0.18 → **0.30**，mid 0.08 → **0.12**（亮底上需要更显）
- 选中金环 stroke 1.5 → **2.0**，完成金环 stroke 0.8 → **1.2**

**约束：**
- 照片**只用于主页 `/`**
- **不用于** `/bosses` / `/quests` / `/settings` / `/skills` —— 那些页面保持 vellum 纯色背景，避免和功能视觉抢戏
- 换图原则：深空青蓝调、星点密集但不能太亮（有 89% 像素亮度 >40 的话中心要靠 vignette 压住）
- 不做"实拍银河"以外的题材（不放地球 / 城市夜景 / 写实星图册插画）

**对应资源：**
- `apps/web/public/starfield-bg.jpg`（桌面）
- `apps/web/public/starfield-bg-sm.jpg`（移动端）

---

> **以后 v1.x 改 UI 之前先看这节。** §15 是 §5.1 / §4 / §9 / §0 的"实施注释"，不是新设计。

---

> **AI agent 读这版就够了。** 颜色、字体、间距、动效、音效、组件、Do/Don't 全在这里。Tailwind config 里的 token 名和这里一一对应。
