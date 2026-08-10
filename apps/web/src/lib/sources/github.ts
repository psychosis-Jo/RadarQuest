// GitHub Trending
// 走 GitHub Search API（repositories），按 stars 排序最近创建的

import type { FetchedItem } from './index';

export async function fetchGitHubTrending(token?: string): Promise<FetchedItem[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // 30 天内创建 + stars > 100 + 排序按 stars
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const dateStr = date.toISOString().slice(0, 10);

  const url = `https://api.github.com/search/repositories?q=stars:>100+created:>${dateStr}&sort=stars&order=desc&per_page=30`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`GitHub fetch failed: ${res.status}`);
    return [];
  }
  const data = await res.json();

  return (data.items ?? []).map((repo: any): FetchedItem => ({
    url: repo.html_url,
    title: repo.full_name,
    source: 'github',
    source_id: String(repo.id),
    author: repo.owner?.login,
    summary: repo.description,
    description: repo.description,
    image_url: repo.owner?.avatar_url,
    language: repo.language,
    published_at: repo.created_at,
    metrics: {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      comments: repo.open_issues_count
    },
    metadata: { topics: repo.topics ?? [] }
  }));
}
