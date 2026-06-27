'use client';

import { Calendar } from 'lucide-react';

interface DailyNoteButtonProps {
  onNoteCreated: (noteId: number) => void;
}

export default function DailyNoteButton({ onNoteCreated }: DailyNoteButtonProps) {
  async function handleClick() {
    try {
      const res = await fetch('/api/daily-notes', { method: 'POST' });
      const note = await res.json();
      if (note.id) {
        onNoteCreated(note.id);
      }
    } catch {
      // silent fail
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title="Open today's note"
    >
      <Calendar className="w-3.5 h-3.5" />
      Today
    </button>
  );
}
