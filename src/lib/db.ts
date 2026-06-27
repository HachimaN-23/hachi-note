import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'notes.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasPinned = db.prepare("PRAGMA table_info(notes)").all().some((col: any) => col.name === 'pinned');
if (!hasPinned) {
  db.exec("ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasColor = db.prepare("PRAGMA table_info(notes)").all().some((col: any) => col.name === 'color');
if (!hasColor) {
  db.exec("ALTER TABLE notes ADD COLUMN color TEXT");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasFolderId = db.prepare("PRAGMA table_info(notes)").all().some((col: any) => col.name === 'folder_id');
if (!hasFolderId) {
  db.exec("ALTER TABLE notes ADD COLUMN folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasLocked = db.prepare("PRAGMA table_info(notes)").all().some((col: any) => col.name === 'locked');
if (!hasLocked) {
  db.exec("ALTER TABLE notes ADD COLUMN locked INTEGER NOT NULL DEFAULT 0");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasLockPassword = db.prepare("PRAGMA table_info(notes)").all().some((col: any) => col.name === 'lock_password');
if (!hasLockPassword) {
  db.exec("ALTER TABLE notes ADD COLUMN lock_password TEXT");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasMetadata = db.prepare("PRAGMA table_info(notes)").all().some((col: any) => col.name === 'metadata');
if (!hasMetadata) {
  db.exec("ALTER TABLE notes ADD COLUMN metadata TEXT");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    checked INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS note_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'image/png',
    data TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    remind_at TEXT NOT NULL,
    notified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title, content, content=notes, content_rowid=id
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
  END
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END
`);

export interface Note {
  id: number;
  title: string;
  content: string;
  pinned: number;
  color: string | null;
  folder_id: number | null;
  locked: number;
  lock_password: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  checklist_items?: ChecklistItem[];
  images?: NoteImage[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  note_id: number;
  text: string;
  checked: number;
  position: number;
}

export interface NoteImage {
  id: number;
  note_id: number;
  filename: string;
  mime_type: string;
  data: string;
  position: number;
  created_at: string;
}

export interface Reminder {
  id: number;
  note_id: number;
  remind_at: string;
  notified: number;
  created_at: string;
}

function attachTagsBatch(notes: Note[]): Note[] {
  if (notes.length === 0) return [];
  const ids = notes.map(n => n.id);
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT nt.note_id, t.name FROM note_tags nt
    JOIN tags t ON nt.tag_id = t.id
    WHERE nt.note_id IN (${placeholders})
  `).all(...ids) as Array<{ note_id: number; name: string }>;
  const tagMap = new Map<number, string[]>();
  for (const row of rows) {
    if (!tagMap.has(row.note_id)) tagMap.set(row.note_id, []);
    tagMap.get(row.note_id)!.push(row.name);
  }
  return notes.map(n => ({ ...n, tags: tagMap.get(n.id) || [] }));
}

function attachChecklistItems(notes: Note[]): Note[] {
  if (notes.length === 0) return [];
  const ids = notes.map(n => n.id);
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT * FROM checklist_items WHERE note_id IN (${placeholders}) ORDER BY position
  `).all(...ids) as ChecklistItem[];
  const itemMap = new Map<number, ChecklistItem[]>();
  for (const row of rows) {
    if (!itemMap.has(row.note_id)) itemMap.set(row.note_id, []);
    itemMap.get(row.note_id)!.push(row);
  }
  return notes.map(n => ({ ...n, checklist_items: itemMap.get(n.id) || [] }));
}

function attachImages(notes: Note[]): Note[] {
  if (notes.length === 0) return [];
  const ids = notes.map(n => n.id);
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT id, note_id, filename, mime_type, position, created_at FROM note_images WHERE note_id IN (${placeholders}) ORDER BY position
  `).all(...ids) as NoteImage[];
  const imgMap = new Map<number, NoteImage[]>();
  for (const row of rows) {
    if (!imgMap.has(row.note_id)) imgMap.set(row.note_id, []);
    imgMap.get(row.note_id)!.push(row);
  }
  return notes.map(n => ({ ...n, images: imgMap.get(n.id) || [] }));
}

function enrichNotes(notes: Note[]): Note[] {
  let result = attachTagsBatch(notes);
  result = attachChecklistItems(result);
  result = attachImages(result);
  return result;
}

export function getAllNotes(folderId?: number | null): Note[] {
  let sql = 'SELECT * FROM notes';
  const params: (number | null)[] = [];
  if (folderId !== undefined) {
    if (folderId === null) {
      sql += ' WHERE folder_id IS NULL';
    } else {
      sql += ' WHERE folder_id = ?';
      params.push(folderId);
    }
  }
  sql += ' ORDER BY pinned DESC, updated_at DESC';
  const notes = db.prepare(sql).all(...params) as Note[];
  return enrichNotes(notes);
}

export function searchNotes(query: string): Note[] {
  const sanitized = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  if (!sanitized) return [];
  const terms = sanitized.split(/\s+/).filter(Boolean);
  const ftsQuery = terms.map(t => `"${t}"`).join(' AND ');
  const ftsResults = db.prepare(`
    SELECT rowid FROM notes_fts WHERE notes_fts MATCH ?
  `).all(ftsQuery) as { rowid: number }[];
  const ids = ftsResults.map(r => r.rowid);
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const notes = db.prepare(`SELECT * FROM notes WHERE id IN (${placeholders}) ORDER BY pinned DESC, updated_at DESC`).all(...ids) as Note[];
  return enrichNotes(notes);
}

export function getNotesByTag(tagName: string): Note[] {
  const notes = db.prepare(`
    SELECT n.* FROM notes n
    JOIN note_tags nt ON n.id = nt.note_id
    JOIN tags t ON nt.tag_id = t.id
    WHERE t.name = ?
    ORDER BY n.pinned DESC, n.updated_at DESC
  `).all(tagName) as Note[];
  return enrichNotes(notes);
}

export function getNote(id: number): Note | undefined {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined;
  if (!note) return undefined;
  return enrichNotes([note])[0];
}

export function createNote(title: string, content: string, tags: string[] = [], color?: string | null, folderId?: number | null): Note {
  const result = db.prepare('INSERT INTO notes (title, content, color, folder_id) VALUES (?, ?, ?, ?)').run(title, content, color ?? null, folderId ?? null);
  const noteId = result.lastInsertRowid as number;
  upsertTags(noteId, tags);
  return getNote(noteId)!;
}

export function updateNote(id: number, title: string, content: string, tags: string[] = [], color?: string | null, folderId?: number | null): Note | undefined {
  db.prepare("UPDATE notes SET title = ?, content = ?, color = ?, folder_id = ?, updated_at = datetime('now') WHERE id = ?").run(title, content, color ?? null, folderId ?? null, id);
  db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id);
  upsertTags(id, tags);
  return getNote(id);
}

export function updateNoteColor(id: number, color: string | null): Note | undefined {
  db.prepare("UPDATE notes SET color = ?, updated_at = datetime('now') WHERE id = ?").run(color, id);
  return getNote(id);
}

export function moveNoteToFolder(id: number, folderId: number | null): Note | undefined {
  db.prepare("UPDATE notes SET folder_id = ?, updated_at = datetime('now') WHERE id = ?").run(folderId, id);
  return getNote(id);
}

export function lockNote(id: number, password: string): Note | undefined {
  db.prepare("UPDATE notes SET locked = 1, lock_password = ?, updated_at = datetime('now') WHERE id = ?").run(password, id);
  return getNote(id);
}

export function unlockNote(id: number, password: string): boolean {
  const note = db.prepare('SELECT lock_password FROM notes WHERE id = ?').get(id) as { lock_password: string | null } | undefined;
  if (!note || note.lock_password !== password) return false;
  db.prepare("UPDATE notes SET locked = 0, lock_password = NULL, updated_at = datetime('now') WHERE id = ?").run(id);
  return true;
}

function upsertTags(noteId: number, tags: string[]) {
  for (const tagName of tags) {
    const trimmed = tagName.trim();
    if (!trimmed) continue;
    db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(trimmed);
    const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(trimmed) as Tag;
    if (tag) {
      db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(noteId, tag.id);
    }
  }
}

export function togglePin(id: number): Note | undefined {
  const note = getNote(id);
  if (!note) return undefined;
  const newPinned = note.pinned ? 0 : 1;
  db.prepare("UPDATE notes SET pinned = ?, updated_at = datetime('now') WHERE id = ?").run(newPinned, id);
  return getNote(id);
}

export function deleteNote(id: number): boolean {
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getAllTags(): Tag[] {
  return db.prepare('SELECT * FROM tags ORDER BY name').all() as Tag[];
}

// --- Folders ---
export function getAllFolders(): Folder[] {
  return db.prepare('SELECT * FROM folders ORDER BY name').all() as Folder[];
}

export function createFolder(name: string, parentId?: number | null): Folder {
  const result = db.prepare('INSERT INTO folders (name, parent_id) VALUES (?, ?)').run(name, parentId ?? null);
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(result.lastInsertRowid) as Folder;
}

export function updateFolder(id: number, name: string): Folder | undefined {
  db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(name, id);
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as Folder | undefined;
}

export function deleteFolder(id: number): boolean {
  const result = db.prepare('DELETE FROM folders WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Checklist Items ---
export function getChecklistItems(noteId: number): ChecklistItem[] {
  return db.prepare('SELECT * FROM checklist_items WHERE note_id = ? ORDER BY position').all(noteId) as ChecklistItem[];
}

export function addChecklistItem(noteId: number, text: string, position?: number): ChecklistItem {
  const pos = position ?? (db.prepare('SELECT COALESCE(MAX(position), -1) + 1 FROM checklist_items WHERE note_id = ?').get(noteId) as { 'COALESCE(MAX(position), -1) + 1': number })['COALESCE(MAX(position), -1) + 1'];
  const result = db.prepare('INSERT INTO checklist_items (note_id, text, position) VALUES (?, ?, ?)').run(noteId, text, pos);
  return db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(result.lastInsertRowid) as ChecklistItem;
}

export function updateChecklistItem(id: number, text?: string, checked?: number): ChecklistItem | undefined {
  if (text !== undefined) {
    db.prepare('UPDATE checklist_items SET text = ? WHERE id = ?').run(text, id);
  }
  if (checked !== undefined) {
    db.prepare('UPDATE checklist_items SET checked = ? WHERE id = ?').run(checked, id);
  }
  return db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id) as ChecklistItem | undefined;
}

export function deleteChecklistItem(id: number): boolean {
  const result = db.prepare('DELETE FROM checklist_items WHERE id = ?').run(id);
  return result.changes > 0;
}

export function reorderChecklistItems(noteId: number, itemIds: number[]): void {
  const stmt = db.prepare('UPDATE checklist_items SET position = ? WHERE id = ? AND note_id = ?');
  const reorder = db.transaction(() => {
    for (let i = 0; i < itemIds.length; i++) {
      stmt.run(i, itemIds[i], noteId);
    }
  });
  reorder();
}

// --- Note Images ---
export function addNoteImage(noteId: number, filename: string, mimeType: string, data: string): NoteImage {
  const pos = (db.prepare('SELECT COALESCE(MAX(position), -1) + 1 FROM note_images WHERE note_id = ?').get(noteId) as { 'COALESCE(MAX(position), -1) + 1': number })['COALESCE(MAX(position), -1) + 1'];
  const result = db.prepare('INSERT INTO note_images (note_id, filename, mime_type, data, position) VALUES (?, ?, ?, ?, ?)').run(noteId, filename, mimeType, data, pos);
  return db.prepare('SELECT id, note_id, filename, mime_type, position, created_at FROM note_images WHERE id = ?').get(result.lastInsertRowid) as NoteImage;
}

export function deleteNoteImage(id: number): boolean {
  const result = db.prepare('DELETE FROM note_images WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Reminders ---
export function getReminders(noteId: number): Reminder[] {
  return db.prepare('SELECT * FROM reminders WHERE note_id = ? ORDER BY remind_at').all(noteId) as Reminder[];
}

export function getUpcomingReminders(): Reminder[] {
  return db.prepare("SELECT * FROM reminders WHERE notified = 0 AND remind_at <= datetime('now', '+5 minutes') ORDER BY remind_at").all() as Reminder[];
}

export function addReminder(noteId: number, remindAt: string): Reminder {
  const result = db.prepare('INSERT INTO reminders (note_id, remind_at) VALUES (?, ?)').run(noteId, remindAt);
  return db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid) as Reminder;
}

export function markReminderNotified(id: number): void {
  db.prepare('UPDATE reminders SET notified = 1 WHERE id = ?').run(id);
}

export function deleteReminder(id: number): boolean {
  const result = db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Wikilinks ---
export function findNoteByTitle(title: string): Note | undefined {
  return db.prepare('SELECT * FROM notes WHERE title = ?').get(title) as Note | undefined;
}

export function getBacklinks(noteId: number): Note[] {
  const note = getNote(noteId);
  if (!note) return [];
  const pattern = `[[${note.title}]]`;
  const notes = db.prepare(
    'SELECT * FROM notes WHERE id != ? AND content LIKE ?'
  ).all(noteId, `%${pattern}%`) as Note[];
  return enrichNotes(notes);
}

export default db;
