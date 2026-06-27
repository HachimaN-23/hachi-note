'use client';

import { getTagColor } from '@/lib/utils';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}

export default function TagFilter({ tags, activeTag, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {tags.map(tag => {
        const colorIdx = getTagColor(tag);
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            onClick={() => onSelect(isActive ? null : tag)}
            className={`tag-pill tag-color-${colorIdx} px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              isActive ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500 shadow-md scale-105' : 'hover:scale-105'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
