'use client';

import { useState, useEffect } from 'react';
import { Link2 } from 'lucide-react';

interface BacklinkNote {
  id: number;
  title: string;
  content: string;
}

interface BacklinksProps {
  noteId: number;
  onNavigate: (noteId: number) => void;
}

export default function Backlinks({ noteId, onNavigate }: BacklinksProps) {
  const [backlinks, setBacklinks] = useState<BacklinkNote[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/notes/${noteId}/backlinks`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setBacklinks(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setBacklinks([]);
      });
    return () => { cancelled = true; };
  }, [noteId]);

  if (backlinks.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {backlinks.length} backlink{backlinks.length !== 1 ? 's' : ''}
        </h3>
      </div>
      <div className="space-y-2">
        {backlinks.map(note => (
          <button
            key={note.id}
            onClick={() => onNavigate(note.id)}
            className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {note.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {note.content.replace(/[[\]]/g, '').slice(0, 100)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
