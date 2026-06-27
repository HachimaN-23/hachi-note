import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const testDbPath = path.join(process.cwd(), 'test-notes.db');

function createTestDb() {
  const db = new Database(testDbPath);
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

  return db;
}

describe('Notes Database', () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    if (fs.existsSync(testDbPath + '-wal')) fs.unlinkSync(testDbPath + '-wal');
    if (fs.existsSync(testDbPath + '-shm')) fs.unlinkSync(testDbPath + '-shm');
  });

  it('should create a note', () => {
    const result = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    expect(result.changes).toBe(1);
    expect(result.lastInsertRowid).toBeDefined();
  });

  it('should retrieve a note by id', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    const note = db.prepare('SELECT * FROM notes WHERE id = 1').get() as Record<string, unknown>;
    expect(note).toBeDefined();
    expect(note.title).toBe('Test');
    expect(note.content).toBe('Content');
  });

  it('should update a note', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    db.prepare('UPDATE notes SET title = ?, content = ? WHERE id = 1').run('Updated', 'New content');
    const note = db.prepare('SELECT * FROM notes WHERE id = 1').get() as Record<string, unknown>;
    expect(note.title).toBe('Updated');
    expect(note.content).toBe('New content');
  });

  it('should delete a note', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    const result = db.prepare('DELETE FROM notes WHERE id = 1').run();
    expect(result.changes).toBe(1);
    const note = db.prepare('SELECT * FROM notes WHERE id = 1').get();
    expect(note).toBeUndefined();
  });

  it('should toggle pin', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    let note = db.prepare('SELECT * FROM notes WHERE id = 1').get() as Record<string, unknown>;
    expect(note.pinned).toBe(0);

    db.prepare('UPDATE notes SET pinned = 1 WHERE id = 1').run();
    note = db.prepare('SELECT * FROM notes WHERE id = 1').get() as Record<string, unknown>;
    expect(note.pinned).toBe(1);
  });

  it('should add and retrieve tags', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    db.prepare('INSERT INTO tags (name) VALUES (?)').run('important');
    db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(1, 1);

    const tags = db.prepare('SELECT t.name FROM tags t JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?').all(1) as Array<Record<string, unknown>>;;
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe('important');
  });

  it('should search notes via FTS', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Hello World', 'This is a test');
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Another Note', 'Different content');

    const results = db.prepare('SELECT rowid FROM notes_fts WHERE notes_fts MATCH ?').all('Hello') as Array<Record<string, unknown>>;;
    expect(results).toHaveLength(1);
    expect(results[0].rowid).toBe(1);
  });

  it('should cascade delete tags when note is deleted', () => {
    db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run('Test', 'Content');
    db.prepare('INSERT INTO tags (name) VALUES (?)').run('tag1');
    db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(1, 1);

    db.prepare('DELETE FROM notes WHERE id = 1').run();
    const noteTags = db.prepare('SELECT * FROM note_tags WHERE note_id = 1').all();
    expect(noteTags).toHaveLength(0);
  });
});
