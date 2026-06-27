'use client';

import { useState, useEffect } from 'react';
import NoteCard from '@/components/NoteCard';
import NoteForm from '@/components/NoteForm';
import NoteView from '@/components/NoteView';
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';
import ThemeToggle from '@/components/ThemeToggle';
import ExportMenu from '@/components/ExportMenu';
import QuickNote from '@/components/QuickNote';
import DailyNoteButton from '@/components/DailyNoteButton';
import FolderDropdown from '@/components/FolderDropdown';
import type { Note, Folder } from '@/lib/db';
import { Plus, X, Cat, FolderOpen, PlusCircle, LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function Home() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<number | null | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [viewingNoteId, setViewingNoteId] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => refreshAll();
    window.addEventListener('notes-updated', handler);
    return () => window.removeEventListener('notes-updated', handler);
  });

  function buildNotesUrl() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeTag) params.set('tag', activeTag);
    if (activeFolder !== undefined && activeFolder !== null) params.set('folder', String(activeFolder));
    if (activeFolder === null && !searchQuery && !activeTag) params.set('folder', 'none');
    return `/api/notes${params.toString() ? `?${params}` : ''}`;
  }

  useEffect(() => {
    fetch(buildNotesUrl()).then(r => r.json()).then(setNotes).catch(() => toast('Failed to load notes'));
  }, [searchQuery, activeTag, activeFolder, toast]);

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(data => setAllTags(data.map((t: { name: string }) => t.name))).catch(() => {});
    fetch('/api/folders').then(r => r.json()).then(setFolders).catch(() => {});
  }, []);

  async function handleSubmit(data: { title: string; content: string; tags: string[]; color: string | null; folder_id: number | null; checklist_items: { id?: number; text: string; checked: number }[]; reminder_at: string | null }) {
    try {
      let noteId: number | null = null;
      if (editingId) {
        await fetch(`/api/notes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        noteId = editingId;
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const created = await res.json();
        noteId = created.id;
      }

      if (noteId && data.reminder_at) {
        await fetch(`/api/notes/${noteId}/reminders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ remind_at: data.reminder_at }),
        });
      }

      setEditingId(null);
      setShowForm(false);
      refreshAll();
    } catch {
      toast('Failed to save note');
    }
  }

  function refreshAll() {
    fetch(buildNotesUrl()).then(r => r.json()).then(setNotes).catch(() => {});
    fetch('/api/tags').then(r => r.json()).then(data => setAllTags(data.map((t: { name: string }) => t.name))).catch(() => {});
    fetch('/api/folders').then(r => r.json()).then(setFolders).catch(() => {});
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      refreshAll();
    } catch {
      toast('Failed to delete note');
    }
  }

  async function handleTogglePin(id: number) {
    try {
      await fetch(`/api/notes/${id}/pin`, { method: 'POST' });
      refreshAll();
    } catch {
      toast('Failed to toggle pin');
    }
  }

  async function handleToggleCheck(itemId: number, checked: boolean) {
    try {
      await fetch('/api/notes/0/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, checked: checked ? 1 : 0 }),
      });
      refreshAll();
    } catch {
      toast('Failed to update checklist');
    }
  }

  async function handleToggleLock(id: number) {
    const note = notes.find(n => n.id === id);
    if (note?.locked) {
      const password = prompt('Enter password to unlock:');
      if (!password) return;
      try {
        const res = await fetch(`/api/notes/${id}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error || 'Incorrect password');
          return;
        }
        toast('Note unlocked');
        refreshAll();
      } catch {
        toast('Failed to unlock');
      }
    } else {
      const password = prompt('Set a password to lock this note:');
      if (!password) return;
      try {
        await fetch(`/api/notes/${id}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        toast('Note locked');
        refreshAll();
      } catch {
        toast('Failed to lock');
      }
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      setNewFolderName('');
      setShowFolderInput(false);
      fetch('/api/folders').then(r => r.json()).then(setFolders).catch(() => {});
    } catch {
      toast('Failed to create folder');
    }
  }

  async function handleRenameFolder(id: number, name: string) {
    try {
      await fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      fetch('/api/folders').then(r => r.json()).then(setFolders).catch(() => {});
    } catch {
      toast('Failed to rename folder');
    }
  }

  async function handleDeleteFolder(id: number) {
    try {
      await fetch(`/api/folders/${id}`, { method: 'DELETE' });
      if (activeFolder === id) setActiveFolder(undefined);
      fetch('/api/folders').then(r => r.json()).then(setFolders).catch(() => {});
    } catch {
      toast('Failed to delete folder');
    }
  }

  function handleAddNoteToFolder(folderId: number) {
    setActiveFolder(folderId);
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(note: Note) {
    setEditingId(note.id);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingId(null);
    setShowForm(false);
  }

  const editingNote = editingId ? notes.find(n => n.id === editingId) : null;

  if (viewingNoteId) {
    return <NoteView noteId={viewingNoteId} onBack={() => { setViewingNoteId(null); refreshAll(); }} onEdit={(id) => { setViewingNoteId(null); setEditingId(id); setShowForm(true); }} onNavigate={(id) => setViewingNoteId(id)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Cat className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">HACHI NOTE</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <DailyNoteButton onNoteCreated={(id) => setViewingNoteId(id)} />
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={viewMode === 'list' ? 'Grid view' : 'List view'}
            >
              {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
            <ExportMenu notes={notes} />
            <ThemeToggle />
          </div>
        </header>

        {showForm && (
          <NoteForm
            editingId={editingId}
            initialTitle={editingNote?.title || ''}
            initialContent={editingNote?.content || ''}
            initialTags={editingNote?.tags || []}
            initialColor={editingNote?.color || null}
            initialFolderId={editingNote?.folder_id ?? (!editingId && activeFolder != null ? activeFolder : null)}
            initialChecklistItems={editingNote?.checklist_items || []}
            folders={folders}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />

        {folders.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setActiveFolder(undefined)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeFolder === undefined ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              All
            </button>
            {folders.map(f => (
              <div key={f.id} className="flex items-center">
                <button
                  onClick={() => setActiveFolder(f.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-l-full text-xs font-medium transition-all ${activeFolder === f.id ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <FolderOpen className="w-3 h-3" />
                  {f.name}
                </button>
                <FolderDropdown
                  folderId={f.id}
                  folderName={f.name}
                  onRename={handleRenameFolder}
                  onDelete={handleDeleteFolder}
                  onAddNote={handleAddNoteToFolder}
                />
              </div>
            ))}
            <button
              onClick={() => setShowFolderInput(!showFolderInput)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
            >
              <PlusCircle className="w-3 h-3" />
              New
            </button>
          </div>
        )}

        {showFolderInput && (
          <div className="flex items-center gap-2 mb-4">
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name..."
              className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-amber-400"
            />
            <button onClick={handleCreateFolder} className="px-3 py-1.5 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg">Add</button>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
              <Cat className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery || activeTag ? 'No notes match your search.' : 'No notes yet. Create one!'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {notes.map(note => (
              <NoteCard
                key={note.id}
                title={note.title}
                content={note.content}
                pinned={note.pinned}
                color={note.color}
                locked={note.locked}
                tags={note.tags}
                checklist_items={note.checklist_items}
                updated_at={note.updated_at}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDelete(note.id)}
                onTogglePin={() => handleTogglePin(note.id)}
                onToggleCheck={(itemId, checked) => handleToggleCheck(itemId, checked)}
                onToggleLock={() => handleToggleLock(note.id)}
                onClick={() => setViewingNoteId(note.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Note */}
      <QuickNote />

      {/* Floating Action Button */}
      <button
        onClick={() => { setShowForm(!showForm); setEditingId(null); }}
        aria-label={showForm ? 'Close' : 'New note'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          showForm
            ? 'bg-gray-500 dark:bg-gray-600 text-white rotate-45'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white fab-pulse'
        }`}
        title={showForm ? 'Close' : 'New note'}
      >
        {showForm ? <X className="w-5 h-5 -rotate-45" /> : <Plus className="w-5 h-5" />}
      </button>
    </div>
  );
}
