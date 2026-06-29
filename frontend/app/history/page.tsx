'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  clearSearchHistory,
  getModeLabel,
  getSearchHistory,
  SearchHistoryEntry,
  subscribeSearchHistory,
} from '@/lib/searchHistory';

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getAnswerPreview(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>(() => getSearchHistory());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSearchHistory(() => {
      setHistory(getSearchHistory());
    });
  }, []);

  const handleClear = () => {
    clearSearchHistory();
    setExpandedId(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">搜索记录</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">查看搜过的词和答案</h1>
            <p className="mt-2 text-sm text-gray-600">
              当前保存在这台设备的浏览器中，最多保留最近 50 条记录。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              返回主页
            </Link>
            <button
              type="button"
              onClick={handleClear}
              disabled={history.length === 0}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              清空记录
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl">📝</div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">还没有搜索记录</h2>
            <p className="mt-2 text-gray-600">
              回到主页提问后，这里会自动保存你搜过的内容和系统回答。
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {history.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {getModeLabel(item.mode)}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(item.createdAt)}</span>
                    </div>
                    <h2 className="truncate text-lg font-semibold text-gray-900">{item.query}</h2>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {getAnswerPreview(item.answer) || '暂无答案摘要'}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedId === item.id && (
                  <div className="border-t border-gray-100 px-6 py-5">
                    <MarkdownRenderer content={item.answer} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
