import { NextResponse } from 'next/server';
import { openai } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { story } = await req.json();
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: `Convert stories into dialogue format and return JSON format with these requirements:
1. Convert any non-English text to English first
2. Separate narration and dialogues
3. Do not use asterisks (*) or any special formatting characters
4. Format: 
{
  "scenes": [
    {
      "type": "narration",
      "text": "scene description or narration"
    },
    {
      "type": "dialogue",
      "character": "Character Name",
      "text": "dialogue content"
    }
  ]
}
5. Keep dialogues natural and concise
6. Add scene descriptions where needed
7. Maintain story flow and emotion
8. Use appropriate names for characters` 
        },
        { 
          role: 'user', 
          content: `Convert this story into script format:\n${story}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const scriptContent = response.choices[0].message.content;
    let scriptData;

    try {
      const jsonMatch = scriptContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid script format');
      }

      if (!scriptData.scenes || !Array.isArray(scriptData.scenes)) {
        throw new Error('Invalid script structure');
      }

      scriptData.scenes = scriptData.scenes.map(scene => ({
        ...scene,
        text: scene.text.replace(/\*/g, ''),
        ...(scene.character && { character: scene.character.replace(/\*/g, '') })
      }));

      return NextResponse.json({ success: true, scenes: scriptData.scenes });
      
    } catch (error) {
      throw new Error('Failed to parse script format');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 