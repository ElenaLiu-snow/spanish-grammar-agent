'use client';

import React, { useState } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function TableTest() {
  const [testContent] = useState(`| 句子结构 | 例句 |
| --- | --- |
| 主句 + 从句 | **Fue** impresionante que el equipo **ganara/ganase** el campeonato. |
| 中文翻译 | 真令人震惊，那个队竟然赢得了冠军（那是过去的事了）。 |
| 解析 | Fue 标记过去时间，ganara/ganase 标记与主句对应的过去虚拟动作。 |`);

  const problemContent = `| 句子结构 | 例句 |
| --- | --- |
| 主句 + 从句 | **Fue** impresionante que el equipo **ganara/ganase** el campeonato. |
| 中文翻译 | 真令人震惊，那个队竟然赢得了冠军（那是过去的事了）。 |
| 解析 | Fue 标记过去时间，ganara/ganase 标记与主句对应的过去虚拟动作。 |`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 表格渲染测试</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-green-600">✅ 正确格式（应该显示）</h2>
          <MarkdownRenderer content={testContent} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-red-600">❌ 问题格式（你看到的）</h2>
          <MarkdownRenderer content={problemContent} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🔍 原始内容对比</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">正确格式原始：</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {testContent}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">问题格式原始：</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {problemContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
