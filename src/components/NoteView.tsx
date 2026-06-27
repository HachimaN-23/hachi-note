'use client';

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Copy, Scissors, Clipboard, CheckSquare } from 'lucide-react';
import Outline from './Outline';
import Backlinks from './Backlinks';
import NoteDropdown from './NoteDropdown';
import { parseFrontmatter } from '@/lib/frontmatter';

const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/;

function WikilinkText({ children, onNavigateToNote }: { children: ReactNode; onNavigateToNote?: (title: string) => void }): ReactNode {
  if (typeof children === 'string') {
    const parts: ReactNode[] = [];
    let remaining = children;
    let key = 0;
    while (remaining) {
      const match = remaining.match(WIKILINK_RE);
      if (!match) { parts.push(remaining); break; }
      const before = remaining.slice(0, match.index);
      const title = match[1].trim();
      const display = match[2]?.trim() || title;
      if (before) parts.push(before);
      parts.push(
        <span
          key={key++}
          onClick={(e) => { e.stopPropagation(); onNavigateToNote?.(title); }}
          className="cursor-pointer text-blue-600 dark:text-blue-400 underline decoration-blue-300/50 dark:decoration-blue-500/50 hover:text-blue-800 dark:hover:text-blue-300 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-colors"
          title={`Go to: ${title}`}
        >
          {display}
        </span>
      );
      remaining = remaining.slice(match.index! + match[0].length);
    }
    return <>{parts}</>;
  }
  if (Array.isArray(children)) {
    return <>{children.map((child, i) => typeof child === 'string' ? <WikilinkText key={i} onNavigateToNote={onNavigateToNote}>{child}</WikilinkText> : child)}</>;
  }
  return <>{children}</>;
}

function SelectionToolbar() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [handleSelection]);

  if (!visible) return null;

  async function handleCopy() {
    const text = window.getSelection()?.toString() || '';
    await navigator.clipboard.writeText(text);
    setVisible(false);
  }

  async function handleCut() {
    const text = window.getSelection()?.toString() || '';
    await navigator.clipboard.writeText(text);
    document.execCommand('delete');
    setVisible(false);
  }

  function handleSelectAll() {
    const article = document.querySelector('article');
    if (article) {
      const range = document.createRange();
      range.selectNodeContents(article);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }

  async function handlePaste() {
    const text = await navigator.clipboard.readText();
    document.execCommand('insertText', false, text);
    setVisible(false);
  }

  return (
    <div
      className="fixed z-50 flex items-center gap-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-xl animate-[note-appear_0.15s_ease-out]"
      style={{ left: `${Math.max(80, Math.min(pos.x, window.innerWidth - 80))}px`, top: `${pos.y}px`, transform: 'translate(-50%, -100%)' }}
    >
      <button onClick={handleSelectAll} className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors" title="Select All">
        <CheckSquare className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleCopy} className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors" title="Copy">
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleCut} className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors" title="Cut">
        <Scissors className="w-3.5 h-3.5" />
      </button>
      <button onClick={handlePaste} className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors" title="Paste">
        <Clipboard className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface NoteViewProps {
  noteId: number;
  onBack: () => void;
  onEdit: (noteId: number) => void;
  onNavigate: (noteId: number) => void;
}

export default function NoteView({ noteId, onBack, onEdit, onNavigate }: NoteViewProps) {
  const [note, setNote] = useState<{ id: number; title: string; content: string; tags: string[]; updated_at: string; metadata: string | null; locked: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [wikilinkTarget, setWikilinkTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(`/api/notes/${noteId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { if (!cancelled) { setNote(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [noteId]);

  useEffect(() => {
    if (!wikilinkTarget) return;
    fetch(`/api/notes?q=${encodeURIComponent(wikilinkTarget)}`)
      .then(r => r.json())
      .then((notes: Array<{ id: number; title: string }>) => {
        const match = notes.find(n => n.title.toLowerCase() === wikilinkTarget.toLowerCase());
        if (match) {
          onNavigate(match.id);
        }
        setWikilinkTarget(null);
      })
      .catch(() => setWikilinkTarget(null));
  }, [wikilinkTarget, onNavigate]);

  const { metadata, content: rawContent } = note ? parseFrontmatter(note.content) : { metadata: {}, content: '' };
  const hasHeadings = /^#{1,3}\s/.test(rawContent);

  function handleEdit() {
    onEdit(noteId);
  }

  function handleDelete() {
    fetch(`/api/notes/${noteId}`, { method: 'DELETE' }).then(() => onBack());
  }

  function handleToggleLock() {
    if (note?.locked) {
      const password = prompt('Enter password to unlock:');
      if (!password) return;
      fetch(`/api/notes/${noteId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }).then(r => r.json()).then(d => {
        if (d.error) alert(d.error);
        else setNote(n => n ? { ...n, locked: 0 } : n);
      });
    } else {
      const password = prompt('Set a password to lock this note:');
      if (!password) return;
      fetch(`/api/notes/${noteId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }).then(() => setNote(n => n ? { ...n, locked: 1 } : n));
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;
  if (!note) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><p className="text-gray-400">Note not found</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SelectionToolbar />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to notes
        </button>
        <div className="flex gap-6">
          {hasHeadings && (
            <aside className="hidden lg:block w-48 flex-shrink-0">
              <div className="sticky top-6"><Outline content={rawContent} /></div>
            </aside>
          )}
          <article className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{note.title}</h1>
              <NoteDropdown
                locked={note.locked}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleLock={handleToggleLock}
                title={note.title}
                content={rawContent}
              />
            </div>
            {Object.keys(metadata).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(metadata).map(([key, value]) => (
                  <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{key}:</span>{String(value)}
                  </span>
                ))}
              </div>
            )}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {note.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">#{tag}</span>
                ))}
              </div>
            )}
            <div className="prose prose-lg dark:prose-invert max-w-none overflow-hidden break-words
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
              prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-5 prose-h1:tracking-tight
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:tracking-tight prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-p:my-4 prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-li:my-1.5 prose-li:leading-relaxed prose-li:text-gray-700 dark:prose-li:text-gray-300
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:text-pink-600 dark:prose-code:text-pink-400
              prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-5 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800
              prose-blockquote:border-l-4 prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/50 dark:prose-blockquote:bg-amber-950/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline prose-a:decoration-blue-300/50 dark:prose-a:decoration-blue-500/50 hover:prose-a:decoration-blue-600
              prose-strong:text-gray-900 dark:prose-strong:text-gray-100
              prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-8
              prose-table:border-collapse prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700 prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:px-3 prose-td:py-2">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p><WikilinkText onNavigateToNote={setWikilinkTarget}>{children}</WikilinkText></p>,
                  li: ({ children }) => <li><WikilinkText onNavigateToNote={setWikilinkTarget}>{children}</WikilinkText></li>,
                  td: ({ children }) => <td><WikilinkText onNavigateToNote={setWikilinkTarget}>{children}</WikilinkText></td>,
                  th: ({ children }) => <th><WikilinkText onNavigateToNote={setWikilinkTarget}>{children}</WikilinkText></th>,
                }}
              >{rawContent}</ReactMarkdown>
            </div>
            <Backlinks noteId={noteId} onNavigate={() => window.location.reload()} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
