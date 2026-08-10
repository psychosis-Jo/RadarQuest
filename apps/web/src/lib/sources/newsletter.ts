// Newsletter 通用 RSS 抓取
// feed URL 列表从 settings 读

import Parser from 'rss-parser';
import type { FetchedItem } from './index';

const parser = new Parser({ timeout: 10000 });

export async function fetchNewsletter(feeds: string[]): Promise<FetchedItem[]> {
  const results: FetchedItem[] = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of (feed.items ?? []).slice(0, 20)) {
        if (!item.link || !item.title) continue;
        results.push({
          url: item.link,
          title: item.title,
          source: 'newsletter',
          source_id: item.guid ?? item.link,
          author: item.creator ?? item.author,
          summary: item.contentSnippet?.slice(0, 200),
          description: item.content?.slice(0, 500),
          published_at: item.isoDate ?? item.pubDate,
          metrics: {},
          metadata: { feed_title: feed.title }
        });
      }
    } catch (err) {
      console.warn(`Newsletter fetch failed for ${url}:`, err);
    }
  }
  return results;
}
