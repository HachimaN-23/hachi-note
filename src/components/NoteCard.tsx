'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Star, CheckSquare, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { getTagColor } from '@/lib/utils';
import NoteDropdown from './NoteDropdown';

const NOTE_COLORS: Record<string, { bg: string; darkBg: string; border: string; darkBorder: string; accent: string }> = {
  red: { bg: 'bg-red-50', darkBg: 'dark:bg-red-950/30', border: 'border-red-200', darkBorder: 'dark:border-red-900/50', accent: 'bg-red-500' },
  orange: { bg: 'bg-orange-50', darkBg: 'dark:bg-orange-950/30', border: 'border-orange-200', darkBorder: 'dark:border-orange-900/50', accent: 'bg-orange-500' },
  yellow: { bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-950/30', border: 'border-yellow-200', darkBorder: 'dark:border-yellow-900/50', accent: 'bg-yellow-500' },
  green: { bg: 'bg-green-50', darkBg: 'dark:bg-green-950/30', border: 'border-green-200', darkBorder: 'dark:border-green-900/50', accent: 'bg-green-500' },
  blue: { bg: 'bg-blue-50', darkBg: 'dark:bg-blue-950/30', border: 'border-blue-200', darkBorder: 'dark:border-blue-900/50', accent: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', darkBg: 'dark:bg-purple-950/30', border: 'border-purple-200', darkBorder: 'dark:border-purple-900/50', accent: 'bg-purple-500' },
  pink: { bg: 'bg-pink-50', darkBg: 'dark:bg-pink-950/30', border: 'border-pink-200', darkBorder: 'dark:border-pink-900/50', accent: 'bg-pink-500' },
  gray: { bg: 'bg-gray-50', darkBg: 'dark:bg-gray-800/50', border: 'border-gray-200', darkBorder: 'dark:border-gray-700', accent: 'bg-gray-400' },
};

interface ChecklistItem {
  id: number;
  text: string;
  checked: number;
}

interface NoteCardProps {
  title: string;
  content: string;
  pinned: number;
  color?: string | null;
  locked?: number;
  tags: string[];
  checklist_items?: ChecklistItem[];
  updated_at: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleCheck?: (itemId: number, checked: boolean) => void;
  onToggleLock?: () => void;
  onClick?: () => void;
}

export default function NoteCard({ title, content, pinned, color, locked, tags, checklist_items, updated_at, onEdit, onDelete, onTogglePin, onToggleCheck, onToggleLock, onClick }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colorStyle = color ? NOTE_COLORS[color] : null;
  const hasChecklist = checklist_items && checklist_items.length > 0;
  const checkedCount = hasChecklist ? checklist_items!.filter(i => i.checked).length : 0;
  const hasLongContent = content && content.length > 200;

  return (
    <div
      data-testid="note-card"
      onClick={onClick}
      className={`note-appear rounded-2xl transition-all duration-200 group relative ${onClick ? 'cursor-pointer' : ''} ${
        colorStyle
          ? `${colorStyle.bg} ${colorStyle.darkBg} border ${colorStyle.border} ${colorStyle.darkBorder}`
          : pinned
            ? 'bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/50 shadow-sm'
            : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
      }`}
    >
      {colorStyle && (
        <div className={`absolute top-0 left-0 w-1 h-full ${colorStyle.accent} rounded-l-2xl`} />
      )}

      <div className="p-4 pl-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
              className={`transition-all duration-200 flex-shrink-0 hover:scale-110 ${pinned ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'}`}
              title={pinned ? 'Unpin' : 'Pin to top'}
            >
              <Star className={`w-4 h-4 ${pinned ? 'fill-amber-500' : ''}`} />
            </button>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            {locked ? <Lock className="w-3 h-3 text-amber-500" /> : null}
            <NoteDropdown
              locked={locked}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleLock={onToggleLock || (() => {})}
              title={title}
              content={content}
            />
          </div>
        </div>

        {locked ? (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm mb-3 py-3 justify-center">
            <Lock className="w-4 h-4" />
            <span>This note is locked</span>
          </div>
        ) : hasChecklist ? (
          <div className="mb-3 space-y-1">
            {checklist_items!.slice(0, expanded ? undefined : 5).map(item => (
              <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  onChange={() => onToggleCheck?.(item.id, !item.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span className={`text-sm ${item.checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {item.text}
                </span>
              </label>
            ))}
            {checklist_items!.length > 5 && !expanded && (
              <p className="text-xs text-gray-400 dark:text-gray-500 pl-6">+{checklist_items!.length - 5} more</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
              <CheckSquare className="w-3 h-3" />
              {checkedCount}/{checklist_items!.length}
            </p>
          </div>
        ) : content ? (
          <div className={`mb-3 leading-loose prose prose-sm dark:prose-invert max-w-none
            prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
            prose-h1:text-lg prose-h1:mt-5 prose-h1:mb-3
            prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2
            prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1.5
            prose-p:my-2 prose-p:text-gray-600 dark:prose-p:text-gray-300
            prose-li:my-1 prose-li:text-gray-600 dark:prose-li:text-gray-300
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-pink-600 dark:prose-code:text-pink-400
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
            prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/50 dark:prose-blockquote:bg-amber-950/20 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-hr:border-gray-200 dark:prose-hr:border-gray-700
            ${!expanded ? 'max-h-40 overflow-hidden relative' : ''}`}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
            {!expanded && hasLongContent && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
            )}
          </div>
        ) : null}

        {hasLongContent && !hasChecklist && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-2 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {tags.map(tag => (
              <span
                key={tag}
                className={`tag-pill tag-color-${getTagColor(tag)} inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`}
              >
                {tag}
              </span>
            ))}
          </div>
          <time className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap" dateTime={updated_at}>
            {new Date(updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </time>
        </div>
      </div>
    </div>
  );
}
