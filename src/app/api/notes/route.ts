import { NextResponse } from 'next/server';
import { getAllNotes, createNote, searchNotes, getNotesByTag, addChecklistItem } from '@/lib/supabase-db';

const MAX_TITLE = 500;
const MAX_CONTENT = 100_000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    const folder = searchParams.get('folder');

    let notes;
    if (q) {
      notes = await searchNotes(q);
    } else if (tag) {
      notes = await getNotesByTag(tag);
    } else {
      const folderId = folder !== null ? (folder === 'null' ? null : Number(folder)) : undefined;
      notes = await getAllNotes(folderId);
    }
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1_000_000) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

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

    const note = await createNote(title, content || '', tags || [], color, folder_id);

    if (body.checklist_items && Array.isArray(body.checklist_items)) {
      for (let i = 0; i < body.checklist_items.length; i++) {
        const item = body.checklist_items[i];
        if (item.text && typeof item.text === 'string') {
          await addChecklistItem(note.id, item.text.trim(), i);
        }
      }
    }

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
