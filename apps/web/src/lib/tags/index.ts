// 5 个标签的服务端实现
// 客户端直接复用 packages/shared 的纯函数；这里负责拉数据并归一化
import type { TabKey } from '@radar-quest/shared';

export async function getTabItems(tab: TabKey, supabase: any, options: { days?: number; limit?: number } = {}) {
  const { days = 1, limit = 50 } = options;
  // 简化实现：根据 tab 走不同 SQL
  // 完整实现在 Phase 4
  if (tab === 'trending') {
    const { data } = await supabase
      .from('snapshots')
      .select('item_id, tag_scores, items(*)')
      .eq('taken_at', new Date().toISOString().slice(0, 10))
      .order('tag_scores->>trending', { ascending: false })
      .limit(limit);
    return data;
  }
  // 其他 tab 走类似逻辑
  return [];
}
