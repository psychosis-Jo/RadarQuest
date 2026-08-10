-- Radar Quest · initial schema
-- 6 tables: items, snapshots, actions, quests, achievements, settings, daily_stats

-- 1. items
create table items (
  id text primary key,
  url text not null unique,
  title text not null,
  source text not null,
  source_id text,
  author text,
  summary text,
  description text,
  image_url text,
  language text,
  topics text[] default '{}',
  matched_keywords text[] default '{}',
  published_at timestamptz,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  metrics jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  archived boolean default false
);
create index items_source_idx on items (source);
create index items_topics_gin on items using gin (topics);
create index items_last_seen_idx on items (last_seen_at desc);

-- 2. snapshots
create table snapshots (
  id bigserial primary key,
  item_id text references items(id) on delete cascade,
  taken_at date not null,
  metrics jsonb default '{}'::jsonb,
  tag_scores jsonb default '{}'::jsonb,
  unique (item_id, taken_at)
);
create index snapshots_taken_at_idx on snapshots (taken_at desc);
create index snapshots_item_idx on snapshots (item_id);

-- 3. actions
create table actions (
  id bigserial primary key,
  item_id text references items(id) on delete cascade,
  action_type text not null check (action_type in ('watch','save','note','build','publish')),
  note text,
  output_ref text,
  output_title text,
  xp_earned int not null default 0,
  created_at timestamptz default now()
);
create index actions_item_idx on actions (item_id);
create index actions_created_idx on actions (created_at desc);
create index actions_type_idx on actions (action_type);

-- 4. quests
create table quests (
  id bigserial primary key,
  quest_type text not null check (quest_type in ('daily','boss')),
  title text not null,
  description text,
  target_count int default 1,
  current_count int default 0,
  related_topic text,
  related_item_id text references items(id),
  started_at timestamptz default now(),
  deadline timestamptz,
  completed_at timestamptz,
  status text default 'active' check (status in ('active','completed','abandoned'))
);
create index quests_type_status_idx on quests (quest_type, status);

-- 5. achievements
create table achievements (
  id text primary key,
  unlocked_at timestamptz default now(),
  related_action_id bigint references actions(id)
);

-- 6. settings (singleton)
create table settings (
  id int primary key default 1 check (id = 1),
  intensity_level int default 2,
  sound_mode text default 'publish',
  animation_mode text default 'standard',
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

-- 7. daily_stats
create table daily_stats (
  day date primary key,
  xp_earned int default 0,
  actions_count int default 0,
  publish_count int default 0,
  quests_completed int default 0,
  items_seen int default 0
);

-- 8. insert default settings row
insert into settings (id) values (1) on conflict (id) do nothing;
