import { supabase } from './supabase';

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

async function attachTagsBatch(notes: Note[]): Promise<Note[]> {
  if (notes.length === 0) return [];
  const ids = notes.map(n => n.id);
  const { data: noteTags } = await supabase
    .from('note_tags')
    .select('note_id, tags(name)')
    .in('note_id', ids);
  
  const tagMap = new Map<number, string[]>();
  if (noteTags) {
    for (const row of noteTags) {
      if (!tagMap.has(row.note_id)) tagMap.set(row.note_id, []);
      const tagName = (row.tags as any)?.name;
      if (tagName) tagMap.get(row.note_id)!.push(tagName);
    }
  }
  return notes.map(n => ({ ...n, tags: tagMap.get(n.id) || [] }));
}

async function attachChecklistItems(notes: Note[]): Promise<Note[]> {
  if (notes.length === 0) return [];
  const ids = notes.map(n => n.id);
  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .in('note_id', ids)
    .order('position');
  
  const itemMap = new Map<number, ChecklistItem[]>();
  if (items) {
    for (const row of items) {
      if (!itemMap.has(row.note_id)) itemMap.set(row.note_id, []);
      itemMap.get(row.note_id)!.push(row);
    }
  }
  return notes.map(n => ({ ...n, checklist_items: itemMap.get(n.id) || [] }));
}

async function enrichNotes(notes: Note[]): Promise<Note[]> {
  let result = await attachTagsBatch(notes);
  result = await attachChecklistItems(result);
  return result;
}

export async function getAllNotes(folderId?: number | null): Promise<Note[]> {
  let query = supabase.from('notes').select('*');
  if (folderId !== undefined) {
    if (folderId === null) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }
  }
  const { data } = await query.order('pinned', { ascending: false }).order('updated_at', { ascending: false });
  return enrichNotes(data || []);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const sanitized = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  if (!sanitized) return [];
  const { data } = await supabase
    .from('notes')
    .select('*')
    .or(`title.ilike.%${sanitized}%,content.ilike.%${sanitized}%`)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  return enrichNotes(data || []);
}

export async function getNotesByTag(tagName: string): Promise<Note[]> {
  const { data: noteTags } = await supabase
    .from('note_tags')
    .select('note_id, tags(name)')
    .eq('tags.name', tagName);
  
  if (!noteTags || noteTags.length === 0) return [];
  const ids = noteTags.map(nt => nt.note_id);
  const { data } = await supabase
    .from('notes')
    .select('*')
    .in('id', ids)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  return enrichNotes(data || []);
}

export async function getNote(id: number): Promise<Note | undefined> {
  const { data } = await supabase.from('notes').select('*').eq('id', id).single();
  if (!data) return undefined;
  return (await enrichNotes([data]))[0];
}

export async function createNote(title: string, content: string, tags: string[] = [], color?: string | null, folderId?: number | null): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert({ title, content, color: color ?? null, folder_id: folderId ?? null })
    .select()
    .single();
  if (error) throw error;
  await upsertTags(data.id, tags);
  return getNote(data.id) as Promise<Note>;
}

export async function updateNote(id: number, title: string, content: string, tags: string[] = [], color?: string | null, folderId?: number | null): Promise<Note | undefined> {
  await supabase
    .from('notes')
    .update({ title, content, color: color ?? null, folder_id: folderId ?? null, updated_at: new Date().toISOString() })
    .eq('id', id);
  await supabase.from('note_tags').delete().eq('note_id', id);
  await upsertTags(id, tags);
  return getNote(id);
}

export async function updateNoteColor(id: number, color: string | null): Promise<Note | undefined> {
  await supabase.from('notes').update({ color, updated_at: new Date().toISOString() }).eq('id', id);
  return getNote(id);
}

export async function moveNoteToFolder(id: number, folderId: number | null): Promise<Note | undefined> {
  await supabase.from('notes').update({ folder_id: folderId, updated_at: new Date().toISOString() }).eq('id', id);
  return getNote(id);
}

export async function lockNote(id: number, password: string): Promise<Note | undefined> {
  await supabase.from('notes').update({ locked: 1, lock_password: password, updated_at: new Date().toISOString() }).eq('id', id);
  return getNote(id);
}

export async function unlockNote(id: number, password: string): Promise<boolean> {
  const { data } = await supabase.from('notes').select('lock_password').eq('id', id).single();
  if (!data || data.lock_password !== password) return false;
  await supabase.from('notes').update({ locked: 0, lock_password: null, updated_at: new Date().toISOString() }).eq('id', id);
  return true;
}

async function upsertTags(noteId: number, tags: string[]) {
  for (const tagName of tags) {
    const trimmed = tagName.trim();
    if (!trimmed) continue;
    const { data: existing } = await supabase.from('tags').select('id').eq('name', trimmed).single();
    let tagId = existing?.id;
    if (!tagId) {
      const { data: newTag } = await supabase.from('tags').insert({ name: trimmed }).select('id').single();
      tagId = newTag?.id;
    }
    if (tagId) {
      await supabase.from('note_tags').upsert({ note_id: noteId, tag_id: tagId });
    }
  }
}

export async function togglePin(id: number): Promise<Note | undefined> {
  const note = await getNote(id);
  if (!note) return undefined;
  const newPinned = note.pinned ? 0 : 1;
  await supabase.from('notes').update({ pinned: newPinned, updated_at: new Date().toISOString() }).eq('id', id);
  return getNote(id);
}

export async function deleteNote(id: number): Promise<boolean> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  return !error;
}

export async function getAllTags(): Promise<Tag[]> {
  const { data } = await supabase.from('tags').select('*').order('name');
  return data || [];
}

export async function getAllFolders(): Promise<Folder[]> {
  const { data } = await supabase.from('folders').select('*').order('name');
  return data || [];
}

export async function createFolder(name: string, parentId?: number | null): Promise<Folder> {
  const { data, error } = await supabase.from('folders').insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function updateFolder(id: number, name: string): Promise<Folder | undefined> {
  const { data } = await supabase.from('folders').update({ name }).eq('id', id).select().single();
  return data;
}

export async function deleteFolder(id: number): Promise<boolean> {
  const { error } = await supabase.from('folders').delete().eq('id', id);
  return !error;
}

export async function getChecklistItems(noteId: number): Promise<ChecklistItem[]> {
  const { data } = await supabase.from('checklist_items').select('*').eq('note_id', noteId).order('position');
  return data || [];
}

export async function addChecklistItem(noteId: number, text: string, position?: number): Promise<ChecklistItem> {
  const { data: maxPos } = await supabase.from('checklist_items').select('position').eq('note_id', noteId).order('position', { ascending: false }).limit(1).single();
  const pos = position ?? ((maxPos?.position ?? -1) + 1);
  const { data, error } = await supabase.from('checklist_items').insert({ note_id: noteId, text, position: pos }).select().single();
  if (error) throw error;
  return data;
}

export async function updateChecklistItem(id: number, text?: string, checked?: number): Promise<ChecklistItem | undefined> {
  const update: any = {};
  if (text !== undefined) update.text = text;
  if (checked !== undefined) update.checked = checked;
  const { data } = await supabase.from('checklist_items').update(update).eq('id', id).select().single();
  return data;
}

export async function deleteChecklistItem(id: number): Promise<boolean> {
  const { error } = await supabase.from('checklist_items').delete().eq('id', id);
  return !error;
}

export async function addNoteImage(noteId: number, filename: string, mimeType: string, data: string): Promise<NoteImage> {
  const { data: maxPos } = await supabase.from('note_images').select('position').eq('note_id', noteId).order('position', { ascending: false }).limit(1).single();
  const pos = (maxPos?.position ?? -1) + 1;
  const { data: img, error } = await supabase.from('note_images').insert({ note_id: noteId, filename, mime_type: mimeType, data, position: pos }).select().single();
  if (error) throw error;
  return img;
}

export async function deleteNoteImage(id: number): Promise<boolean> {
  const { error } = await supabase.from('note_images').delete().eq('id', id);
  return !error;
}

export async function getReminders(noteId: number): Promise<Reminder[]> {
  const { data } = await supabase.from('reminders').select('*').eq('note_id', noteId).order('remind_at');
  return data || [];
}

export async function addReminder(noteId: number, remindAt: string): Promise<Reminder> {
  const { data, error } = await supabase.from('reminders').insert({ note_id: noteId, remind_at: remindAt }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteReminder(id: number): Promise<boolean> {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  return !error;
}

export async function findNoteByTitle(title: string): Promise<Note | undefined> {
  const { data } = await supabase.from('notes').select('*').eq('title', title).single();
  return data || undefined;
}

export async function getBacklinks(noteId: number): Promise<Note[]> {
  const note = await getNote(noteId);
  if (!note) return [];
  const { data } = await supabase
    .from('notes')
    .select('*')
    .neq('id', noteId)
    .like('content', `%[[${note.title}]]%`);
  return enrichNotes(data || []);
}
