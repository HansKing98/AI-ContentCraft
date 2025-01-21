import { NextResponse } from 'next/server';
import { KokoroTTS } from "kokoro-js";
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Readable } from 'stream';

const execAsync = promisify(exec);

// 初始化 TTS
const model_id = "onnx-community/Kokoro-82M-ONNX";
let tts: any = null;

async function initTTS() {
  if (!tts) {
    console.log('Initializing TTS...');
    tts = await KokoroTTS.from_pretrained(model_id, {
      dtype: "q8",
    });
    console.log('TTS initialized successfully');
  }
  return tts;
}

export async function POST(req: Request) {
  const { sections } = await req.json();
  
  if (!sections || sections.length === 0) {
    return NextResponse.json({ 
      success: false, 
      error: '没有有效的文本段落' 
    }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const writeJSON = async (data: any) => {
    await writer.write(encoder.encode(JSON.stringify(data) + '\n'));
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(process.cwd(), 'public', 'output', timestamp);
  const outputFile = path.join(outputDir, 'audio.wav');
  const tempDir = path.join(process.cwd(), 'temp');

  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });
    
    await initTTS();
    
    const audioFiles = [];
    for (let i = 0; i < sections.length; i++) {
      const { text, voice } = sections[i];
      
      await writeJSON({
        type: 'progress',
        current: i + 1,
        total: sections.length,
        message: `Generating audio for section ${i + 1}/${sections.length}`
      });

      try {
        const audio = await tts.generate(text, { voice });
        const tempFile = path.join(tempDir, `temp-${i}.wav`);
        await audio.save(tempFile);
        audioFiles.push(tempFile);
      } catch (error) {
        console.error(`Error generating audio for section ${i}:`, error);
        await writeJSON({
          type: 'error',
          message: `Failed to generate audio for section ${i + 1}: ${error.message}`
        });
      }
    }

    if (audioFiles.length > 0) {
      await writeJSON({
        type: 'status',
        message: 'Merging audio files...'
      });

      const listFile = path.join(tempDir, `list-${timestamp}.txt`);
      const fileList = audioFiles.map(f => `file '${f}'`).join('\n');
      await fs.writeFile(listFile, fileList);

      const ffmpegPath = '/usr/local/bin/ffmpeg'; // 请确保这是正确的 ffmpeg 路径
      await execAsync(`"${ffmpegPath}" -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`);

      await Promise.all([
        ...audioFiles.map(f => fs.unlink(f)),
        fs.unlink(listFile)
      ]);
      
      await fs.rmdir(tempDir);

      await writeJSON({
        type: 'complete',
        success: true,
        filename: `/output/${timestamp}/audio.wav`
      });
    } else {
      throw new Error('No audio generated');
    }
  } catch (error: any) {
    console.error('Error generating and merging audio:', error);
    await writeJSON({
      type: 'error',
      error: error.message
    });
  } finally {
    await writer.close();
  }

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 