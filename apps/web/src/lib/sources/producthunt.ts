// Product Hunt
// 走 GraphQL API（v2）

import type { FetchedItem } from './index';

const PH_ENDPOINT = 'https://api.producthunt.com/v2/api/graphql';

const QUERY = `
  query TodayPosts {
    posts(order: VOTES, postedAfter: "${getTodayISO()}") {
      edges {
        node {
          id
          name
          tagline
          description
          url
          votesCount
          commentsCount
          createdAt
          thumbnail { url }
          user { name username }
        }
      }
    }
  }
`;

function getTodayISO(): string {
  // PH 接受 ISO timestamp；用 UTC 0 点
  return new Date().toISOString().slice(0, 10) + 'T00:00:00Z';
}

export async function fetchProductHunt(token: string): Promise<FetchedItem[]> {
  if (!token) {
    console.warn('ProductHunt: missing PRODUCTHUNT_API_TOKEN, skipping');
    return [];
  }
  const res = await fetch(PH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query: QUERY })
  });
  if (!res.ok) {
    console.error(`ProductHunt fetch failed: ${res.status}`);
    return [];
  }
  const data = await res.json();
  const posts = data?.data?.posts?.edges ?? [];
  return posts.map(({ node }: any): FetchedItem => ({
    url: node.url,
    title: node.name,
    source: 'ph',
    source_id: node.id,
    author: node.user?.username,
    summary: node.tagline,
    description: node.description,
    image_url: node.thumbnail?.url,
    published_at: node.createdAt,
    metrics: {
      upvotes: node.votesCount,
      comments: node.commentsCount
    }
  }));
}
