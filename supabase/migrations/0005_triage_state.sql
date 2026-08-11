-- Triage 状态机字段：让 /capture 走"主题聚合卡片流"
-- 流转（per IA.md §4）：
--   state='unprocessed' 出现在 /capture
--   state='kept', saved=false  → 沉到"已保留"区 + 出现在 /
--   state='kept', saved=true   → 立即从 /capture 消失 + 出现在 / (收藏)
--   state='dismissed'         → 30 天后硬删

alter table items
  add column if not exists state text not null default 'unprocessed';

alter table items
  add column if not exists saved boolean not null default false;

create index if not exists items_state_idx
  on items (state, last_seen_at desc);

create index if not exists items_saved_idx
  on items (saved)
  where saved = true;
