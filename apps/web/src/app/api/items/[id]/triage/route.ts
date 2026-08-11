import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/data/supabase';

/**
 * Triage 三动作（per IA.md §4）：
 * - keep   → state = 'kept', saved = false
 * - save   → state = 'kept', saved = true
 * - dismiss → state = 'dismissed'
 *
 * saved 反向：unstar → state = 'kept', saved = false
 */
type TriageAction = 'keep' | 'save' | 'dismiss' | 'unstar';

const VALID: TriageAction[] = ['keep', 'save', 'dismiss', 'unstar'];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { action?: TriageAction };
    const action = body.action;
    if (!action || !VALID.includes(action)) {
      return NextResponse.json(
        { error: `invalid action, must be one of: ${VALID.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    let update: Record<string, unknown>;
    switch (action) {
      case 'keep':
        update = { state: 'kept', saved: false };
        break;
      case 'save':
        update = { state: 'kept', saved: true };
        break;
      case 'dismiss':
        update = { state: 'dismissed' };
        break;
      case 'unstar':
        update = { saved: false };
        break;
    }

    const { data, error } = await supabase
      .from('items')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ item: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
