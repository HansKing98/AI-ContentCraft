import { NextResponse } from 'next/server';
import { openai } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { content } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: `Convert content into a natural English conversation between two podcast hosts (A and B). Requirements:
1. Format the response as JSON array of dialog objects
2. Each object should have 'host' (either 'A' or 'B') and 'text' fields
3. Keep the conversation natural and engaging
4. Convert any non-English content to English
Format example:
[
    {"host": "A", "text": "Welcome to our show..."},
    {"host": "B", "text": "Today we're discussing..."}
]` 
        },
        { 
          role: 'user', 
          content: `Convert this content into a podcast conversation:\n${content}` 
        }
      ],
    });
    
    const scriptContent = response.choices[0].message.content;
    let scriptData;
    try {
      scriptData = JSON.parse(scriptContent);
    } catch (e) {
      const jsonMatch = scriptContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid script format');
      }
    }

    return NextResponse.json({ 
      success: true,
      script: scriptData
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 