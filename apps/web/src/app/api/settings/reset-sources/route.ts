// 把 settings.sources 重置为 data/sources.default.json 的内容
// 用户在 UI 点"恢复默认"时调用
import { NextResponse } from 'next/server';
import { SOURCES_DEFAULT } from '@/lib/data/sources-default';
import { getSupabase } from '@/lib/data/supabase';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('settings')
      .update({ sources: SOURCES_DEFAULT, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, sources: SOURCES_DEFAULT });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
