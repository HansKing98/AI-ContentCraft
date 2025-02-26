import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const voice = searchParams.get('voice') || 'default';
  
  // 在实际项目中，这里应该调用真实的TTS服务
  // 这里我们简单返回一个固定的音频URL用于测试
  
  console.log(`模拟TTS请求: 文本="${text}", 声音="${voice}"`);
  
  // 返回一个指向示例音频文件的URL
  // 在真实项目中，这里应该返回由TTS服务生成的音频
  return NextResponse.json({
    success: true,
    audioUrl: 'https://www.w3schools.com/html/horse.mp3', // 示例音频URL
    text,
    voice
  });
} 