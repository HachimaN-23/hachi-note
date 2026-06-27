import { NextResponse } from 'next/server';
import { createNote, findNoteByTitle, getAllFolders, createFolder } from '@/lib/db';

export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const title = today;

    const existing = findNoteByTitle(title);
    if (existing) {
      return NextResponse.json(existing);
    }

    const folders = getAllFolders();
    let dailyFolder = folders.find(f => f.name === 'Daily Notes');
    if (!dailyFolder) {
      dailyFolder = createFolder('Daily Notes');
    }

    const frontmatter = `---\ndate: ${today}\ntype: daily\n---\n\n`;
    const content = `# ${today}\n\n`;

    const note = createNote(title, frontmatter + content, [], null, dailyFolder.id);
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create daily note' }, { status: 500 });
  }
}
