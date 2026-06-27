import { NextResponse } from 'next/server';
import { getChecklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = getChecklistItems(Number(id));
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch checklist items' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, position } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const item = addChecklistItem(Number(id), text, position);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add checklist item' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = await request.json();
    const { item_id, text, checked } = body;

    if (!item_id || typeof item_id !== 'number') {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const item = updateChecklistItem(item_id, text, checked);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId || isNaN(Number(itemId))) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const deleted = deleteChecklistItem(Number(itemId));

    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}