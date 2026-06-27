import { NextResponse } from 'next/server';
import { getBacklinks } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noteId = Number(id);

    if (isNaN(noteId)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const backlinks = getBacklinks(noteId);
    return NextResponse.json(backlinks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch backlinks' }, { status: 500 });
  }
}
