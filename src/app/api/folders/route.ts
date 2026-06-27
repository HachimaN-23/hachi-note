import { NextResponse } from 'next/server';
import { getAllFolders, createFolder } from '@/lib/db';

export async function GET() {
  try {
    const folders = getAllFolders();
    return NextResponse.json(folders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parent_id } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const folder = createFolder(name, parent_id);
    return NextResponse.json(folder, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}