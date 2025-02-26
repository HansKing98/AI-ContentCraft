import { NextResponse } from 'next/server';
import { openai, handleApiError, formatSuccessResponse } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();
    
    if (!theme || typeof theme !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: '请提供有效的主题' 
      }, { status: 400 });
    }

    console.log(`调用 ARK API 生成故事，主题: "${theme}"`);

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'deepseek-r1-distill-qwen-7b-250120',
      messages: [
        { 
          role: 'system', 
          content: '你是一位专业的故事创作者。请创作引人入胜、情节发展合理、字数合适的短篇故事。确保故事有明确的开始、中间发展和结尾。' 
        },
        { 
          role: 'user', 
          content: `请以"${theme}"为主题，创作一个200-300字的短篇故事。故事应该有起承转合的结构，并带有鲜明的人物形象和情感。` 
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    if (!response.choices?.[0]?.message?.content) {
      return NextResponse.json({ 
        success: false, 
        error: '生成故事失败，请稍后再试' 
      }, { status: 500 });
    }
    
    return NextResponse.json(formatSuccessResponse({
      story: response.choices[0].message.content 
    }));
  } catch (error) {
    console.error('故事生成错误:', error);
    return NextResponse.json(
      handleApiError(error), 
      { status: 500 }
    );
  }
} 