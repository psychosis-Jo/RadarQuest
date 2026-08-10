import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/data/supabase';
import { recordAction } from '@/lib/data/actions';
import type { ActionType } from '@radar-quest/shared';

const VALID_ACTIONS: ActionType[] = ['watch', 'save', 'note', 'build', 'publish'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = getSupabase();
    const update: any = { ...body };
    if (body.status === 'completed' && !body.completed_at) {
      update.completed_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('quests')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // 完成 quest 时，如果有 action_type + related_item_id，
    // 调 recordAction —— 这样会走 dedup + daily_stats + incrementBosses
    // 与 ItemCard 同一入口，数据完全一致
    if (
      body.status === 'completed' &&
      data.action_type &&
      VALID_ACTIONS.includes(data.action_type as ActionType) &&
      data.related_item_id
    ) {
      try {
        const result = await recordAction({
          itemId: data.related_item_id,
          action: data.action_type as ActionType,
          note: data.title ? `quest: ${data.title}` : undefined
        });
        return NextResponse.json({ quest: data, actionResult: result });
      } catch (e) {
        // recordAction 失败不应该让 quest 状态回滚
        // 任务本身已经完成，action 没记上的话用户可以从主页再点
        return NextResponse.json({ quest: data, actionError: (e as Error).message });
      }
    }

    return NextResponse.json({ quest: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
