import { NextResponse } from 'next/server';
import { recordAction } from '@/lib/data/actions';
import type { ActionType } from '@starcatcher/shared';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, action, note, outputRef, outputTitle } = body as {
      itemId: string;
      action: ActionType;
      note?: string;
      outputRef?: string;
      outputTitle?: string;
    };

    if (!itemId || !action) {
      return NextResponse.json({ error: 'itemId and action required' }, { status: 400 });
    }
    if (!['watch', 'save', 'note', 'build', 'publish'].includes(action)) {
      return NextResponse.json({ error: 'invalid action' }, { status: 400 });
    }

    const result = await recordAction({ itemId, action, note, outputRef, outputTitle });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
