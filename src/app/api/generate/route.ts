import { NextResponse } from 'next/server';
import { handleApiError, formatSuccessResponse, textToSpeech } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  try {
    const { text, voice = 'default', emotion } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: '请提供有效的文本' 
      }, { status: 400 });
    }

    console.log(`TTS请求: 文本="${text.substring(0, 100)}${text.length > 100 ? '...' : ''}", 声音="${voice}"${emotion ? ', 情感="' + emotion + '"' : ''}`);

    // 调用TTS服务
    const result = await textToSpeech(text, voice, emotion);
    
    // 检查是否有错误
    if ('error' in result && result.error) {
      console.error('TTS生成错误:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error
      }, { status: 500 });
    }
    
    // 返回音频URL
    return NextResponse.json(formatSuccessResponse({
      audioUrl: result.audioUrl
    }));
    
  } catch (error) {
    console.error('TTS请求处理错误:', error);
    return NextResponse.json(
      handleApiError(error), 
      { status: 500 }
    );
  }
} 