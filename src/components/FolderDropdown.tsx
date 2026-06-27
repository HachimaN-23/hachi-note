'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';

interface FolderDropdownProps {
  folderId: number;
  folderName: string;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onAddNote: (folderId: number) => void;
}

export default function FolderDropdown({ folderId, folderName, onRename, onDelete, onAddNote }: FolderDropdownProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folderName);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleRename() {
    if (name.trim() && name.trim() !== folderName) {
      onRename(folderId, name.trim());
    }
    setEditing(false);
    setOpen(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1" ref={ref}>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setEditing(false); setOpen(false); } }}
          onBlur={handleRename}
          className="w-24 px-2 py-0.5 text-xs bg-white dark:bg-gray-900 border border-amber-400 rounded outline-none"
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded transition-colors"
        title="Folder options"
      >
        <MoreHorizontal className="w-3 h-3" />
      </button>
      {open && (
        <div onClick={(e) => e.stopPropagation()} className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 animate-[note-appear_0.15s_ease-out]">
          <button onClick={() => { onAddNote(folderId); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Plus className="w-3.5 h-3.5 text-gray-400" /> Add note
          </button>
          <button onClick={() => { setEditing(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Pencil className="w-3.5 h-3.5 text-gray-400" /> Rename
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <button onClick={() => { if (confirm(`Delete folder "${folderName}"?`)) { onDelete(folderId); setOpen(false); } }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
