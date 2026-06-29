'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface RaeChapterRendererProps {
  content: string;
}

function fixBoldItalic(text: string): string {
  return text
    .replace(/`\*\*(.+?)\*\*`/g, '`$1`')
    .replace(/`\*(.+?)\*`/g, '`$1`')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\s][^*]*?)\*(?!\*)/g, '<em>$1</em>');
}

export default function RaeChapterRenderer({ content }: RaeChapterRendererProps) {
  const cleaned = fixBoldItalic(content);
  return (
    <div className="rae-markdown prose prose-stone max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        skipHtml={false}
        components={{
          h1: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = slugify(text);
            return (
              <h1 id={id} className="anchor-target mb-4 mt-6 border-b border-[#d8c7a7] pb-3 text-3xl font-bold text-[#251a14] scroll-mt-28">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = slugify(text);
            return (
              <h2 id={id} className="anchor-target mb-3 mt-8 border-b border-[#eadcc2] pb-2 text-2xl font-semibold text-[#2f241c] scroll-mt-28">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = slugify(text);
            return (
              <h3 id={id} className="anchor-target mb-2 mt-5 text-xl font-medium text-[#533627] scroll-mt-28">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-lg font-medium text-[#315f57]">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-base leading-7 text-[#4d4035]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-2 list-inside list-disc space-y-2 text-[#4d4035]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-2 list-inside list-decimal space-y-2 text-[#4d4035]">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ml-4 text-base leading-relaxed">{children}</li>
          ),
          table: ({ children }) => (
            <div className="my-4 mb-6 overflow-x-auto rounded-md border border-[#d8c7a7] shadow-sm">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[#c9b58f] bg-[#ead7ad]">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#eadcc2]">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-[#f7ead0]">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#251a14]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-[#4d4035]">{children}</td>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded border border-[#d9c59a] bg-[#efe0bd] px-1.5 py-0.5 font-mono text-sm text-[#7a2f3a]">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-[#2f241c] text-[#fff8e8] mb-4 overflow-x-auto rounded-md p-4 text-sm leading-relaxed">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#251a14]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-[#7a2f3a]">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-r border-l-4 border-[#7a2f3a] bg-[#f4ead3] py-2 pl-4 text-[#4d4035]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-t border-[#d8c7a7]" />,
          a: ({ href, children }) => (
            <a href={href} className="text-[#7a2f3a] underline decoration-[#b8895b] underline-offset-4 hover:text-[#612630]">
              {children}
            </a>
          ),
          br: () => <br />,
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
