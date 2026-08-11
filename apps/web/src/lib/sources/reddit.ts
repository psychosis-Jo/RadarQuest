// Reddit
// 走 JSON API（公开，无需鉴权）

import type { FetchedItem } from './index';

export interface RedditConfig {
  subreddits: string[];
  min_score: number;
  max_items_per_sub: number;
}

export async function fetchReddit(config: RedditConfig): Promise<FetchedItem[]> {
  const results: FetchedItem[] = [];
  for (const sub of config.subreddits) {
    const url = `https://www.reddit.com/r/${sub}/top.json?t=day&limit=${config.max_items_per_sub}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'StarCatcher/0.1 (https://github.com/starcatcher)' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      const children = data?.data?.children ?? [];
      for (const child of children) {
        const post = child.data;
        if (post.score < config.min_score) continue;
        results.push({
          url: `https://reddit.com${post.permalink}`,
          title: post.title,
          source: 'reddit',
          source_id: post.id,
          author: post.author,
          summary: post.selftext?.slice(0, 200),
          image_url: post.thumbnail !== 'self' ? post.thumbnail : undefined,
          published_at: new Date(post.created_utc * 1000).toISOString(),
          metrics: {
            score: post.score,
            comments: post.num_comments,
            upvotes: post.ups
          },
          metadata: { subreddit: post.subreddit }
        });
      }
    } catch {
      // 一个 sub 失败不影响其他
    }
  }
  return results;
}
