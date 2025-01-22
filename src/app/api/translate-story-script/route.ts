import { NextResponse } from 'next/server';
import { openai } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { script } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: `Translate the story script to Chinese. Keep the format:
1. Keep the [Narration] and [Dialogue] labels
2. Translate naturally and maintain the story flow
3. Return in this format:
[Narration]
Chinese translation

[Dialogue]
Character Name:
Chinese translation
` 
        },
        { 
          role: 'user', 
          content: `Translate this story script to Chinese:\n${script}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return NextResponse.json({ 
      success: true,
      translation: response.choices[0].message.content 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 