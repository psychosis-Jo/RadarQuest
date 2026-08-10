// Reddit
// 走 JSON API（公开，无需鉴权）

import type { FetchedItem } from './index';

const SUBREDDITS = [
  'programming',
  'MachineLearning',
  'IndieHackers',
  'productivity',
  'selfimprovement'
];

export async function fetchReddit(minScore = 50, maxPerSub = 10): Promise<FetchedItem[]> {
  const results: FetchedItem[] = [];
  for (const sub of SUBREDDITS) {
    const url = `https://www.reddit.com/r/${sub}/top.json?t=day&limit=${maxPerSub}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RadarQuest/0.1 (https://github.com/radar-quest)' }
    });
    if (!res.ok) continue;
    const data = await res.json();
    const children = data?.data?.children ?? [];
    for (const child of children) {
      const post = child.data;
      if (post.score < minScore) continue;
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
  }
  return results;
}
