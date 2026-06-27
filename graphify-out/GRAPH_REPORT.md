# Graph Report - crud-test  (2026-06-27)

## Corpus Check
- 50 files · ~26,647 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 320 nodes · 408 edges · 32 communities (21 shown, 11 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f0a1d75`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `CEO Plan: HACHI NOTE — Obsidian-Inspired Features` - 15 edges
3. `getNote()` - 13 edges
4. `enrichNotes()` - 9 edges
5. `Architecture Review` - 9 edges
6. `scripts` - 8 edges
7. `Implementation Tasks` - 8 edges
8. `HACHI NOTE` - 8 edges
9. `createNote()` - 7 edges
10. `Features` - 6 edges

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

## Communities (32 total, 11 thin omitted)

### Community 0 - "API Routes & Database"
Cohesion: 0.07
Nodes (40): GET(), POST(), GET(), attachChecklistItems(), attachImages(), attachTagsBatch(), ChecklistItem, db (+32 more)

### Community 1 - "App Layout & Theme"
Cohesion: 0.09
Nodes (16): geistMono, geistSans, metadata, viewport, systemListeners, Theme, ThemeContext, themeListeners (+8 more)

### Community 2 - "Main Page & Export"
Cohesion: 0.08
Nodes (18): Home(), DailyNoteButton(), DailyNoteButtonProps, ExportMenu(), ExportMenuProps, Note, FolderDropdown(), FolderDropdownProps (+10 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:e2e, test:watch

### Community 5 - "Dev Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, better-sqlite3, js-yaml, lucide-react, next, react, react-dom, react-markdown (+20 more)

### Community 6 - "Note Card Component"
Cohesion: 0.10
Nodes (16): BacklinkNote, Backlinks(), BacklinksProps, ChecklistItem, NOTE_COLORS, NoteCardProps, NoteDropdown(), NoteDropdownProps (+8 more)

### Community 7 - "Checklist API"
Cohesion: 0.29
Nodes (9): DELETE(), GET(), POST(), PUT(), addChecklistItem(), deleteChecklistItem(), getChecklistItems(), updateChecklistItem() (+1 more)

### Community 8 - "Documentation & Assets"
Cohesion: 0.28
Nodes (9): Next.js Agent Rules, Skill Routing Configuration, Next.js Logo, Vercel Logo, Project Setup Documentation, Next.js Breaking Changes Warning, Next.js Framework, Skill Routing Logic (+1 more)

### Community 9 - "DB Enrichment Functions"
Cohesion: 0.06
Nodes (30): Accepted Scope, Architecture Review, CEO Plan: HACHI NOTE — Obsidian-Inspired Features, Current State, Data Flow — Backlinks, Data Flow — Daily Notes, Data Flow — Outline, Data Flow — Wikilinks (+22 more)

### Community 10 - "PWA Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Reminders API"
Cohesion: 0.43
Nodes (6): addReminder(), deleteReminder(), getReminders(), DELETE(), GET(), POST()

### Community 12 - "Folders API"
Cohesion: 0.42
Nodes (7): POST(), GET(), POST(), createFolder(), createNote(), findNoteByTitle(), getAllFolders()

### Community 13 - "Images API"
Cohesion: 0.60
Nodes (4): DELETE(), POST(), addNoteImage(), deleteNoteImage()

### Community 14 - "Folder Management"
Cohesion: 0.60
Nodes (4): deleteFolder(), updateFolder(), DELETE(), PUT()

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (13): Core Notes, Dropdowns & Menus, Features, Getting Started, HACHI NOTE, Mobile, Note Management, Obsidian-Inspired Features (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (4): Heading, OutlineProps, parseHeadings(), slugify()

## Knowledge Gaps
- **156 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Database` be split into smaller, more focused modules?**
  _Cohesion score 0.07088989441930618 - nodes in this community are weakly interconnected._
- **Should `App Layout & Theme` be split into smaller, more focused modules?**
  _Cohesion score 0.08923076923076922 - nodes in this community are weakly interconnected._
- **Should `Main Page & Export` be split into smaller, more focused modules?**
  _Cohesion score 0.07816091954022988 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Note Card Component` be split into smaller, more focused modules?**
  _Cohesion score 0.10153846153846154 - nodes in this community are weakly interconnected._