import 'dotenv/config';
// 抓取入口：被 GitHub Actions cron 调用
// 一源失败不影响其他（用 allSettled + try/catch）
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { matchTopics, type KeywordSet } from '@radar-quest/shared';

import { fetchGitHubTrending } from '../apps/web/src/lib/sources/github';
import { fetchProductHunt } from '../apps/web/src/lib/sources/producthunt';
import { fetchHackerNews } from '../apps/web/src/lib/sources/hackernews';
import { fetchReddit } from '../apps/web/src/lib/sources/reddit';
import { fetchNewsletter } from '../apps/web/src/lib/sources/newsletter';
import { fetchWechat } from '../apps/web/src/lib/sources/wechat';
import type { FetchedItem } from '../apps/web/src/lib/sources';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function safeFetch(name: string, fn: () => Promise<FetchedItem[]>): Promise<FetchedItem[]> {
  try {
    const t0 = Date.now();
    const items = await fn();
    console.log(`✓ ${name}: ${items.length} items (${Date.now() - t0}ms)`);
    return items;
  } catch (err) {
    console.warn(`✗ ${name} failed:`, (err as Error).message);
    return [];
  }
}

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 加载默认关键词
  const keywordsPath = join(__dirname, '..', 'data', 'keywords.default.json');
  const keywords: KeywordSet = JSON.parse(await readFile(keywordsPath, 'utf-8'));

  // 抓取 6 个源，每个独立 try/catch
  console.log('Fetching from 6 sources...');
  const [github, ph, hn, reddit, newsletter, wechat] = await Promise.all([
    safeFetch('GitHub', () => fetchGitHubTrending(process.env.GITHUB_TOKEN)),
    safeFetch('ProductHunt', () => fetchProductHunt(process.env.PRODUCTHUNT_API_TOKEN ?? '')),
    safeFetch('HackerNews', () => fetchHackerNews(50, 20)),
    safeFetch('Reddit', () => fetchReddit(20, 5)),
    safeFetch('Newsletter', () => fetchNewsletter([])),
    safeFetch('Wechat', () => fetchWechat(process.env.RSSHUB_BASE_URL ?? 'https://rsshub.app', []))
  ]);

  const all: FetchedItem[] = [...github, ...ph, ...hn, ...reddit, ...newsletter, ...wechat];
  console.log(`\nTotal: ${all.length} items`);

  if (all.length === 0) {
    console.warn('No items fetched. Skipping DB write.');
    return;
  }

  // 关键词匹配 + 写库
  const today = new Date().toISOString().slice(0, 10);
  let inserted = 0;
  let matched = 0;

  for (const item of all) {
    const text = `${item.title} ${item.summary ?? ''} ${item.description ?? ''}`;
    const { topics, matched_keywords } = matchTopics(text, keywords);
    if (topics.length > 0) matched++;

    const id = createHash('sha1').update(item.url).digest('hex').slice(0, 16);

    const { error: itemErr } = await supabase.from('items').upsert({
      id,
      url: item.url,
      title: item.title,
      source: item.source,
      source_id: item.source_id,
      author: item.author,
      summary: item.summary,
      description: item.description,
      image_url: item.image_url,
      language: item.language,
      topics,
      matched_keywords,
      published_at: item.published_at,
      last_seen_at: new Date().toISOString(),
      metrics: item.metrics ?? {},
      metadata: item.metadata ?? {}
    }, { onConflict: 'id' });
    if (itemErr) {
      console.warn(`Item upsert failed: ${itemErr.message}`);
      continue;
    }

    await supabase.from('snapshots').upsert({
      item_id: id,
      taken_at: today,
      metrics: item.metrics ?? {},
      tag_scores: {}
    }, { onConflict: 'item_id,taken_at' });

    inserted++;
  }

  console.log(`Inserted ${inserted} items (${matched} matched keywords)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
