// Product Hunt
// 走 GraphQL API（v2）

import type { FetchedItem } from './index';

const PH_ENDPOINT = 'https://api.producthunt.com/v2/api/graphql';

export interface ProductHuntConfig {
  query_type: 'today' | 'week' | 'month';
}

function getSinceISO(range: 'today' | 'week' | 'month'): string {
  const now = new Date();
  if (range === 'today') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  }
  if (range === 'week') {
    now.setUTCDate(now.getUTCDate() - 7);
    return now.toISOString();
  }
  // month
  now.setUTCDate(now.getUTCDate() - 30);
  return now.toISOString();
}

export async function fetchProductHunt(token: string, config: ProductHuntConfig): Promise<FetchedItem[]> {
  if (!token) {
    console.warn('ProductHunt: missing PRODUCTHUNT_API_TOKEN, skipping');
    return [];
  }
  const since = getSinceISO(config.query_type);
  const query = `
    query Posts {
      posts(order: VOTES, postedAfter: "${since}") {
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
  const res = await fetch(PH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    console.error(`ProductHunt fetch failed: ${res.status}`);
    return [];
  }
  const data = await res.json();
  const edges = data?.data?.posts?.edges ?? [];
  return edges.map((e: any) => {
    const node = e.node;
    return {
      url: node.url,
      title: node.name,
      source: 'ph',
      source_id: String(node.id),
      author: node.user?.username,
      summary: node.tagline,
      description: node.description,
      image_url: node.thumbnail?.url,
      published_at: node.createdAt,
      metrics: {
        upvotes: node.votesCount,
        comments: node.commentsCount
      }
    };
  });
}
