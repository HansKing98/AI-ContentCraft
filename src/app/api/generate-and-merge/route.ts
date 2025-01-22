import { NextResponse } from 'next/server';
import { StreamingTextResponse } from 'next/streaming';
import { initTTS, execAsync } from '@/app/utils/api-utils';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function POST(req: Request) {
  const { sections } = await req.json();
  
  if (!sections || sections.length === 0) {
    return NextResponse.json({ 
      success: false, 
      error: '没有有效的文本段落' 
    }, { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(process.cwd(), `public/output/${timestamp}/audio.wav`);
    
    // 创建临时目录和输出目录
    const tempDir = path.join(process.cwd(), 'temp');
    const outputDir = path.join(process.cwd(), 'public/output', timestamp);
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    // 初始化 TTS
    const tts = await initTTS();
    
    // 生成所有音频文件
    const audioFiles = [];
    for (let i = 0; i < sections.length; i++) {
      const { text, voice } = sections[i];
      
      await writer.write(encoder.encode(JSON.stringify({
        type: 'progress',
        current: i + 1,
        total: sections.length,
        message: `Generating audio for section ${i + 1}/${sections.length}`
      }) + '\n'));

      try {
        const audio = await tts.generate(text, { voice });
        const tempFile = path.join(tempDir, `temp-${i}.wav`);
        await audio.save(tempFile);
        audioFiles.push(tempFile);
      } catch (error: any) {
        await writer.write(encoder.encode(JSON.stringify({
          type: 'error',
          message: `Failed to generate audio for section ${i + 1}: ${error.message}`
        }) + '\n'));
      }
    }

    if (audioFiles.length > 0) {
      await writer.write(encoder.encode(JSON.stringify({
        type: 'status',
        message: 'Merging audio files...'
      }) + '\n'));

      // 创建文件列表
      const listFile = path.join(tempDir, `list-${timestamp}.txt`);
      const fileList = audioFiles.map(f => `file '${f}'`).join('\n');
      await fs.writeFile(listFile, fileList);

      // 合并音频文件
      const ffmpegPath = '/Users/katemac/anaconda3/bin/ffmpeg'; // 注意：这里可能需要根据部署环境调整
      await execAsync(`"${ffmpegPath}" -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`);

      // 清理临时文件
      await Promise.all([
        ...audioFiles.map(f => fs.unlink(f)),
        fs.unlink(listFile)
      ]);
      
      await fs.rmdir(tempDir);

      await writer.write(encoder.encode(JSON.stringify({
        type: 'complete',
        success: true,
        filename: path.relative(process.cwd(), outputFile)
      })));
    } else {
      throw new Error('No audio generated');
    }

    await writer.close();
  } catch (error: any) {
    await writer.write(encoder.encode(JSON.stringify({
      type: 'error',
      error: error.message
    })));
    await writer.close();
  }
  
  return new StreamingTextResponse(stream.readable);
} 