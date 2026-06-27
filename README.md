# HACHI NOTE

A fast, private notes app with wikilinks, backlinks, and more. Works on any device.

**Live:** https://hachi-note.vercel.app

## Features

### Core Notes
- **Markdown Rendering** — Full markdown support (headings, lists, code blocks, tables, blockquotes)
- **Folders** — Organize notes into folders, filter by folder, rename/delete via dropdown
- **Tags** — Add tags to notes, filter by tag
- **Search** — Full-text search across all notes
- **Checklists** — Toggle between note and checklist mode
- **Note Colors** — Color-coded notes with colored left borders
- **Pin Notes** — Pin important notes to the top
- **Grid/List Toggle** — Switch between card grid and compact list view

### Linked Notes
- **Wikilinks** — Type `[[Note Title]]` to link notes together. Click to navigate instantly (no page reload).
- **Backlinks** — See which notes reference the current note
- **Daily Notes** — Click "Today" to create/open today's dated note with YAML frontmatter
- **Outline** — Heading navigator sidebar (H1/H2/H3), click to jump to section
- **YAML Frontmatter** — Add `---` blocks at the top of notes for structured metadata
- **Wikilink Autocomplete** — Type `[[` in the editor to see note suggestions

### Note Management
- **Lock Notes** — Password-protect sensitive notes
- **Reminders** — Set reminder dates on notes
- **Quick Notes** — Scratch pad (works on mobile + desktop)
- **Image Attachments** — Attach images to notes
- **Export** — Export notes as JSON, Markdown, or CSV

### Dropdowns & Menus
- **Note Card Menu** — 3-dot dropdown: Edit, Copy, Lock/Unlock, Delete
- **NoteView Menu** — 3-dot dropdown: Edit, Copy, Lock/Unlock, Delete
- **Folder Menu** — 3-dot dropdown: Add note, Rename (inline edit), Delete (with confirm)
- **Text Selection Toolbar** — Select text in NoteView to get Select All, Copy, Cut, Paste

### Mobile (PWA)
- Installable as app on iOS/Android home screen
- Offline support via service worker
- Quick Note button + FAB (both visible)
- Folder dropdowns with Add note, Rename, Delete
- 3-dot dropdown on note cards and NoteView
- NoteView with white card container (no text overflow)
- Text selection toolbar
- Word-break on long content (no horizontal scroll)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Markdown**: `react-markdown`
- **Frontmatter**: `js-yaml`
- **Deployment**: Vercel
- **Testing**: Playwright (e2e), Vitest (unit)

## Getting Started

```bash
npm install
cp .env.example .env.local  # add your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── notes/              # CRUD + sub-routes
│   │   │   ├── [id]/
│   │   │   │   ├── backlinks/  # GET backlinks for a note
│   │   │   │   ├── checklist/  # Checklist item CRUD
│   │   │   │   ├── color/      # Update note color
│   │   │   │   ├── images/     # Image attachments
│   │   │   │   ├── lock/       # Lock/unlock notes
│   │   │   │   ├── move/       # Move note to folder
│   │   │   │   ├── pin/        # Toggle pin
│   │   │   │   └── reminders/  # Reminder CRUD
│   │   │   └── route.ts        # GET/POST notes
│   │   ├── daily-notes/        # POST create/open today's note
│   │   ├── folders/            # Folder CRUD (GET/POST/PUT/DELETE)
│   │   └── tags/               # Tag listing
│   └── page.tsx                # Main page
├── components/
│   ├── Backlinks.tsx           # Backlinks panel
│   ├── DailyNoteButton.tsx     # "Today" button
│   ├── FolderDropdown.tsx      # Folder menu (Add note/Rename/Delete)
│   ├── NoteCard.tsx            # Note card with colored border
│   ├── NoteDropdown.tsx        # 3-dot menu (Edit/Copy/Lock/Delete)
│   ├── NoteForm.tsx            # Create/edit with wikilink autocomplete
│   ├── NoteView.tsx            # Full note view with outline + backlinks + dropdown + text selection
│   ├── Outline.tsx             # Heading navigator sidebar
│   ├── QuickNote.tsx           # Scratch pad (mobile + desktop)
│   └── ...                     # Theme, Toast, Search, etc.
└── lib/
    ├── supabase.ts             # Supabase client
    ├── supabase-db.ts          # Supabase database layer
    └── frontmatter.ts          # YAML frontmatter parser
```

## Wikilinks Syntax

```markdown
[[Note Title]]                → links to "Note Title"
[[Note Title|Display Text]]   → shows "Display Text", links to "Note Title"
```

## YAML Frontmatter

```markdown
---
date: 2026-06-27
type: daily
tags: [react, nextjs]
---

# Actual content here
```

Frontmatter tags are merged with the tag system. Custom fields are stored as JSON metadata.
