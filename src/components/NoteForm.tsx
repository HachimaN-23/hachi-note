'use client';

import { useState, useEffect, useRef } from 'react';
import { ListChecks, Type, Link2 } from 'lucide-react';

const NOTE_COLORS = [
  { name: 'red', value: '#fecaca' },
  { name: 'orange', value: '#fed7aa' },
  { name: 'yellow', value: '#fef3c7' },
  { name: 'green', value: '#d1fae5' },
  { name: 'blue', value: '#dbeafe' },
  { name: 'purple', value: '#ede9fe' },
  { name: 'pink', value: '#fce7f3' },
  { name: 'gray', value: '#f3f4f6' },
];

interface Folder {
  id: number;
  name: string;
}

interface ChecklistItem {
  id: number;
  note_id: number;
  text: string;
  checked: number;
  position: number;
}

interface ChecklistInput {
  id?: number;
  text: string;
  checked: number;
}

interface NoteFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialColor?: string | null;
  initialFolderId?: number | null;
  initialChecklistItems?: ChecklistItem[];
  editingId?: number | null;
  folders?: Folder[];
  onSubmit: (data: { title: string; content: string; tags: string[]; color: string | null; folder_id: number | null; checklist_items: ChecklistInput[]; reminder_at: string | null }) => void;
  onCancel: () => void;
}

export default function NoteForm({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialColor = null,
  initialFolderId = null,
  initialChecklistItems = [],
  editingId,
  folders = [],
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [color, setColor] = useState<string | null>(initialColor);
  const [folderId, setFolderId] = useState<number | null>(initialFolderId);
  const [reminderAt, setReminderAt] = useState('');
  const [isChecklist, setIsChecklist] = useState(initialChecklistItems.length > 0);
  const [checklistItems, setChecklistItems] = useState<ChecklistInput[]>(
    initialChecklistItems.length > 0
      ? initialChecklistItems.map(i => ({ id: i.id, text: i.text, checked: i.checked }))
      : [{ text: '', checked: 0 }]
  );
  const [allNotes, setAllNotes] = useState<Array<{ id: number; title: string }>>([]);
  const [showWikiAutocomplete, setShowWikiAutocomplete] = useState(false);
  const [wikiSuggestions, setWikiSuggestions] = useState<Array<{ id: number; title: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => setAllNotes(data.map((n: { id: number; title: string }) => ({ id: n.id, title: n.title }))))
      .catch(() => {});
  }, []);

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter(t => t !== tagToRemove));
  }

  function addChecklistRow() {
    setChecklistItems([...checklistItems, { text: '', checked: 0 }]);
  }

  function updateChecklistRow(index: number, text: string) {
    const updated = [...checklistItems];
    updated[index] = { ...updated[index], text };
    setChecklistItems(updated);
  }

  function removeChecklistRow(index: number) {
    if (checklistItems.length <= 1) return;
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setContent(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const wikiMatch = textBeforeCursor.match(/\[\[([^\]|]*)$/);

    if (wikiMatch) {
      const query = wikiMatch[1].toLowerCase();
      setShowWikiAutocomplete(true);
      const filtered = allNotes.filter(n =>
        n.title.toLowerCase().includes(query)
      ).slice(0, 5);
      setWikiSuggestions(filtered);
    } else {
      setShowWikiAutocomplete(false);
    }
  }

  function insertWikilink(noteTitle: string) {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const value = content;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);

    const wikiStart = textBeforeCursor.lastIndexOf('[[');
    const before = value.slice(0, wikiStart);
    const newValue = `${before}[[${noteTitle}]]${textAfterCursor}`;
    setContent(newValue);
    setShowWikiAutocomplete(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = wikiStart + noteTitle.length + 4;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  function handleContentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showWikiAutocomplete && wikiSuggestions.length > 0) {
      if (e.key === 'Escape') {
        setShowWikiAutocomplete(false);
        e.preventDefault();
        return;
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const items = isChecklist
      ? checklistItems.filter(item => item.text.trim())
      : [];
    onSubmit({
      title: title.trim(),
      content: isChecklist ? '' : content,
      tags,
      color,
      folder_id: folderId,
      checklist_items: items,
      reminder_at: reminderAt || null,
    });
    setTitle('');
    setContent('');
    setTags([]);
    setColor(null);
    setFolderId(null);
    setChecklistItems([{ text: '', checked: 0 }]);
    setTagInput('');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 shadow-sm">
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="w-full text-lg font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-0 outline-none mb-3 bg-transparent"
      />

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setIsChecklist(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!isChecklist ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Type className="w-3.5 h-3.5" />
          Note
        </button>
        <button
          type="button"
          onClick={() => setIsChecklist(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isChecklist ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          Checklist
        </button>
      </div>

      {!isChecklist ? (
        <div className="relative mb-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            placeholder="Write something... Type [[ to link notes"
            rows={3}
            className="w-full text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border-0 outline-none resize-none bg-transparent"
          />
          {showWikiAutocomplete && wikiSuggestions.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {wikiSuggestions.map(note => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => insertWikilink(note.title)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Link2 className="w-3.5 h-3.5 text-gray-400" />
                  {note.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3 space-y-2">
          {checklistItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!item.checked}
                onChange={() => {
                  const updated = [...checklistItems];
                  updated[i] = { ...updated[i], checked: updated[i].checked ? 0 : 1 };
                  setChecklistItems(updated);
                }}
                className="w-4 h-4 rounded border-gray-300 text-amber-500"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateChecklistRow(i, e.target.value)}
                placeholder="List item..."
                className="flex-1 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border-0 outline-none bg-transparent"
              />
              {checklistItems.length > 1 && (
                <button type="button" onClick={() => removeChecklistRow(i)} className="text-gray-400 hover:text-red-500 text-xs">&times;</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addChecklistRow} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
            + Add item
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          {NOTE_COLORS.map(c => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(color === c.name ? null : c.name)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${color === c.name ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
        {folders.length > 0 && (
          <select
            value={folderId ?? ''}
            onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
            className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 border-0 outline-none"
          >
            <option value="">No folder</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
            className="text-xs text-gray-600 dark:text-gray-400 bg-transparent border-0 outline-none w-36"
          />
        </div>
        {reminderAt && (
          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Will save
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900 dark:hover:text-blue-100">&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={tags.length === 0 ? "Add tags (enter or comma)" : ""}
          className="text-sm text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 border-0 outline-none bg-transparent min-w-[120px]"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          {editingId ? 'Update' : 'Add note'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
