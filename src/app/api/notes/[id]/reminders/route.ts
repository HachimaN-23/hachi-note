import { NextResponse } from 'next/server';
import { addReminder, deleteReminder, getReminders } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reminders = getReminders(Number(id));
    return NextResponse.json(reminders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { remind_at } = body;

    if (!remind_at || typeof remind_at !== 'string') {
      return NextResponse.json({ error: 'remind_at is required' }, { status: 400 });
    }

    const reminder = addReminder(Number(id), remind_at);
    return NextResponse.json(reminder, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('reminder_id');

    if (!reminderId) {
      return NextResponse.json({ error: 'reminder_id is required' }, { status: 400 });
    }

    const deleted = deleteReminder(Number(reminderId));
    if (!deleted) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}
