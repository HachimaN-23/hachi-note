'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { List } from 'lucide-react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface OutlineProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, '').trim();
      headings.push({ level, text, id: slugify(text) });
    }
  }
  return headings;
}

export default function Outline({ content }: OutlineProps) {
  const headings = useMemo(() => parseHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>('');

  const handleScroll = useCallback(() => {
    const headingElements = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean);

    for (let i = headingElements.length - 1; i >= 0; i--) {
      const el = headingElements[i];
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveId(headings[i].id);
        break;
      }
    }
  }, [headings]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }

  if (headings.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <List className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Outline</span>
      </div>
      <nav className="space-y-0.5">
        {headings.map((h, i) => (
          <button
            key={`${h.id}-${i}`}
            onClick={() => scrollToHeading(h.id)}
            className={`block w-full text-left text-xs py-0.5 px-2 rounded transition-colors truncate ${
              h.level === 1 ? 'font-medium' : ''
            } ${
              activeId === h.id
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
            style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
