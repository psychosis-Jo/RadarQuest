-- 信源配置：每个平台的 enable + config 全部存到 settings.sources
-- 结构跟 data/sources.default.json 一致
-- 第一次跑 fetch.ts 或 seed-sample.ts 时，settings.sources 为 null，
-- 会回退到 data/sources.default.json
alter table settings
  add column sources jsonb default null;
