-- quest 对应的动作类型：完成 quest 等价于对 related_item 做一次该 action
-- 写入 actions 表后，recordAction 的去重逻辑会保证 XP/进度一致
alter table quests
  add column action_type text
  check (action_type in ('watch','save','note','build','publish'));
