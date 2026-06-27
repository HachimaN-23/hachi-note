'use client';

import { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  pinned: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ExportMenuProps {
  notes: Note[];
}

export default function ExportMenu({ notes }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
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

  function exportJSON() {
    const data = JSON.stringify(notes, null, 2);
    download(`notes-${dateStamp()}.json`, data, 'application/json');
    setOpen(false);
  }

  function exportMarkdown() {
    const parts = notes.map(n => {
      const tags = n.tags.length ? `\nTags: ${n.tags.join(', ')}` : '';
      const pin = n.pinned ? '\nPinned: yes' : '';
      return `# ${n.title}${tags}${pin}\n\n${n.content}\n\n---\n`;
    });
    download(`notes-${dateStamp()}.md`, parts.join('\n'), 'text/markdown');
    setOpen(false);
  }

  function exportCSV() {
    const header = 'id,title,content,pinned,tags,created_at,updated_at';
    const rows = notes.map(n =>
      [n.id, csvEscape(n.title), csvEscape(n.content), n.pinned, csvEscape(n.tags.join('; ')), n.created_at, n.updated_at].join(',')
    );
    download(`notes-${dateStamp()}.csv`, [header, ...rows].join('\n'), 'text/csv');
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Export notes"
      >
        <Download className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <button onClick={exportJSON} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
            Export as JSON
          </button>
          <button onClick={exportMarkdown} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export as Markdown
          </button>
          <button onClick={exportCSV} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg">
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function csvEscape(str: string) {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
