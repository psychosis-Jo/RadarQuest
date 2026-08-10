import 'dotenv/config';
// 恢复被破坏性 seed 误删的用户自建星座
// 幂等：已有的不覆盖，没有的才补
import { createClient } from '@supabase/supabase-js';
import { pickConstellationForBoss } from '../packages/shared/src/constellations';

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: settings, error } = await supabase.from('settings').select('bosses').eq('id', 1).single();
  if (error) {
    console.error('Failed to read settings:', error.message);
    process.exit(1);
  }
  const bosses: any[] = settings?.bosses ?? [];
  console.log(`Current bosses in DB: ${bosses.length}`);
  for (const b of bosses) console.log(`  - ${b.id}  ${b.name}  status=${b.status ?? '(none)'}  target=${b.target}`);

  // 缺哪些要补的（按 name 判重）
  const wanted: Array<Omit<any, 'id' | 'created_at' | 'const_id' | 'const_tier'>> = [
    {
      name: 'AI 100 作品',
      description: '做 100 个 AI 相关的作品（公众号文章 / 开源项目 / 工具）',
      target: 100,
      current: 0,
      deadline: '2026-12-31',
      topic: 'AI',
      status: 'active'
    }
  ];

  const usedConstIds = bosses
    .filter((b: any) => b.status === 'active' || !b.status)
    .map((b: any) => b.const_id)
    .filter(Boolean);

  const next = [...bosses];
  let added = 0;
  for (const w of wanted) {
    if (bosses.some((b: any) => b.name === w.name)) {
      console.log(`- "${w.name}" 已存在，跳过`);
      continue;
    }
    const c = pickConstellationForBoss(w.target, usedConstIds);
    if (!c) {
      console.warn(`! "${w.name}" 找不到合适的星座（tier 用完？），手动指定`);
    }
    const id = `boss_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    next.push({
      ...w,
      id,
      created_at: new Date().toISOString(),
      ...(c ? { const_id: c.id, const_tier: c.tier } : {})
    });
    if (c) usedConstIds.push(c.id);
    added++;
    console.log(`+ "${w.name}"  target=${w.target}  topic=${w.topic}  const_id=${c?.id ?? '(none)'}`);
  }

  if (added === 0) {
    console.log('\nNothing to restore.');
    return;
  }

  // 干跑（dry-run）模式：默认不写，--write 真的写
  const write = process.argv.includes('--write');
  if (!write) {
    console.log(`\nDRY RUN: would add ${added} boss(es). Re-run with --write to apply.`);
    return;
  }

  const { error: upErr } = await supabase
    .from('settings')
    .update({ bosses: next, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (upErr) {
    console.error('Update failed:', upErr.message);
    process.exit(1);
  }
  console.log(`\n✓ Restored ${added} boss(es).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
