import 'dotenv/config';
// 给新用户预置 3 天的示例数据
// 完整实现在 Phase 9
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 加载默认配置
  const keywords = JSON.parse(await readFile(join(__dirname, '..', 'data', 'keywords.default.json'), 'utf-8'));

  // 初始化 settings
  const { error } = await supabase.from('settings').upsert({
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
    bosses: [
      {
        id: 'boss_001',
        name: '公众号首发：开篇 1 篇 1000+ 字',
        description: '用 Radar Quest 的输出来完成你的第一篇公众号文章',
        target: 1,
        current: 0,
        deadline: '2026-12-31',
        topic: 'one-person',
        created_at: new Date().toISOString()
      }
    ],
    locale: 'zh'
  }, { onConflict: 'id' });

  if (error) {
    console.error('Settings seed failed:', error.message);
    process.exit(1);
  }
  console.log('Settings seeded');
  console.log('Note: items / actions seed in Phase 9 (sample data)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
