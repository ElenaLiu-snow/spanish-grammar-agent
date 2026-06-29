import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  '.docx': 'word',
  '.md': 'markdown',
  '.txt': 'text',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.webp': 'image',
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ status: 'error', message: '未找到文件' }, { status: 400 });
    }

    const filename = file.name;
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    const fileType = SUPPORTED_EXTENSIONS[ext];

    if (!fileType) {
      return NextResponse.json(
        { status: 'error', message: `不支持的文件类型: ${ext}` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileType === 'image') {
      const base64Data = buffer.toString('base64');
      return NextResponse.json({
        status: 'success',
        data: {
          filename,
          file_type: fileType,
          extension: ext,
          base64_data: base64Data,
          size: buffer.length,
        },
      });
    }

    if (fileType === 'word') {
      return NextResponse.json({
        status: 'error',
        message: 'DOCX 解析在服务器端暂不可用，请先将文档转换为文本或 Markdown 格式上传。',
      }, { status: 400 });
    }

    // text / markdown — read as UTF-8
    const content = buffer.toString('utf-8');
    return NextResponse.json({
      status: 'success',
      data: {
        filename,
        file_type: fileType,
        extension: ext,
        content,
      },
    });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: 'error', message: `文件处理失败: ${errMsg}` }, { status: 500 });
  }
}
