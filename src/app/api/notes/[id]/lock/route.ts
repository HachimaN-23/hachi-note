import { NextResponse } from 'next/server';
import { lockNote, unlockNote, getNote } from '@/lib/supabase-db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const note = await getNote(Number(id));
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.locked) {
      const success = await unlockNote(Number(id), password);
      if (!success) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
      }
      return NextResponse.json({ success: true, locked: false });
    }

    await lockNote(Number(id), password);
    return NextResponse.json({ success: true, locked: true });
  } catch {
    return NextResponse.json({ error: 'Failed to toggle lock' }, { status: 500 });
  }
}
