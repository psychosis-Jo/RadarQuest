// 公众号抓取（通过自托管 RSSHub）

import Parser from 'rss-parser';
import type { FetchedItem } from './index';

const parser = new Parser({ timeout: 10000 });

export interface WechatConfig {
  rsshub_base_url: string;
  accounts: string[];
}

export async function fetchWechat(config: WechatConfig): Promise<FetchedItem[]> {
  const results: FetchedItem[] = [];
  const base = (config.rsshub_base_url || 'https://rsshub.app').replace(/\/$/, '');
  for (const account of config.accounts) {
    // 公众号 RSSHub 路由：/wechat/mp/homepage/{biz} 或 /wechat/mp/articles/{id}
    const url = `${base}/wechat/mp/homepage/${encodeURIComponent(account)}`;
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
