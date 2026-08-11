import 'dotenv/config';
// 给新用户预置示例数据
//
// 安全策略：upsert + onConflict 会把整行覆盖，导致用户自建的数据（星座/关键词等）丢失
// 改为：
//   - 没有 settings 行：完整插入默认值
//   - 已有 settings 行：只补缺字段（== null），绝不动用户数据
import { createClient } from '@supabase/supabase-js';
import { pickConstellationForBoss } from '../packages/shared/src/constellations';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function makeSampleBoss() {
  const c = pickConstellationForBoss(1, []);
  const base = {
    id: 'boss_001',
    name: '公众号首发：开篇 1 篇 1000+ 字',
    description: '用 StarCatcher 的输出来完成你的第一篇公众号文章',
    target: 1,
    current: 0,
    deadline: '2026-12-31',
    topic: 'one-person',
    status: 'active' as const,
    created_at: new Date().toISOString()
  } as any;
  if (c) {
    base.const_id = c.id;
    base.const_tier = c.tier;
  }
  return base;
}

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 加载默认配置
  const keywords = JSON.parse(await readFile(join(__dirname, '..', 'data', 'keywords.default.json'), 'utf-8'));
  const sources = JSON.parse(await readFile(join(__dirname, '..', 'data', 'sources.default.json'), 'utf-8'));

  // 先查 settings 是否存在
  const { data: existing } = await supabase.from('settings').select('*').eq('id', 1).single();

  if (!existing) {
    // 新用户：完整默认值
    const { error } = await supabase.from('settings').insert({
      id: 1,
      intensity_level: 2,
      sound_mode: 'publish',
      animation_mode: 'standard',
      daily_quest_count: 3,
      streak_grace_days: 1,
      ambient_enabled: false,
      publish_reminder_days: 14,
      enabled_sources: ['github', 'ph', 'hn', 'reddit', 'newsletter', 'wechat'],
      keywords,
      sources,
      bosses: [makeSampleBoss()],
      locale: 'zh'
    });
    if (error) {
      console.error('Settings seed failed:', error.message);
      process.exit(1);
    }
    console.log('New settings row created with defaults');
    return;
  }

  // 已有 settings 行：只补缺字段，绝不覆盖用户数据
  const patches: Record<string, any> = { updated_at: new Date().toISOString() };
  const setIfNull = (key: string, val: any) => {
    if (existing[key] == null) patches[key] = val;
  };
  setIfNull('intensity_level', 2);
  setIfNull('sound_mode', 'publish');
  setIfNull('animation_mode', 'standard');
  setIfNull('daily_quest_count', 3);
  setIfNull('streak_grace_days', 1);
  setIfNull('ambient_enabled', false);
  setIfNull('publish_reminder_days', 14);
  setIfNull('enabled_sources', ['github', 'ph', 'hn', 'reddit', 'newsletter', 'wechat']);
  setIfNull('keywords', keywords);
  setIfNull('sources', sources);
  setIfNull('locale', 'zh');
  // bosses 数组为空时也补一个 sample，否则不动
  if (existing.bosses == null || (Array.isArray(existing.bosses) && existing.bosses.length === 0)) {
    patches.bosses = [makeSampleBoss()];
  }

  const changedKeys = Object.keys(patches).filter(k => k !== 'updated_at');
  if (changedKeys.length === 0) {
    console.log('Settings already initialized, no patches needed');
    return;
  }

  const { error } = await supabase.from('settings').update(patches).eq('id', 1);
  if (error) {
    console.error('Settings patch failed:', error.message);
    process.exit(1);
  }
  console.log(`Settings patched (existing data preserved): ${changedKeys.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
