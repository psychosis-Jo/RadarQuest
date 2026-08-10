import { NextResponse } from 'next/server';
import { createBoss } from '@/lib/data/boss';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.target) {
      return NextResponse.json({ error: 'name and target required' }, { status: 400 });
    }
    const boss = await createBoss({
      name: body.name,
      description: body.description || undefined,
      target: parseInt(body.target),
      deadline: body.deadline || undefined,
      topic: body.topic || undefined
    });
    return NextResponse.json({ boss });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
