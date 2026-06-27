import { NextResponse } from 'next/server';
import { addNoteImage, deleteNoteImage } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { filename, mime_type, data } = body;

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    const image = addNoteImage(Number(id), filename, mime_type || 'image/png', data);
    return NextResponse.json(image, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('image_id');

    if (!imageId || isNaN(Number(imageId))) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const deleted = deleteNoteImage(Number(imageId));

    if (!deleted) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}