# Backlog — 明确推迟到后续版本的事

> 不在当前 sprint 做。**先记录在案，避免忘掉**，等对应 milestone 再开。
> 任何"以后做"的话，都加到这个文件，不要只在对话里讲。

---

## v3 — Triage（管理星云里的星）

用户原话：「每一颗星星其实都是抓取到的内容，而这些内容我是可以保留或者删除的」

需要做的事：
- [ ] `items` 表加 `archived` boolean（默认 false）
- [ ] 星云默认只显示 `archived = false` 的 item
- [ ] Drawer 加"归档"按钮（点 → 标记 archived = true → 软删）
- [ ] 软删 30 天后自动硬删（"留 30 天召回机制"，per DESIGN.md）
- [ ] 设置页加"已归档"入口，30 天内可召回
- [ ] 已完成全部 5 动作的星可永久收藏（区别于归档）

## v2.x — 性能与精修

- [ ] 力学布局从 client 改到 **server 预计算**（fetch 时算位置写 DB）
  - 现状：客户端 d3-force + localStorage
  - 原因：第一版优先视觉；多设备同步、性能极致时才上服务端
- [ ] Pan / zoom 画布（拖动空白平移，滚轮缩放）
- [ ] Hover tooltip 自定义（当前用浏览器原生 `<title>`，简陋）
- [ ] 已完成 5 动作的星，缓慢 twinkle（呼吸感）
- [ ] 移动端降级：保留卡片墙 + 顶部 banner「星云视图需桌面端」

## v3+ — 真正"星图册"

- [ ] Boss 完成后的"已发现"页面（独立路由，不叠加在主星云上）— per DESIGN.md §1
- [ ] 用户星云里的双链：自动（同 topic）+ 手动（用户拖线）— per DESIGN.md §1
- [ ] 真实 88 星座的 SVG 艺术（替代当前的"const_id 字符串"） — per DESIGN.md §9
- [ ] 已发现星座的专属页面（被点亮星座的"历史"页）

## v3+ — 动效与音效（per DESIGN.md §10 §11）

- [ ] XP 涨时的金色光圈 + 远洋钟声
- [ ] Publish 那一刻：星位置 + 4 道金色光芒 + 钟声
- [ ] Boss 完成：全星座脉冲 + 凯旋音
- [ ] Triage dismiss：星缩为 0 + 消散
- [ ] 8 个音效资源（每个 < 10KB）：风铃、书页、羽毛笔、木材、远洋钟声、上行音乐盒等
- [ ] `settings.sound_mode` 接到这些音效

## v3+ — 信息架构扩展

- [ ] 移动端底部 tab bar（星云 / 5 Tab / 任务 / 我的）— per DESIGN.md §1
  - 注意：用户决定"5 Tab 不要了"，所以这个 tab bar 实际应该是（星云 / 任务 / 星座 / 我的）
- [ ] 每日任务改为"主题均衡 + 难度混合"的更智能生成
- [ ] 任务完成链路打通到 5 动作（已完成 part of work）

## v3+ — 数据源扩展

- [ ] X (Twitter) 抓取
- [ ] 公众号 5+ 个账号后，UI 加账号管理增强（分组、标签）
- [ ] Newsletter feed 加 OPML 导入

## v3+ — 其他

- [ ] RSS 订阅输出（让别人订阅我的雷达）
- [ ] 移动端 PWA（offline + add to home screen）
- [ ] i18n：英文界面（不只是中文 + 英文双套）
- [ ] README + 开源声明（MIT）
- [ ] 把模板仓拆成 starcatcher-template + starcatcher（个人数据）

## v2 — Triage UX 续（用户已说先不做）

- [ ] 星云主页加"保留 / 收藏 / 忽略"按钮（Drawer 内），复用 `/api/items/[id]/triage`
  - 现状：`state` + `saved` 字段已就绪，`/capture` 三动作已接好；星云主页只展示 `state='kept'`，但暂不能在云里直接 triage
  - 决策（v1.2 → v2）：先靠 `/capture` 流程把数据走通；星云内 triage 等用户实际用一段时间再决定 UI
