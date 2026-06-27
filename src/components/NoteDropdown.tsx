'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Trash2, Lock, Unlock, Copy, Check } from 'lucide-react';

interface NoteDropdownProps {
  locked?: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  title: string;
  content: string;
}

export default function NoteDropdown({ locked, onEdit, onDelete, onToggleLock, title, content }: NoteDropdownProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleCopy() {
    await navigator.clipboard.writeText(`# ${title}\n\n${content}`);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 animate-[note-appear_0.15s_ease-out]">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-400" />
            Edit
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => { onToggleLock(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {locked ? <Unlock className="w-3.5 h-3.5 text-gray-400" /> : <Lock className="w-3.5 h-3.5 text-gray-400" />}
            {locked ? 'Unlock' : 'Lock'}
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
