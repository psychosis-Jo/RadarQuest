import 'dotenv/config';
// 抓取入口：被 GitHub Actions cron 调用
// 一源失败不影响其他（用 allSettled + try/catch）
//
// v2：从 Supabase settings 读信源配置 + 关键词
//     不再读 data/sources.default.json / keywords.default.json
//     （除非 settings.sources 为 null 才回退到默认文件）
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { matchTopics, type KeywordSet } from '@radar-quest/shared';

import {
  fetchGitHubTrending,
  fetchProductHunt,
  fetchHackerNews,
  fetchReddit,
  fetchNewsletter,
  fetchWechat,
  type FetchedItem
} from '../apps/web/src/lib/sources';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 来源 ID → (fetcher fn, config 键, 需要环境变量)
type SourceDef = {
  id: 'github' | 'producthunt' | 'hackernews' | 'reddit' | 'newsletter' | 'wechat';
  run: (config: any) => Promise<FetchedItem[]>;
  needsToken?: 'github' | 'producthunt';
};

const SOURCES: SourceDef[] = [
  { id: 'github',     run: (c) => fetchGitHubTrending(process.env.GITHUB_TOKEN, c),     needsToken: 'github' },
  { id: 'producthunt',run: (c) => fetchProductHunt(process.env.PRODUCTHUNT_API_TOKEN ?? '', c), needsToken: 'producthunt' },
  { id: 'hackernews', run: (c) => fetchHackerNews(c) },
  { id: 'reddit',     run: (c) => fetchReddit(c) },
  { id: 'newsletter', run: (c) => fetchNewsletter(c) },
  { id: 'wechat',     run: (c) => fetchWechat(c) }
];

async function loadSettings(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase.from('settings').select('keywords, sources').eq('id', 1).single();
  // sources 为 null 时回退到 data/sources.default.json
  let sources = data?.sources as Record<string, any> | null;
  if (!sources) {
    const path = join(__dirname, '..', 'data', 'sources.default.json');
    sources = JSON.parse(await readFile(path, 'utf-8'));
  }
  return {
    keywords: (data?.keywords ?? {}) as KeywordSet,
    sources
  };
}

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

  const { keywords, sources } = await loadSettings(supabase);

  // 决定要跑哪些源（enabled 开关）
  const toRun = SOURCES.filter(s => {
    const cfg = sources[s.id];
    if (!cfg) {
      console.log(`- ${s.id}: no config, skip`);
      return false;
    }
    if (cfg.enabled === false) {
      console.log(`- ${s.id}: disabled, skip`);
      return false;
    }
    return true;
  });

  if (toRun.length === 0) {
    console.warn('No enabled sources. Skipping DB write.');
    return;
  }

  console.log(`Fetching from ${toRun.length} sources...`);
  const allArrays = await Promise.all(
    toRun.map(s => safeFetch(s.id, () => s.run(sources[s.id].config ?? {})))
  );
  const all: FetchedItem[] = allArrays.flat();
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
