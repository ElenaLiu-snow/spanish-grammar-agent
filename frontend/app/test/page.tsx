'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function TestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const frontendOrigin = typeof window === 'undefined' ? '浏览器环境加载后可见' : window.location.origin;

  const testAPI = async () => {
    setLoading(true);
    setResult('正在测试...\n');

    try {
      setResult('步骤 1: 检查环境变量...\n');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      setResult(prev => prev + `API_URL = ${apiUrl}\n\n`);

      setResult(prev => prev + '步骤 2: 发送请求到后端...\n');
      const startTime = Date.now();

      await apiClient.chatStream(
        {
          message: 'Hola',
          stream: false
        },
        (chunk) => {
          setResult(prev => prev + chunk);
        },
        () => {
          const duration = Date.now() - startTime;
          setResult(prev => prev + `\n\n✅ 成功！耗时: ${duration}ms`);
          setLoading(false);
        },
        (error) => {
          setResult(prev => prev + `\n\n❌ 错误: ${error.message}\n\n`);
          setResult(prev => prev + `错误详情: ${JSON.stringify(error, null, 2)}`);
          setLoading(false);
        }
      );

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误';
      setResult(prev => prev + `\n\n❌ 捕获异常: ${message}\n`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔧 API 调试页面</h1>

        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试后端连接'}
        </button>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">结果：</h2>
          <pre className="bg-white p-4 rounded border border-gray-300 overflow-auto max-h-96">
            {result || '点击按钮开始测试'}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold mb-2">📋 调试信息：</h3>
          <ul className="list-disc list-inside text-sm">
            <li>后端地址: {process.env.NEXT_PUBLIC_API_URL}</li>
            <li>前端地址: {frontendOrigin}</li>
            <li>当前时间: {new Date().toLocaleString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
