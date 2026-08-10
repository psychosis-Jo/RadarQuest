import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: items, count } = await supabase
    .from('items')
    .select('title, source, topics, matched_keywords, metrics', { count: 'exact' })
    .order('last_seen_at', { ascending: false })
    .limit(10);

  console.log(`\nTotal items in DB: ${count}\n`);
  console.log('Latest 10:\n');
  for (const it of items ?? []) {
    const topics = (it.topics ?? []).join(', ') || '—';
    const kws = (it.matched_keywords ?? []).slice(0, 3).join(', ') || '—';
    const stars = (it.metrics as any)?.stars ?? '';
    const score = (it.metrics as any)?.score ?? '';
    const metric = stars ? `★ ${stars}` : score ? `▲ ${score}` : '';
    console.log(`[${it.source.padEnd(5)}] ${it.title.slice(0, 70)}`);
    console.log(`         topics: ${topics}  |  kws: ${kws}  |  ${metric}\n`);
  }

  const { count: snapCount } = await supabase
    .from('snapshots')
    .select('*', { count: 'exact', head: true });
  console.log(`Snapshots: ${snapCount}`);
}

main().catch(console.error);
