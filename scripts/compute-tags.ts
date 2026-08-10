import 'dotenv/config';
// 计算 5 个标签的分数
import { createClient } from '@supabase/supabase-js';
import { trendingScore, spikeScore, riseScore, densityScore, crossScore } from '@radar-quest/shared';

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().slice(0, 10);

  // 1. Trending：按 source 内排名
  const { data: todayItems } = await supabase
    .from('snapshots')
    .select('item_id, items(source)')
    .eq('taken_at', today);

  if (!todayItems) return;

  // 按 source 分组
  const bySource = new Map<string, string[]>();
  for (const row of todayItems as any[]) {
    const src = row.items?.source ?? 'unknown';
    if (!bySource.has(src)) bySource.set(src, []);
    bySource.get(src)!.push(row.item_id);
  }

  for (const [source, ids] of bySource) {
    for (let i = 0; i < ids.length; i++) {
      const score = trendingScore(i + 1, ids.length);
      await supabase.rpc('update_tag_score', {
        p_item_id: ids[i],
        p_taken_at: today,
        p_tag: 'trending',
        p_score: score
      }).then(() => {}, () => {}); // RPC 可能没建，忽略
    }
  }

  // 2. Spike：过去 7 天增量
  const { data: recent } = await supabase
    .from('snapshots')
    .select('item_id, taken_at, metrics')
    .gte('taken_at', new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10))
    .lte('taken_at', today);

  // 3. Rise：过去 30 天
  // 4. Density：评论数
  // 5. Cross：跨多少个源
  // 完整实现在 Phase 4

  console.log('Tags computed (partial — full implementation in Phase 4)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
