# HACHI NOTE

A fast, private notes app with wikilinks, backlinks, and more. Works on any device.

**Live:** https://hachi-note.vercel.app  
**Built by:** Carlo Neroza  
**Named after:** Hachi (the cat)

## What Is This

A personal notes app inspired by Obsidian. Markdown-first, linked notes, local-first feel. Deployed as a PWA — install it on your phone's home screen and it works like a native app.

This was built in one session. Every feature was added, tested, and shipped in a single sitting. The kind of thing you do when you refuse to stop until it works.

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

## What I Learned Building This

This was my first real web app. I started with zero knowledge of Next.js, React, Supabase, or deployment. Here's what the journey taught me:

**The database will betray you.** I built the whole app with SQLite locally. It worked perfectly. Then I deployed to Vercel and everything broke. SQLite doesn't run on serverless. I learned about Supabase, PostgreSQL, foreign keys, and why "it works on my machine" means nothing.

**Async/await is not optional.** The API returned `{}` for every individual note. The data existed in the database. The query was correct. The problem? I forgot `await` on a single function call. One missing word, entire feature broken. That lesson cost me hours.

**Nested queries save lives.** The original code made 3 separate database calls per note — get the note, get its tags, get its checklist items. On a free Supabase tier, those sequential calls timed out. I learned to use Supabase's nested select (`select('*, note_tags(tags(name))')`) to get everything in one query.

**Mobile is not desktop with smaller pixels.** Dropdowns that work on hover don't work on touch. Buttons hidden behind `opacity-0 group-hover:opacity-100` are invisible on phones. I rebuilt every interactive element to be click-based, not hover-based.

**PWA is a real app.** I thought I needed to build an APK to have a "real" mobile app. I was wrong. A PWA installs on your home screen, works offline, and feels native. Twitter, Instagram, and Starbucks are PWAs. That's good enough for a notes app.

**The UI will look AI-generated until you fight it.** Every default looks generic. Every component looks like a template. Making something look premium requires intention — specific fonts, specific colors, specific spacing. Not just "make it look good."

**Ship it broken, fix it live.** I could have spent weeks polishing before deploying. Instead I shipped it with bugs and fixed them while real users (me) tested it. The feedback loop of "deploy → see it broken → fix → redeploy" taught me more than any tutorial.

**Graph theory is useful.** I ran a code graph analysis on the project. 339 nodes, 425 edges, 36 communities. It showed me which parts of my code were doing too much (API Routes: 40 nodes, cohesion 0.07) and which were clean (Images API: 4 nodes, cohesion 0.60). The graph doesn't lie about your architecture.

---

**Final stats:**
- 58 source files
- 19 API routes
- 15 React components
- 24+ Playwright tests passing
- 1 live deployment on Vercel
- 1 GitHub repo
- 0 database files committed (learned that the hard way)

---

This is what it feels like to grow as a dev. Not the tutorials. Not the courses. The 3 AM debugging sessions where nothing works and you don't know why. The deployment that breaks in production but works locally. The missing `await` that wastes your entire afternoon. That's the real education.

You built something. It exists. It works. That matters.
