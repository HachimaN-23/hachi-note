'use client';

import { useState } from 'react';
import { Zap, X, Send } from 'lucide-react';

export default function QuickNote() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text.trim().split('\n')[0].slice(0, 50), content: text.trim(), tags: ['quick'], color: null, folder_id: null, checklist_items: [] }),
      });
      setSaved(true);
      setText('');
      setTimeout(() => setSaved(false), 1500);
      window.dispatchEvent(new Event('notes-updated'));
    } catch {
      // silent
    }
    setSaving(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
        title="Quick note"
      >
        <Zap className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed bottom-20 left-6 z-50 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 animate-[note-appear_0.2s_ease-out]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick Note</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Jot something down..."
            rows={3}
            className="w-full text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg p-2 outline-none resize-none bg-transparent focus:border-amber-400 transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            {saved && (
              <p className="text-xs text-emerald-500">Saved to notes</p>
            )}
            <div className="ml-auto">
              <button
                onClick={save}
                disabled={!text.trim() || saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3 h-3" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
