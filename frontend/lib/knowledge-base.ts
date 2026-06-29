import fs from 'fs';
import path from 'path';

const knowledgeDir = path.join(process.cwd(), 'lib/knowledge/rae');

let indexMap: Record<string, string> | null = null;

function loadIndex(): Record<string, string> {
  if (indexMap) return indexMap;

  indexMap = {};
  const indexPath = path.join(knowledgeDir, 'index.md');
  if (!fs.existsSync(indexPath)) {
    console.warn('[RAEKnowledgeBase] Index not found:', indexPath);
    return indexMap;
  }

  const content = fs.readFileSync(indexPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.trim().match(/^##\s+\[(.+?)\]\s*->\s*(.+)$/);
    if (match) {
      const keyword = match[1]!.trim().toLowerCase();
      const filePath = match[2]!.trim();
      if (!(keyword in indexMap)) {
        indexMap[keyword] = filePath;
      }
    }
  }

  console.log(`[RAEKnowledgeBase] Loaded ${Object.keys(indexMap).length} keywords from index`);
  return indexMap;
}

export function extractKeywords(query: string): string[] {
  const index = loadIndex();
  const queryLower = query.toLowerCase();
  return Object.keys(index).filter(kw => queryLower.includes(kw));
}

export function retrieve(query: string): string {
  const index = loadIndex();
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return '';

  // Collect unique matched files, preserving priority order
  const matchedFiles: string[] = [];
  const seen = new Set<string>();
  for (const kw of keywords) {
    const filePath = index[kw];
    if (filePath && !seen.has(filePath)) {
      matchedFiles.push(filePath);
      seen.add(filePath);
    }
  }
  if (matchedFiles.length === 0) return '';

  // Load and concatenate top 3 matched files
  const top = matchedFiles.slice(0, 3);
  const sections: string[] = [];
  for (const relPath of top) {
    let fullPath = path.join(knowledgeDir, `${relPath}.md`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(knowledgeDir, relPath + '.md');
    }
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const excerpt = lines.slice(0, 80).join('\n');
      sections.push(`--- 参考: ${relPath} ---\n${excerpt}`);
    }
  }

  if (sections.length === 0) return '';

  const result = sections.join('\n\n');
  console.log(`[RAEKnowledgeBase] Retrieved ${sections.length} files for query: ${query.slice(0, 60)}...`);
  return result;
}
