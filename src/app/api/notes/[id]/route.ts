import { NextResponse } from 'next/server';
import { getNote, updateNote, deleteNote } from '@/lib/supabase-db';

const MAX_TITLE = 500;
const MAX_CONTENT = 100_000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = getNote(Number(id));

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, tags, color, folder_id } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (title.length > MAX_TITLE) {
      return NextResponse.json({ error: `Title must be ${MAX_TITLE} characters or less` }, { status: 400 });
    }
    if (content && typeof content === 'string' && content.length > MAX_CONTENT) {
      return NextResponse.json({ error: `Content must be ${MAX_CONTENT} characters or less` }, { status: 400 });
    }
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }
    if (tags && tags.length > MAX_TAGS) {
      return NextResponse.json({ error: `Maximum ${MAX_TAGS} tags allowed` }, { status: 400 });
    }
    if (tags && tags.some((t: unknown) => typeof t !== 'string' || t.length > MAX_TAG_LENGTH)) {
      return NextResponse.json({ error: `Each tag must be a string under ${MAX_TAG_LENGTH} characters` }, { status: 400 });
    }
    if (color !== undefined && color !== null && typeof color !== 'string') {
      return NextResponse.json({ error: 'Color must be a string' }, { status: 400 });
    }
    if (folder_id !== undefined && folder_id !== null && typeof folder_id !== 'number') {
      return NextResponse.json({ error: 'Folder ID must be a number' }, { status: 400 });
    }

    const note = updateNote(Number(id), title, content || '', tags || [], color, folder_id);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteNote(Number(id));

    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
