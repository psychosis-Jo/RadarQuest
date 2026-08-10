// 关键词匹配
// 匹配走"中英双向 + 权重"策略

export type TopicKey = 'AI' | 'one-person' | 'self-mgmt';

export interface KeywordConfig {
  label_zh: string;
  label_en: string;
  color: string;
  weight: number;
  keywords_zh: string[];
  keywords_en: string[];
}

export type KeywordSet = Record<TopicKey, KeywordConfig>;

export const TOPIC_COLORS: Record<TopicKey, string> = {
  'AI': '#5FE0C7',
  'one-person': '#E8B86F',
  'self-mgmt': '#B8A4D4'
};

export const TOPIC_LABELS: Record<TopicKey, { zh: string; en: string }> = {
  'AI': { zh: 'AI 应用', en: 'AI Applied' },
  'one-person': { zh: '一人公司', en: 'One-Person Business' },
  'self-mgmt': { zh: '自我管理', en: 'Self-Management' }
};

/**
 * 匹配单条 item 的 topics
 * @param text 要匹配的文本（标题 + 描述 + 摘要）
 * @param keywords 关键词配置
 * @returns { topics, matched_keywords }
 */
export function matchTopics(
  text: string,
  keywords: KeywordSet
): { topics: TopicKey[]; matched_keywords: string[] } {
  const lower = text.toLowerCase();
  const topics = new Set<TopicKey>();
  const matched = new Set<string>();

  for (const [topic, config] of Object.entries(keywords) as [TopicKey, KeywordConfig][]) {
    for (const kw of [...config.keywords_zh, ...config.keywords_en]) {
      if (lower.includes(kw.toLowerCase())) {
        topics.add(topic);
        matched.add(kw);
      }
    }
  }

  return {
    topics: Array.from(topics),
    matched_keywords: Array.from(matched)
  };
}

/**
 * 计算一条 item 的主题得分（命中数 × 权重）
 */
export function topicScore(
  text: string,
  keywords: KeywordSet
): Record<TopicKey, number> {
  const lower = text.toLowerCase();
  const scores: Record<TopicKey, number> = {
    'AI': 0,
    'one-person': 0,
    'self-mgmt': 0
  };

  for (const [topic, config] of Object.entries(keywords) as [TopicKey, KeywordConfig][]) {
    for (const kw of [...config.keywords_zh, ...config.keywords_en]) {
      if (lower.includes(kw.toLowerCase())) {
        scores[topic] += config.weight;
      }
    }
  }

  return scores;
}
