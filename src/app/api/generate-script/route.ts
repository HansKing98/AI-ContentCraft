import { NextResponse } from 'next/server';
import { openai, handleApiError, formatSuccessResponse } from '@/app/utils/api-utils';

interface ScriptScene {
  type: 'narration' | 'dialogue';
  character?: string;
  text: string;
  id?: string;
}

export async function POST(req: Request) {
  try {
    const { story } = await req.json();
    
    if (!story || typeof story !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: '请提供有效的故事内容' 
      }, { status: 400 });
    }

    console.log(`调用 ARK API 生成脚本，故事长度: ${story.length}`);

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'deepseek-r1-distill-qwen-7b-250120',
      messages: [
        { 
          role: 'system', 
          content: `请将故事转换为对话格式，并按以下要求返回 JSON 格式：
1. 请保留原始语言，不要强制翻译
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
8. 为角色使用适当的名字
9. 确保返回的是有效的JSON格式` 
        },
        { 
          role: 'user', 
          content: `将这个故事转换为剧本格式：\n${story}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    if (!response.choices?.[0]?.message?.content) {
      return NextResponse.json({ 
        success: false, 
        error: '生成脚本失败，请稍后再试' 
      }, { status: 500 });
    }

    const scriptContent = response.choices[0].message.content;
    
    try {
      const scriptData = JSON.parse(scriptContent);

      if (!scriptData.scenes || !Array.isArray(scriptData.scenes)) {
        return NextResponse.json({ 
          success: false, 
          error: '脚本结构无效' 
        }, { status: 500 });
      }

      // 清理脚本数据，移除特殊字符并添加ID
      const cleanedScenes = scriptData.scenes.map((scene: ScriptScene, index: number) => ({
        type: scene.type,
        text: scene.text?.replace(/\*/g, '') || '',
        id: `section-${index}`,
        ...(scene.character && { character: scene.character.replace(/\*/g, '') })
      }));

      return NextResponse.json(formatSuccessResponse({
        scenes: cleanedScenes
      }));
      
    } catch (error) {
      console.error('脚本解析错误:', error);
      return NextResponse.json({ 
        success: false, 
        error: '脚本格式解析失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('脚本生成错误:', error);
    return NextResponse.json(
      handleApiError(error), 
      { status: 500 }
    );
  }
} 