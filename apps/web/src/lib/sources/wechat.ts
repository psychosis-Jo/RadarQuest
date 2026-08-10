// 公众号抓取（通过自托管 RSSHub）

import Parser from 'rss-parser';
import type { FetchedItem } from './index';

const parser = new Parser({ timeout: 10000 });

export async function fetchWechat(rsshubBase: string, accounts: string[]): Promise<FetchedItem[]> {
  const results: FetchedItem[] = [];
  for (const account of accounts) {
    // 公众号 RSSHub 路由：/wechat/mp/homepage/{biz} 或 /wechat/mp/articles/{id}
    const url = `${rsshubBase.replace(/\/$/, '')}/wechat/mp/homepage/${encodeURIComponent(account)}`;
    try {
      const feed = await parser.parseURL(url);
      for (const item of (feed.items ?? []).slice(0, 15)) {
        if (!item.link || !item.title) continue;
        results.push({
          url: item.link,
          title: item.title,
          source: 'wechat',
          source_id: item.guid ?? item.link,
          author: feed.title,
          summary: item.contentSnippet?.slice(0, 200),
          published_at: item.isoDate ?? item.pubDate,
          metrics: {},
          metadata: { account }
        });
      }
    } catch (err) {
      console.warn(`Wechat fetch failed for ${account}:`, err);
    }
  }
  return results;
}
