import { NextResponse } from 'next/server';
import { moveNoteToFolder } from '@/lib/supabase-db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { folder_id } = body;

    if (folder_id !== undefined && folder_id !== null && typeof folder_id !== 'number') {
      return NextResponse.json({ error: 'Folder ID must be a number' }, { status: 400 });
    }

    const note = moveNoteToFolder(Number(id), folder_id ?? null);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to move note' }, { status: 500 });
  }
}