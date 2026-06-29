'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * 清理并修复 Markdown 表格格式
 */
function fixBoldItalic(content: string): string {
  // Strip ** and * from inside inline code blocks (formatting doesn't work there)
  content = content.replace(/`\*\*(.+?)\*\*`/g, '`$1`');
  content = content.replace(/`\*(.+?)\*`/g, '`$1`');
  // Convert **word** → <strong>word</strong> (handles cases adjacent to CJK)
  content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Convert *word* → <em>word</em>
  content = content.replace(/(?<!\*)\*([^*\s][^*]*?)\*(?!\*)/g, '<em>$1</em>');
  return content;
}

function cleanMarkdownTables(content: string): string {
  const lines = content.split('\n');
  const cleaned: string[] = [];

  for (let line of lines) {
    // 只处理以 | 开头的行（表格行），避免影响代码块
    if (line.trim().startsWith('|')) {
      // 移除行尾所有空格和隐藏字符
      line = line.replace(/\s+$/g, '');
    }
    cleaned.push(line);
  }

  return cleaned.join('\n');
}

/**
 * Markdown 渲染组件
 * 专门优化西语语法内容的显示
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // 修复 **bold** 和 *italic* 格式
  let cleanedContent = fixBoldItalic(content);
  // 清理表格格式
  cleanedContent = cleanMarkdownTables(cleanedContent);

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        skipHtml={false}
        components={{
          // 标题样式
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 border-b border-[#d8c7a7] pb-3 text-3xl font-bold text-[#251a14]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 border-b border-[#eadcc2] pb-2 text-2xl font-semibold text-[#2f241c]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-xl font-medium text-[#533627]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-lg font-medium text-[#315f57]">
              {children}
            </h4>
          ),
          // 段落样式 - 改进文本处理，允许 HTML
          p: ({ children }) => (
            <p className="mb-4 text-base leading-7 text-[#4d4035]">
              {children}
            </p>
          ),
          // 列表样式 - 修复缩进
          ul: ({ children }) => (
            <ul className="mb-4 ml-2 list-inside list-disc space-y-2 text-[#4d4035]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-2 list-inside list-decimal space-y-2 text-[#4d4035]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4 text-base leading-relaxed">
              {children}
            </li>
          ),
          // 表格样式 - 大幅改进
          table: ({ children }) => (
            <div className="my-4 mb-6 overflow-x-auto rounded-md border border-[#d8c7a7] shadow-sm">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[#c9b58f] bg-[#ead7ad]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#eadcc2]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-[#f7ead0]">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#251a14]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-[#4d4035]">
              {children}
            </td>
          ),
          // 代码块样式 - 专门优化西语例句
          code: ({ className, children }) => {
            const isInline = !className;
            // 西语关键词用红色标记
            if (isInline) {
              return (
                <code className="rounded border border-[#d9c59a] bg-[#efe0bd] px-1.5 py-0.5 font-mono text-sm text-[#7a2f3a]">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children, className }) => {
            // 判断是否是西语例句代码块
            const isSpanishExample = className?.includes('language-spanish') ||
                                    className?.includes('language-es');

            return (
              <pre className={`${isSpanishExample
                ? 'border-l-4 border-[#315f57] bg-[#edf0df] text-[#263025]'
                : 'bg-[#2f241c] text-[#fff8e8]'} mb-4 overflow-x-auto rounded-md p-4 text-sm leading-relaxed`}>
                {children}
              </pre>
            );
          },
          // 强调样式
          strong: ({ children }) => (
            <strong className="font-bold text-[#251a14]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-[#7a2f3a]">
              {children}
            </em>
          ),
          // 引用样式 - 用于 RAE 规则引用
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-r border-l-4 border-[#7a2f3a] bg-[#f4ead3] py-2 pl-4 text-[#4d4035]">
              {children}
            </blockquote>
          ),
          // 分隔线
          hr: () => (
            <hr className="my-8 border-t border-[#d8c7a7]" />
          ),
          // 处理链接
          a: ({ href, children }) => (
            <a href={href} className="text-[#7a2f3a] underline decoration-[#b8895b] underline-offset-4 hover:text-[#612630]">
              {children}
            </a>
          ),
          // 处理换行（将 br 转换为换行）
          br: () => <br />,
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
