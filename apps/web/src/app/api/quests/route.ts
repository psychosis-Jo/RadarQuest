import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/data/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body.replaceDate) {
      await supabase
        .from('quests')
        .delete()
        .eq('quest_type', 'daily')
        .gte('started_at', body.replaceDate);
    }

    if (!body.quests || !Array.isArray(body.quests)) {
      return NextResponse.json({ error: 'quests array required' }, { status: 400 });
    }

    const rows = body.quests.map((q: any) => ({
      quest_type: 'daily',
      title: q.title,
      description: q.description ?? null,
      related_topic: q.related_topic || null,
      related_item_id: q.related_item_id || null,
      action_type: q.action_type || null,
      target_count: 1,
      status: 'active'
    }));

    const { data, error } = await supabase.from('quests').insert(rows).select();
    if (error) throw new Error(error.message);
    return NextResponse.json({ quests: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
