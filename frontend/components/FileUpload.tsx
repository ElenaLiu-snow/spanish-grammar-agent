'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface FileUploadProps {
  onFileUploaded: (fileData: {
    filename: string;
    fileType: string;
    content?: string;
    base64Data?: string;
  }) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileUploaded, disabled = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/file/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '上传失败');
      }

      const result = await response.json();

      if (result.status === 'success') {
        onFileUploaded({
          filename: result.data.filename,
          fileType: result.data.file_type,
          content: result.data.content,
          base64Data: result.data.base64_data,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      // 重置 input
      event.target.value = '';
    }
  }, [onFileUploaded]);

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".docx,.md,.txt,.png,.jpg,.jpeg,.gif,.webp"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />
      <label
        htmlFor="file-upload"
        className={`
          inline-flex cursor-pointer items-center gap-2 rounded-md
          border border-dashed border-[#b8895b] bg-[#fff8e8]
          px-3 py-2 text-sm font-medium text-[#533627]
          transition hover:border-[#7a2f3a] hover:bg-[#f1ddb6]
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>处理中...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>上传文件</span>
          </>
        )}
      </label>

      {error && (
        <div className="mt-2 rounded-md border border-[#b75c5c] bg-[#fff0ed] p-3">
          <p className="text-sm text-[#8a2d2d]">{error}</p>
        </div>
      )}

      <div className="mt-2 text-xs text-[#7b6b55]">
        支持: Word (.docx), Markdown (.md), 文本 (.txt), 图片
      </div>
    </div>
  );
}
