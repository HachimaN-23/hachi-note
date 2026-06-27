# Graph Report - .  (2026-06-27)

## Corpus Check
- Corpus is ~21,486 words - fits in a single context window. You may not need a graph.

## Summary
- 236 nodes · 306 edges · 28 communities (19 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Routes & Database|API Routes & Database]]
- [[_COMMUNITY_App Layout & Theme|App Layout & Theme]]
- [[_COMMUNITY_Main Page & Export|Main Page & Export]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Note Card Component|Note Card Component]]
- [[_COMMUNITY_Checklist API|Checklist API]]
- [[_COMMUNITY_Documentation & Assets|Documentation & Assets]]
- [[_COMMUNITY_DB Enrichment Functions|DB Enrichment Functions]]
- [[_COMMUNITY_PWA Manifest|PWA Manifest]]
- [[_COMMUNITY_Reminders API|Reminders API]]
- [[_COMMUNITY_Folders API|Folders API]]
- [[_COMMUNITY_Images API|Images API]]
- [[_COMMUNITY_Folder Management|Folder Management]]
- [[_COMMUNITY_Test Suite|Test Suite]]
- [[_COMMUNITY_Playwright Reports|Playwright Reports]]
- [[_COMMUNITY_App Icons|App Icons]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_File Icon|File Icon]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]
- [[_COMMUNITY_Window Icon|Window Icon]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `getNote()` - 12 edges
3. `scripts` - 8 edges
4. `enrichNotes()` - 8 edges
5. `createNote()` - 5 edges
6. `updateNote()` - 5 edges
7. `addChecklistItem()` - 5 edges
8. `Next.js Framework` - 5 edges
9. `POST()` - 4 edges
10. `GET()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Logo` --references--> `Next.js Framework`  [EXTRACTED]
  public/next.svg → README.md
- `Vercel Logo` --references--> `Vercel Deployment Platform`  [EXTRACTED]
  public/vercel.svg → README.md
- `Next.js Breaking Changes Warning` --rationale_for--> `Next.js Framework`  [INFERRED]
  AGENTS.md → README.md
- `Skill Routing Logic` --conceptually_related_to--> `Next.js Framework`  [INFERRED]
  CLAUDE.md → README.md
- `GET()` --calls--> `getNote()`  [INFERRED]
  src/app/api/notes/[id]/route.ts → src/lib/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js + Vercel Deployment Ecosystem** — nextjs_framework, vercel_platform, nextjs_agent_rules, crud_test_readme_md, crud_test_public_next_svg, crud_test_public_vercel_svg [INFERRED 0.85]
- **Project Configuration & Agent Documents** — crud_test_agents_md, crud_test_claude_md, nextjs_agent_rules, skill_routing_rules [EXTRACTED 1.00]

## Communities (28 total, 9 thin omitted)

### Community 0 - "API Routes & Database"
Cohesion: 0.09
Nodes (30): POST(), GET(), ChecklistItem, createNote(), db, dbPath, deleteNote(), getAllTags() (+22 more)

### Community 1 - "App Layout & Theme"
Cohesion: 0.09
Nodes (16): geistMono, geistSans, metadata, viewport, systemListeners, Theme, ThemeContext, themeListeners (+8 more)

### Community 2 - "Main Page & Export"
Cohesion: 0.09
Nodes (14): Home(), ExportMenu(), ExportMenuProps, Note, ChecklistInput, ChecklistItem, Folder, NOTE_COLORS (+6 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, better-sqlite3, lucide-react, next, react, react-dom, react-markdown, name (+10 more)

### Community 5 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, @playwright/test, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom (+7 more)

### Community 6 - "Note Card Component"
Cohesion: 0.18
Nodes (6): ChecklistItem, NOTE_COLORS, NoteCardProps, NoteDropdownProps, TagFilterProps, getTagColor()

### Community 7 - "Checklist API"
Cohesion: 0.29
Nodes (9): DELETE(), GET(), POST(), PUT(), addChecklistItem(), deleteChecklistItem(), getChecklistItems(), updateChecklistItem() (+1 more)

### Community 8 - "Documentation & Assets"
Cohesion: 0.28
Nodes (9): Next.js Agent Rules, Skill Routing Configuration, Next.js Logo, Vercel Logo, Project Setup Documentation, Next.js Breaking Changes Warning, Next.js Framework, Skill Routing Logic (+1 more)

### Community 9 - "DB Enrichment Functions"
Cohesion: 0.36
Nodes (8): attachChecklistItems(), attachImages(), attachTagsBatch(), enrichNotes(), getAllNotes(), getNotesByTag(), searchNotes(), GET()

### Community 10 - "PWA Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Reminders API"
Cohesion: 0.43
Nodes (6): addReminder(), deleteReminder(), getReminders(), DELETE(), GET(), POST()

### Community 12 - "Folders API"
Cohesion: 0.60
Nodes (4): GET(), POST(), createFolder(), getAllFolders()

### Community 13 - "Images API"
Cohesion: 0.60
Nodes (4): DELETE(), POST(), addNoteImage(), deleteNoteImage()

### Community 14 - "Folder Management"
Cohesion: 0.60
Nodes (4): deleteFolder(), updateFolder(), DELETE(), PUT()

## Knowledge Gaps
- **104 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies` to `Package Dependencies`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Database` be split into smaller, more focused modules?**
  _Cohesion score 0.0858974358974359 - nodes in this community are weakly interconnected._
- **Should `App Layout & Theme` be split into smaller, more focused modules?**
  _Cohesion score 0.08923076923076922 - nodes in this community are weakly interconnected._
- **Should `Main Page & Export` be split into smaller, more focused modules?**
  _Cohesion score 0.09420289855072464 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._