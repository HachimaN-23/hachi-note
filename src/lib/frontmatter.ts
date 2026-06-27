import * as yaml from 'js-yaml';

export interface FrontmatterResult {
  metadata: Record<string, unknown>;
  content: string;
}

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export function parseFrontmatter(raw: string): FrontmatterResult {
  const match = raw.match(FRONTMATTER_REGEX);
  if (!match) {
    return { metadata: {}, content: raw };
  }

  try {
    const metadata = yaml.load(match[1]) as Record<string, unknown> || {};
    return { metadata, content: match[2] };
  } catch {
    return { metadata: {}, content: raw };
  }
}
