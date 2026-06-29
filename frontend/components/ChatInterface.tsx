'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarCheck,
  Clock,
  Dumbbell,
  Feather,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  Loader2,
  Mic,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { apiClient, ChatMessage } from '@/lib/api';
import { saveSearchHistory, SearchMode } from '@/lib/searchHistory';
import MarkdownRenderer from './MarkdownRenderer';
import FileUpload from './FileUpload';

interface AttachedFile {
  filename: string;
  fileType: string;
  content?: string;
  base64Data?: string;
}

const modeOptions: Array<{
  value: SearchMode;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'coach',
    label: '学习规划',
    detail: '根据你的时间生成每日练习计划',
    icon: CalendarCheck,
  },
  {
    value: 'drill',
    label: '出题',
    detail: '针对一项具体技能出题训练',
    icon: Dumbbell,
  },
  {
    value: 'correction',
    label: '错题解析',
    detail: '逐项订正错题，主动发现其他错误',
    icon: AlertTriangle,
  },
  {
    value: 'oral',
    label: '口语',
    detail: '日常口语表达、俚语和对话场景',
    icon: Mic,
  },
  {
    value: 'culture',
    label: '文化',
    detail: '西语世界文化背景和地区差异',
    icon: Globe,
  },
];

const promptSuggestions: Record<SearchMode, Array<{
  title: string;
  prompt: string;
}>> = {
  auto: [
    { title: '语法疑问', prompt: '为什么是 el agua fría，但又说 mucha agua？请按 RAE 规则解释。' },
    { title: '出题练习', prompt: '请围绕 por / para 生成 6 道西语选择题，附解析。' },
    { title: '学习规划', prompt: '我有 30 分钟，最近虚拟式薄弱，帮我安排今日练习。' },
  ],
  coach: [
    { title: '30 分钟规划', prompt: '我有 30 分钟，最近介词和虚拟式比较薄弱，请帮我制定练习计划。' },
    { title: '考前突击', prompt: '明天考试，帮我重点复习过去时态和冠词用法，60 分钟。' },
    { title: '每日巩固', prompt: '我今天比较累，只有 10 分钟，请安排一个轻松的复习任务。' },
  ],
  drill: [
    { title: '介词段落填空', prompt: '请出一组 por / para 段落填空题，8 道，附解析。' },
    { title: '动词时态选择', prompt: '请出 6 道 indefinido vs imperfecto 的选择题，附解析。' },
    { title: '改错训练', prompt: '请出 5 道西语改错题，涵盖介词、冠词和时态错误。' },
  ],
  correction: [
    { title: '时态批改', prompt: '请帮我批改以下错题并逐项讲解：\n1. He ido al cine ayer.\n2. Cuando era niño, yo jugaba todos los días.' },
    { title: '介词批改', prompt: '请逐项批改：\n1. Estoy interesado en aprender.\n2. Depende de la situación.' },
    { title: '综合批改', prompt: '请帮我检查以下段落的所有错误：\nAyer yo he ido al mercado y compré muchas frutas.' },
  ],
  oral: [
    { title: '日常缩略', prompt: '请讲解西班牙日常口语中常用的缩略形式和俚语。' },
    { title: '餐厅对话', prompt: '模拟一段在西语餐厅点餐的对话，附常用表达。' },
    { title: '语域对比', prompt: '对比正式和非正式场合下打招呼、告别的不同说法。' },
  ],
  culture: [
    { title: '圣诞节习俗', prompt: '请讲解西语国家圣诞节期间的传统习俗和相关表达。' },
    { title: '地区差异', prompt: '拉美和西班牙在日常用词上有哪些显著差异？' },
    { title: '节日与语言', prompt: '西语国家有哪些重要节日？节日期间有哪些特色表达？' },
  ],
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<SearchMode>('auto');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const messageViewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const viewport = messageViewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleFileUploaded = (fileData: AttachedFile) => {
    setAttachedFile(fileData);
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    let messageContent = input.trim();
    if (attachedFile) {
      if (attachedFile.fileType === 'image') {
        messageContent = `[图片: ${attachedFile.filename}]\n${messageContent}`;
      } else {
        messageContent = `[文件: ${attachedFile.filename}]\n${messageContent}`;
      }
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    const history = messages.concat(userMessage);

    let backendMessage = input.trim();
    if (attachedFile) {
      if (attachedFile.fileType === 'image') {
        backendMessage = `[图片: ${attachedFile.filename}]\n${backendMessage}`;
      } else {
        const fullContent = attachedFile.content || '';
        backendMessage = `[文件: ${attachedFile.filename}]\n\n文档内容:\n${fullContent}\n\n${backendMessage}`;
      }
    }

    let fullResponse = '';
    let hasSavedHistory = false;

    const persistHistory = (answer: string) => {
      if (hasSavedHistory) {
        return;
      }

      hasSavedHistory = true;
      saveSearchHistory({
        query: messageContent,
        answer,
        mode,
        createdAt: new Date().toISOString(),
      });
    };

    await apiClient.chatStream(
      {
        message: backendMessage,
        conversation_history: history.slice(0, -1),
        mode,
      },
      (chunk) => {
        fullResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: fullResponse,
          };
          return newMessages;
        });
      },
      () => {
        persistHistory(fullResponse || '暂无返回内容');
        setIsLoading(false);
      },
      (error) => {
        const errorMessage = `**错误**: ${error.message}`;
        console.error('聊天错误:', error);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: errorMessage,
          };
          return newMessages;
        });
        persistHistory(errorMessage);
        setIsLoading(false);
      }
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const activeMode = modeOptions.find((option) => option.value === mode) ?? modeOptions[0];
  const ActiveModeIcon = mode === 'auto' ? Sparkles : activeMode.icon;

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-md border border-[#d8c7a7]/85 bg-[#fff8e8]/92 shadow-[0_28px_90px_rgba(18,13,9,0.32)] backdrop-blur-md">
      <header className="shrink-0 border-b border-[#d8c7a7] bg-[#fff8e8]/92 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Feather className="h-5 w-5 text-[#7a2f3a] shrink-0" />
            <h1 className="cursor-default font-script text-2xl leading-none text-[#251a14] transition-colors duration-200 hover:text-[#7a2f3a]">
              Spanish Copilot
            </h1>
            <span className="hidden text-xs font-medium text-[#7a2f3a] sm:inline">西语助理</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#d8c7a7] bg-[#f6e7c6] px-3 py-1.5 text-xs font-medium text-[#533627] transition hover:border-[#7a2f3a] hover:bg-[#fff8e8]"
            >
              <History className="h-3.5 w-3.5" />
              搜索记录
            </Link>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#d8c7a7] bg-[#f7ead0] px-3 py-1.5 text-xs font-medium text-[#654b3a] transition hover:border-[#7a2f3a] hover:bg-[#fff8e8]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#d8c7a7]/60 bg-[#fff8e8]/70 px-4 py-1.5 sm:px-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a2f3a]">
            <ActiveModeIcon className="h-3.5 w-3.5" />
            {mode === 'auto' ? 'Auto Detect' : `${activeMode.label} mode`}
          </div>
          <span className="hidden text-xs text-[#6c5b47] sm:inline">
            {mode === 'auto' ? '— 系统自动匹配模式' : `— ${activeMode.detail}`}
          </span>
        </div>

        <div
          ref={messageViewportRef}
          onWheel={(event) => event.stopPropagation()}
          className="assistant-message-scroll vintage-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
        >
          <div className="mx-auto max-w-4xl space-y-5">
            {messages.length === 0 && (
              <div className="py-4">
                <div className="rounded-md border border-[#d8c7a7] bg-[#fffaf0]/88 p-5 shadow-[0_16px_45px_rgba(18,13,9,0.12)]">
                  <p className="font-script text-5xl leading-none text-[#7a2f3a]">Bienvenido</p>
                  <h2 className="mt-3 text-2xl font-semibold text-[#251a14]">
                    把一句西语、一个语法点或一份资料交给我。
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[#665744]">
                    适合查冠词、辨介词、整理语法笔记，也可以上传练习或资料，让讲解更贴近你的学习内容。
                  </p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {(promptSuggestions[mode] || []).map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => setInput(suggestion.prompt)}
                      className="rounded-md border border-[#d8c7a7] bg-[#f7ead0]/88 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#7a2f3a] hover:bg-[#fff8e8]"
                    >
                      <p className="font-semibold text-[#2f241c]">{suggestion.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#6c5b47]">{suggestion.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-md border px-5 py-4 shadow-[0_14px_40px_rgba(18,13,9,0.12)] ${
                    message.role === 'user'
                      ? 'border-[#315f57] bg-[#e8eddc] text-[#263025]'
                      : 'border-[#d8c7a7] bg-[#fffaf0] text-[#33251c]'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-7">{message.content}</p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-md border border-[#d8c7a7] bg-[#fffaf0] px-5 py-4 text-[#5f513f] shadow-[0_14px_40px_rgba(18,13,9,0.12)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#7a2f3a]" />
                  <span>
                    {mode === 'auto' ? '正在分析问题并匹配模式...'
                      : mode === 'coach' ? '正在制定练习计划...'
                      : mode === 'drill' ? '正在出题...'
                      : mode === 'correction' ? '正在逐项批改...'
                      : mode === 'oral' ? '正在准备口语素材...'
                      : mode === 'culture' ? '正在查阅文化资料...'
                      : '正在翻阅语法线索...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-[#d8c7a7] bg-[#fff8e8]/94 px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {attachedFile && (
              <div className="mb-3 rounded-md border border-[#d8c7a7] bg-[#f7ead0] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {attachedFile.fileType === 'image' ? (
                      <ImageIcon className="h-5 w-5 shrink-0 text-[#315f57]" />
                    ) : (
                      <FileText className="h-5 w-5 shrink-0 text-[#315f57]" />
                    )}
                    <span className="truncate text-sm font-medium text-[#2f241c]">{attachedFile.filename}</span>
                    <span className="hidden text-xs text-[#7b6b55] sm:inline">
                      {attachedFile.fileType === 'image'
                        ? `${((attachedFile.base64Data?.length || 0) * 0.75 / 1024 / 1024).toFixed(2)} MB`
                        : `${attachedFile.content?.length || 0} 字符`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="rounded-md p-1 text-[#654b3a] transition hover:bg-[#ead7ad]"
                    aria-label="移除附件"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="overflow-hidden rounded-md border border-[#bda77d] bg-[#fffdf6]">
                <div className="border-b border-[#dccaa9] bg-[#f6e7c6] px-3 py-2">
                  <FileUpload onFileUploaded={handleFileUploaded} disabled={isLoading} />
                </div>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === 'coach'
                      ? '告诉我你的时间和薄弱点... 例如：30 分钟，介词和虚拟式薄弱'
                      : mode === 'drill'
                        ? '输入要出题的技能... 例如：por / para 段落填空'
                        : mode === 'correction'
                          ? '粘贴你的错题... 例如：He ido al cine ayer.'
                          : mode === 'oral'
                            ? '输入你想练的口语场景... 例如：餐厅点餐对话'
                            : mode === 'culture'
                              ? '输入你想了解的文化主题... 例如：西语国家的圣诞节习俗'
                              : '输入你的问题，我会自动匹配合适的学习模式...'
                  }
                  className="min-h-24 w-full resize-none bg-[#fffdf6] px-4 py-3 leading-7 text-[#2f241c] outline-none placeholder:text-[#9a8a73] focus:ring-2 focus:ring-[#7a2f3a]/25"
                  rows={2}
                  disabled={isLoading}
                />
                <div className="flex items-center gap-1.5 border-t border-[#e8d5b0] px-3 py-2">
                  <span className="mr-1 text-[10px] font-medium uppercase tracking-wider text-[#9a8a73]">模式</span>
                  {modeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = option.value === mode;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMode(option.value)}
                        title={option.detail}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-[#7a2f3a] text-white shadow-[0_2px_8px_rgba(122,47,58,0.25)]'
                            : 'bg-[#f0e4d0] text-[#6c5b47] hover:bg-[#e0d0b8] hover:shadow-sm'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {option.label}
                      </button>
                    );
                  })}
                  <span className="mx-0.5 h-4 w-px bg-[#d8c7a7]" />
                  <button
                    type="button"
                    onClick={() => setMode('auto')}
                    title="由系统自动判断最合适的模式"
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                      mode === 'auto'
                        ? 'bg-[#315f57] text-white shadow-[0_2px_8px_rgba(49,95,87,0.25)]'
                        : 'bg-[#e8eddc] text-[#4a6652] hover:bg-[#d0dcc8] hover:shadow-sm'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Auto
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !attachedFile)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#7a2f3a] px-6 py-3 font-medium text-[#fff8e8] transition hover:bg-[#612630] focus:outline-none focus:ring-2 focus:ring-[#7a2f3a]/30 disabled:cursor-not-allowed disabled:bg-[#c5b89e] sm:self-end"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                发送
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#7b6b55]">
              Enter 发送，Shift + Enter 换行。支持 Word、Markdown、文本、图片。
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
