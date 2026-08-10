// 6 个数据源的统一接口
export * from './github';
export * from './producthunt';
export * from './hackernews';
export * from './reddit';
export * from './newsletter';
export * from './wechat';

export type FetchedItem = {
  url: string;
  title: string;
  source: 'github' | 'ph' | 'hn' | 'reddit' | 'wechat' | 'newsletter';
  source_id?: string;
  author?: string;
  summary?: string;
  description?: string;
  image_url?: string;
  language?: string;
  published_at?: string;
  metrics?: Record<string, number>;
  metadata?: Record<string, unknown>;
};
