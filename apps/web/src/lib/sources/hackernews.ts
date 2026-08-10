// Hacker News top stories
// 走 Firebase API

import type { FetchedItem } from './index';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

export async function fetchHackerNews(minScore = 100, maxItems = 30): Promise<FetchedItem[]> {
  const topIdsRes = await fetch(`${HN_BASE}/topstories.json`);
  if (!topIdsRes.ok) return [];
  const ids: number[] = (await topIdsRes.json()).slice(0, maxItems * 2);

  const items: FetchedItem[] = [];
  for (const id of ids) {
    const res = await fetch(`${HN_BASE}/item/${id}.json`);
    if (!res.ok) continue;
    const story = await res.json();
    if (!story || story.type !== 'story') continue;
    if ((story.score ?? 0) < minScore) continue;
    items.push({
      url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
      title: story.title,
      source: 'hn',
      source_id: String(story.id),
      author: story.by,
      summary: story.text?.slice(0, 200),
      published_at: story.time ? new Date(story.time * 1000).toISOString() : undefined,
      metrics: {
        score: story.score ?? 0,
        comments: story.descendants ?? 0
      }
    });
    if (items.length >= maxItems) break;
  }
  return items;
}
