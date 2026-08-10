# DATA MODEL

> 6 张表，覆盖：热点条目、每日快照、用户动作、任务、成就、配置。

## 概览

```
items ←—— snapshots  (每日）
  ↑
  └—— actions (用户的 5 个动作)
        ↓
        ↑—— achievements
        ↓
        └—— quests (每日任务 + Boss)
  
settings  (单行配置)
daily_stats  (每日聚合，streak 判定用)
```

## 表结构

### `items` — 一条热点条目

```sql
create table items (
  id text primary key,                          -- sha1(url) 前 16 位
  url text not null unique,
  title text not null,
  source text not null,                          -- github / ph / hn / reddit / wechat / newsletter
  source_id text,
  author text,
  summary text,
  description text,
  image_url text,
  language text,
  topics text[] default '{}',                    -- ['AI','one-person','self-mgmt']
  matched_keywords text[] default '{}',
  published_at timestamptz,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  metrics jsonb default '{}'::jsonb,             -- {stars, comments, upvotes, ...}
  metadata jsonb default '{}'::jsonb,
  archived boolean default false
);
create index items_source_idx on items (source);
create index items_topics_gin on items using gin (topics);
create index items_last_seen_idx on items (last_seen_at desc);
```

**id 策略**：用 `sha1(url).slice(0,16)` 作为稳定 id。同一条 item 被多次抓取时 upsert 不会重复。

### `snapshots` — 每日快照

```sql
create table snapshots (
  id bigserial primary key,
  item_id text references items(id) on delete cascade,
  taken_at date not null,
  metrics jsonb default '{}'::jsonb,
  tag_scores jsonb default '{}'::jsonb,          -- 5 标签的分数
  unique (item_id, taken_at)
);
create index snapshots_taken_at_idx on snapshots (taken_at desc);
```

**为什么需要**：算"短时间爆发"和"持续上升"标签必须看历史。前端 dashboard 展示"今天"，但底层要存 30+ 天。

### `actions` — 用户对 item 的动作

```sql
create table actions (
  id bigserial primary key,
  item_id text references items(id) on delete cascade,
  action_type text not null check (action_type in ('watch','save','note','build','publish')),
  note text,                                      -- 用户写的笔记
  output_ref text,                                -- publish 时填的输出 URL
  output_title text,                              -- publish 时填的输出标题
  xp_earned int not null default 0,
  created_at timestamptz default now()
);
create index actions_item_idx on actions (item_id);
create index actions_created_idx on actions (created_at desc);
create index actions_type_idx on actions (action_type);
```

### `quests` — 每日任务 + Boss

```sql
create table quests (
  id bigserial primary key,
  quest_type text not null check (quest_type in ('daily','boss')),
  title text not null,
  description text,
  target_count int default 1,
  current_count int default 0,
  related_topic text,                             -- AI / one-person / self-mgmt
  related_item_id text references items(id),
  started_at timestamptz default now(),
  deadline timestamptz,
  completed_at timestamptz,
  status text default 'active' check (status in ('active','completed','abandoned'))
);
create index quests_type_status_idx on quests (quest_type, status);
```

**注意**：Boss 也存这张表（quest_type = 'boss'），简化模型。Boss 的 current_count 由 actions 触发表更新。

### `achievements` — 成就解锁

```sql
create table achievements (
  id text primary key,                            -- 'first_save', '100_day_streak' ...
  unlocked_at timestamptz default now(),
  related_action_id bigint references actions(id)
);
```

### `settings` — 单行配置

```sql
create table settings (
  id int primary key default 1 check (id = 1),
  intensity_level int default 2,                  -- 0-4
  sound_mode text default 'publish',              -- off/action/publish/all
  animation_mode text default 'standard',         -- off/subtle/standard/rich
  daily_quest_count int default 3,
  streak_grace_days int default 1,
  reminder_time time,
  ambient_enabled boolean default false,
  publish_reminder_days int default 14,
  enabled_sources text[] default '{github,ph,hn,reddit,newsletter,wechat}',
  keywords jsonb default '{}'::jsonb,
  bosses jsonb default '[]'::jsonb,
  locale text default 'zh',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**keywords 形态**：
```json
{
  "AI": ["AI Agent", "LLM 应用", "WaytoAGI", "DataWhale", ...],
  "one-person": ["一人公司", "solopreneur", ...],
  "self-mgmt": ["个人知识管理", "GTD", ...]
}
```

**bosses 形态**：
```json
[
  {
    "id": "boss_001",
    "name": "公众号首发：开篇 1 篇",
    "description": "写完第一篇公众号文章",
    "target": 1,
    "current": 0,
    "deadline": "2026-09-30",
    "topic": "one-person",
    "created_at": "2026-08-10T00:00:00Z"
  }
]
```

### `daily_stats` — 每日聚合

```sql
create table daily_stats (
  day date primary key,
  xp_earned int default 0,
  actions_count int default 0,
  publish_count int default 0,
  quests_completed int default 0,
  items_seen int default 0
);
```

**为什么**：streak 判定需要查"今天有没有动作 / 有没有 Publish"。直接查 actions 表也行，但聚合后更快。

## 关键查询示例

### 5 个 Tab 数据查询

**Trending 榜（当天）**：
```sql
select i.*, s.tag_scores->'trending' as trending_score
from items i
join snapshots s on s.item_id = i.id
where s.taken_at = current_date
order by (s.tag_scores->'trending')::numeric desc
limit 50;
```

**短时间爆发（≥7 天历史）**：
```sql
select i.*, s.tag_scores->'spike' as spike_score
from items i
join snapshots s on s.item_id = i.id
where s.taken_at = current_date
  and exists (
    select 1 from snapshots s2
    where s2.item_id = i.id and s2.taken_at = current_date - interval '7 days'
  )
order by (s.tag_scores->'spike')::numeric desc
limit 50;
```

**持续上升（≥30 天历史）**：
```sql
select i.*, s.tag_scores->'rise' as rise_score
from items i
join snapshots s on s.item_id = i.id
where s.taken_at = current_date
  and exists (
    select 1 from snapshots s2
    where s2.item_id = i.id and s2.taken_at = current_date - interval '30 days'
  )
order by (s.tag_scores->'rise')::numeric desc
limit 50;
```

**讨论密度**：按 `metrics->'comments'` 排序跨所有源。
**跨平台提及**：item 出现在 ≥2 个 source（或同 source 不同 source_id 标识为同一内容）。

### 用户当前 streak

```sql
with days as (
  select day, publish_count, actions_count
  from daily_stats
  where day <= current_date
  order by day desc
  limit 365
),
action_streak as (
  select count(*) as streak
  from (
    select day, actions_count,
           sum(case when actions_count = 0 then 1 else 0 end)
             over (order by day desc) as gap
    from days
  ) t
  where gap = 0
),
publish_streak_weeks as (
  -- 类似逻辑，但按周聚合
)
select * from action_streak;
```

实际实现时 Streak 计算在应用层（lib/game.ts），SQL 只负责查数。

## 迁移

- `supabase/migrations/0001_init.sql` 包含全部 6 张表
- 后续 schema 变更用追加迁移：`0002_xxx.sql`、`0003_xxx.sql`
