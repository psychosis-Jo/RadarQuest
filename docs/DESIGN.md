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
│  HEADER: Level · 今日 XP · Streak · 活跃 Boss          │
├─────┬────────────────────────────────────────────┬───────┤
│ 侧  │                                            │ 侧    │
│ 栏  │           ★  ★    ★      ★                 │ 栏    │
│     │     ★  ·  ★        ·  ★                    │       │
│ 今 │     ·  ★  ·  ★   ·  ★  ·   ★                │ 技   │
│ 日 │       ·  ·  ★  ·  ★                        │ 能   │
│ 任 │    ★  ·  ★  ·   ★                           │ 树   │
│ 务 │       ·       ·                              │       │
│     │  ── 自动双链（细）──                        │ 活   │
│ Boss│  ══ 手动双链（粗）══                        │ Boss │
│     │                                            │       │
│     │  ⚙ 设置  📖 星图册（完成 Boss）             │       │
└─────┴────────────────────────────────────────────┴───────┘
       ←lg 切换为底部 tab bar：星云 / 5 Tab / 任务 / 我的
```

**主视图 = 你的星云**（不是 5 Tab 列表）
- 5 Tab = 外部世界的"入站视图"（Trending / Spike / Rise / Density / Cross）
- 星云 = 你已留下痕迹的内部世界

**流转**：
- 抓来 + topic 匹配 → 进入星云（状态 0，灰白小点）
- 抓来 + topic 不匹配 → 不进入星云（在 5 Tab 仍可见，但不打扰你）
- 用户在星云上做 triage（保留/收藏/忽略）→ 状态升级或消失
- 点击星 → 打开 Item Detail 浮层 → 5 动作可触发
- 完成 Boss → 星座从星云移入"星图册"

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
- 同一簇内星点不带 topic 色（位置即分类，色 = 状态）

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

| 元素 | Radius | 备注 |
|------|--------|------|
| 按钮 | 8px | 不做 pill |
| 卡片 | 12px | |
| 模态 / 浮层 | 16px | |
| 成就徽章 | 50%（圆形）| |

---

## 5. 星云 · 主视图

### 5.1 状态编码（XP → 视觉）

XP 阶梯：5 → 15 → 30 → 50 → 100，**最后一级翻倍**（呼应 Publish 是真正的产出）。

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
- 同 topic item 距离近；多 topic item 在两簇之间，偏向占比高的 topic
- 用户手动拖动 → 位置被记住（破坏力平衡，下次回到拖动点附近）

### 5.3 Triage · 3 个快速操作（不打开详情）

抓来即在云上（状态 0），用户可在云上**直接 1-click**：

| 动作 | 触发 | 效果 |
|------|------|------|
| ✅ Keep | 单击星体 | 状态 0 → 1（Watch），星亮一档 |
| ⭐ Star | hover 时 ⭐ 角标 | 状态 0 → 2（Save），直接跳 2 档 |
| ❌ Dismiss | hover 时 ❌ 角标 | 从星云消失，记入"已阅过 · 不感兴趣"；30 天后若该 item 再次 spike，自动召回（带"上次看过"标记） |

**Dismiss 不删数据**。已 Dismiss item 不再入云，直到真正再爆发。

### 5.4 双链 · 关系图谱

| 关系 | 视觉 | 触发 |
|------|------|------|
| 自动双链 | 细线 `--dim-link` (1px) | 同 topic 自动连 |
| 手动双链 | 粗实线 `--solid-link` (2px) | 用户在 detail 面板里手动 link |

- 同 topic 1 个 item 自动连最多 3 个最近邻（避免视觉过载）
- 手动双链无限
- 鼠标悬停双链 → 浮出两端 item 标题

### 5.5 视口 & 缩放

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
- Trigger 任何动作前，item 不在主星云上显示

---

## 9. Item Detail 浮层

点击星云上的星 / 5 Tab 卡片标题 → 打开右侧浮层（桌面）或全屏（移动）。

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
- 桌面优先；移动端**能读 + 关键操作（5 Tab triage、Watch/Save/Note）能用**
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

> **AI agent 读这版就够了。** 颜色、字体、间距、动效、音效、组件、Do/Don't 全在这里。Tailwind config 里的 token 名和这里一一对应。
