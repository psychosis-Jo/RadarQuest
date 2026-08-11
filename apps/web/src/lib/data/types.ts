export type ActionType = 'watch' | 'save' | 'note' | 'build' | 'publish';
export type TabKey = 'trending' | 'spike' | 'rise' | 'density' | 'cross';
export type TopicKey = 'AI' | 'one-person' | 'self-mgmt';

export interface Item {
  id: string;
  url: string;
  title: string;
  source: 'github' | 'ph' | 'hn' | 'reddit' | 'wechat' | 'newsletter';
  source_id: string | null;
  author: string | null;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  language: string | null;
  topics: string[];
  matched_keywords: string[];
  published_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  metrics: Record<string, number>;
  metadata: Record<string, unknown>;
  archived: boolean;
  // Triage 状态机（per IA.md §4）
  state: 'unprocessed' | 'kept' | 'dismissed';
  saved: boolean;
}

export interface Action {
  id: number;
  item_id: string;
  action_type: ActionType;
  note: string | null;
  output_ref: string | null;
  output_title: string | null;
  xp_earned: number;
  created_at: string;
}

export interface UserStats {
  total_xp: number;
  level: number;
  xp_in_level: number;
  xp_to_next: number;
  action_streak: number;
  publish_streak_weeks: number;
  today_xp: number;
  today_actions: number;
  today_publishes: number;
  today_by_type: Record<string, number>;
}

export interface SkillProgress {
  AI: { count: number; level: number; nextMilestone: number };
  'one-person': { count: number; level: number; nextMilestone: number };
  'self-mgmt': { count: number; level: number; nextMilestone: number };
}
