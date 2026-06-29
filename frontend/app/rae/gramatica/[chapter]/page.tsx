import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import RaeChapterRenderer from '@/components/RaeChapterRenderer';
import { getChapter, ngleParts } from '@/lib/ngle-chapters';

type PageProps = { params: Promise<{ chapter: string }> };

// --- Heading parsing (server-side) ---
interface Heading {
  level: number;
  id: string;
  es: string;
  zh: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const counter: Record<string, number> = {};

  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    const parts = m[2].trim().split(/\s*\/\s*/);
    const es = (parts[0] || '').trim();
    const zh = (parts[1] || '').trim();

    // Extract section number from Spanish heading (e.g. "2.1. Concepto..." → "2.1")
    const numMatch = es.match(/^(\d+[\d.]*[a-z]?)\s*\.?\s*/);
    const num = numMatch ? numMatch[1] : '';

    // Label: "2.1 性的概念" (numbered)
    const label = num ? `${num} ${zh || es.replace(/^\d+[\d.]*[a-z]?\s*\.?\s*/, '')}` : (zh || es);

    const baseId = es
      .toLowerCase()
      .replace(/[^a-záéíóúñü0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `section-${headings.length}`;
    counter[baseId] = (counter[baseId] || 0) + 1;
    const id = counter[baseId] === 1 ? baseId : `${baseId}-${counter[baseId]}`;
    headings.push({ level, id, es, zh, num, label } as Heading & { num: string; label: string });
  }
  return headings;
}

// Extend Heading type
interface Heading {
  level: number;
  id: string;
  es: string;
  zh: string;
  num: string;
  label: string;
}

// --- Chapter navigation ---
function getChapterNav(slug: string) {
  const all = ngleParts.flatMap((p) => p.chapters);
  const idx = all.findIndex((c) => c.slug === slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

// --- Page ---
export default async function ChapterPage({ params }: PageProps) {
  const { chapter: slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  let markdown: string;
  try {
    markdown = await readFile(
      path.join(process.cwd(), 'content', 'rae', 'ngle', `capitulo-${chapter.number}.md`),
      'utf8'
    );
  } catch {
    markdown = `# Capítulo ${chapter.number}: ${chapter.titleEs} / ${chapter.titleZh}\n\n> 本章内容正在生成中，请稍后查看。\n\n> Este capítulo está siendo generado. Vuelva más tarde.`;
  }

  const headings = parseHeadings(markdown);
  const nav = getChapterNav(slug);

  return (
    <main className="min-h-screen bg-[#1d1813] text-[#2f241c]">
      <div className="saenredam-bg saenredam-bg-soft" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* Top nav */}
        <nav className="sticky top-4 z-30 mb-8 flex items-center justify-between rounded-md border border-[#d8c7a7]/80 bg-[#fff8e8]/88 px-4 py-3 shadow-[0_18px_60px_rgba(18,13,9,0.24)] backdrop-blur-md">
          <Link href="/#ngle" className="inline-flex items-center gap-2 text-sm font-medium text-[#533627] transition hover:text-[#7a2f3a]">
            <ArrowLeft className="h-4 w-4" /> 返回全书
          </Link>
          <span className="font-script text-2xl leading-none text-[#4f3024]">Cap. {chapter.number}</span>
          <span className="hidden text-xs uppercase tracking-[0.22em] text-[#74624d] sm:inline">NGLE · RAE</span>
        </nav>

        {/* Chapter header */}
        <header className="mb-8 rounded-md border border-[#d8c7a7] bg-[#fff8e8]/92 p-5 shadow-[0_20px_60px_rgba(18,13,9,0.25)] backdrop-blur-md sm:p-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#c7ad7c] bg-[#f4e5c4] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#68402f]">
            <BookOpen className="h-3.5 w-3.5" />
            Capítulo {chapter.number}
          </div>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-[#251a14] sm:text-5xl">{chapter.titleEs}</h1>
          <p className="mt-2 text-lg font-medium text-[#7a2f3a]">{chapter.titleZh}</p>
        </header>

        {/* Two columns */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          {/* Sidebar — clickable anchors */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto vintage-scrollbar rounded-md border border-[#d8c7a7] bg-[#fff8e8]/92 p-5 shadow-[0_16px_50px_rgba(18,13,9,0.18)] backdrop-blur-md">
              <p className="font-script text-2xl text-[#7a2f3a] mb-4">Índice</p>
              <nav className="space-y-0.5">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block rounded px-2 py-1.5 transition-colors hover:bg-[#f4e5c4] hover:text-[#7a2f3a] ${
                      h.level === 3
                        ? 'ml-4 text-xs text-[#7b6b55] leading-5'
                        : 'text-sm text-[#533627] font-medium leading-5'
                    }`}
                  >
                    {h.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0 rounded-md border border-[#d8c7a7] bg-[#fff8e8]/95 p-5 shadow-[0_24px_80px_rgba(18,13,9,0.28)] backdrop-blur-md sm:p-8 lg:p-10">
            <RaeChapterRenderer content={markdown} />

            {/* Prev / Next */}
            <div className="mt-12 flex items-center justify-between border-t border-[#d8c7a7] pt-6">
              {nav.prev ? (
                <Link href={`/rae/gramatica/${nav.prev.slug}`} className="group flex items-center gap-2 rounded-md border border-[#d8c7a7] bg-[#f7ead0] px-4 py-2.5 text-sm font-medium text-[#533627] transition hover:border-[#7a2f3a] hover:bg-[#fff8e8]">
                  <ArrowLeft className="h-4 w-4" />
                  <span>
                    <span className="text-xs text-[#8a765e]">Cap. {nav.prev.number}</span><br />
                    <span className="group-hover:text-[#7a2f3a] transition-colors">{nav.prev.titleZh}</span>
                  </span>
                </Link>
              ) : <div />}
              {nav.next ? (
                <Link href={`/rae/gramatica/${nav.next.slug}`} className="group flex items-center gap-2 rounded-md border border-[#d8c7a7] bg-[#f7ead0] px-4 py-2.5 text-sm font-medium text-[#533627] transition hover:border-[#7a2f3a] hover:bg-[#fff8e8] text-right">
                  <span>
                    <span className="text-xs text-[#8a765e]">Cap. {nav.next.number}</span><br />
                    <span className="group-hover:text-[#7a2f3a] transition-colors">{nav.next.titleZh}</span>
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : <div />}
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
