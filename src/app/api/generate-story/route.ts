import { NextResponse } from 'next/server';
import { openai } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { theme } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional story writer. Create engaging and interesting short stories with good plot development.' 
        },
        { 
          role: 'user', 
          content: `Write a short story about "${theme}" in around 200 words` 
        }
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', response);
      throw new Error('无效的API响应');
    }
    
    return NextResponse.json({ 
      success: true,
      story: response.choices[0].message.content 
    });
  } catch (error: unknown) {
    console.error('Story generation error:', error);
    const errorMessage = error instanceof Error ? error.message : '生成故事时发生未知错误';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
} 