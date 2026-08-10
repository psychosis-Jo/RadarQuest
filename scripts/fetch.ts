// 抓取入口：被 GitHub Actions cron 调用
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

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 加载默认关键词
  const keywordsPath = join(__dirname, '..', 'data', 'keywords.default.json');
  const keywords: KeywordSet = JSON.parse(await readFile(keywordsPath, 'utf-8'));

  // 并行抓取所有源
  const [github, ph, hn, reddit] = await Promise.all([
    fetchGitHubTrending(process.env.GITHUB_TOKEN),
    fetchProductHunt(process.env.PRODUCTHUNT_API_TOKEN ?? ''),
    fetchHackerNews(100, 30),
    fetchReddit(50, 10)
  ]);

  // Newsletter / Wechat 需要从 settings 读 feed 列表
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  const newsletterFeeds: string[] = settings?.newsletter_feeds ?? [];
  const wechatAccounts: string[] = settings?.wechat_accounts ?? [];
  const rsshubBase = process.env.RSSHUB_BASE_URL ?? 'https://rsshub.app';

  const [newsletter, wechat] = await Promise.all([
    fetchNewsletter(newsletterFeeds),
    fetchWechat(rsshubBase, wechatAccounts)
  ]);

  const all: FetchedItem[] = [...github, ...ph, ...hn, ...reddit, ...newsletter, ...wechat];
  console.log(`Fetched ${all.length} items total`);

  // 关键词匹配 + 写库
  const today = new Date().toISOString().slice(0, 10);
  let inserted = 0;

  for (const item of all) {
    const text = `${item.title} ${item.summary ?? ''} ${item.description ?? ''}`;
    const { topics, matched_keywords } = matchTopics(text, keywords);

    const id = createHash('sha1').update(item.url).digest('hex').slice(0, 16);

    // upsert item
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
      console.warn(`Item upsert failed for ${item.url}:`, itemErr.message);
      continue;
    }

    // insert snapshot（如果今天还没）
    await supabase.from('snapshots').upsert({
      item_id: id,
      taken_at: today,
      metrics: item.metrics ?? {},
      tag_scores: {}
    }, { onConflict: 'item_id,taken_at' });

    inserted++;
  }

  console.log(`Inserted ${inserted} items`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
