import { NextResponse } from 'next/server';
import { openai } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { topic } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional podcast content creator. Create engaging and informative podcast content that is suitable for a conversation between two hosts.' 
        },
        { 
          role: 'user', 
          content: `Create a podcast discussion outline about "${topic}". The content should be informative and conversational.` 
        }
      ],
    });
    
    return NextResponse.json({ 
      success: true,
      content: response.choices[0].message.content 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 