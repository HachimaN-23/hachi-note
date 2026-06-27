import { NextResponse } from 'next/server';
import { updateNoteColor } from '@/lib/supabase-db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { color } = body;

    if (color !== undefined && color !== null && typeof color !== 'string') {
      return NextResponse.json({ error: 'Color must be a string' }, { status: 400 });
    }

    const note = updateNoteColor(Number(id), color ?? null);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to update note color' }, { status: 500 });
  }
}