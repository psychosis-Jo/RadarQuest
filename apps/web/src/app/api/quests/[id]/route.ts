import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/data/supabase';

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
    return NextResponse.json({ quest: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
