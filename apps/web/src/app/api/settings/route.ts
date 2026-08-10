import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/data/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabase();
    const { error } = await supabase
      .from('settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
