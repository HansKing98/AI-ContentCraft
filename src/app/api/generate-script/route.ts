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
          content: `请将故事转换为对话格式，并按以下要求返回 JSON 格式：
1. 首先将所有非英文文本转换为中文
2. 区分旁白和对话内容
3. 不要使用星号(*)或任何特殊格式字符
4. 格式要求：
{
  "scenes": [
    {
      "type": "narration",
      "text": "场景描述或旁白"
    },
    {
      "type": "dialogue",
      "character": "角色名称",
      "text": "对话内容"
    }
  ]
}
5. 保持对话自然简洁
6. 在需要时添加场景描述
7. 保持故事流畅性和情感
8. 为角色使用适当的名字` 
        },
        { 
          role: 'user', 
          content: `将这个故事转换为剧本格式：\n${story}` 
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