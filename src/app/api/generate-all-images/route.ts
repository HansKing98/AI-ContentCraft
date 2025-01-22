import { NextResponse } from 'next/server';
import { StreamingTextResponse } from 'next/streaming';
import { openai, replicate } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { sections } = await req.json();
  
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    await writer.write(encoder.encode(JSON.stringify({
      type: 'status',
      message: 'Analyzing story context...'
    }) + '\n'));

    const contextResponse = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: `Extract key story elements (characters, settings, themes) from the story sections. Keep it concise.` 
        },
        { 
          role: 'user', 
          content: `Analyze these story sections and extract key elements:\n${sections.map(s => s.text).join('\n\n')}` 
        }
      ],
    });

    const storyContext = contextResponse.choices[0].message.content;

    await writer.write(encoder.encode(JSON.stringify({
      type: 'status',
      message: 'Generating prompts...'
    }) + '\n'));

    const promptResults = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      await writer.write(encoder.encode(JSON.stringify({
        type: 'prompt_progress',
        current: i + 1,
        total: sections.length,
        message: `Generating prompt ${i + 1}/${sections.length}`
      }) + '\n'));

      const promptResponse = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional image prompt engineer. Create concise but detailed image prompts that maintain consistency across a story.

Requirements:
1. Keep prompts under 75 words
2. Focus on key visual elements and maintain character/setting consistency
3. Include artistic style and mood
4. Avoid NSFW content
5. Use natural, descriptive language
6. Output in English only

Story context:
${storyContext}` 
          },
          { 
            role: 'user', 
            content: `Create an image generation prompt for this scene while maintaining consistency with the story context: "${section.text}"` 
          }
        ],
      });

      promptResults.push({
        sectionId: section.id,
        prompt: promptResponse.choices[0].message.content
      });
    }

    await writer.write(encoder.encode(JSON.stringify({
      type: 'status',
      message: 'Generating images...'
    }) + '\n'));

    for (let i = 0; i < promptResults.length; i++) {
      const { sectionId, prompt } = promptResults[i];
      
      await writer.write(encoder.encode(JSON.stringify({
        type: 'image_progress',
        current: i + 1,
        total: promptResults.length,
        message: `Generating image ${i + 1}/${promptResults.length}`
      }) + '\n'));

      try {
        const output = await replicate.run(
          "black-forest-labs/flux-schnell",
          {
            input: {
              prompt: prompt,
              seed: 1234,
              num_inference_steps: 4,
              guidance_scale: 7.5
            }
          }
        );

        let imageUrl;
        if (Array.isArray(output)) {
          imageUrl = output[0];
        } else if (typeof output === 'string') {
          imageUrl = output;
        } else if (typeof output === 'object' && output !== null) {
          imageUrl = output.url || output.output?.[0] || output.image;
        }

        if (!imageUrl) {
          throw new Error('No valid image URL in API response');
        }

        await writer.write(encoder.encode(JSON.stringify({
          type: 'section_complete',
          sectionId: sectionId,
          prompt: prompt,
          imageUrl: String(imageUrl),
          current: i + 1,
          total: promptResults.length
        }) + '\n'));

      } catch (error: any) {
        await writer.write(encoder.encode(JSON.stringify({
          type: 'section_error',
          sectionId: sectionId,
          error: error.message
        }) + '\n'));
      }
    }

    await writer.write(encoder.encode(JSON.stringify({
      type: 'complete',
      message: 'All images generated successfully'
    })));
    await writer.close();

  } catch (error: any) {
    await writer.write(encoder.encode(JSON.stringify({
      type: 'error',
      error: error.message
    })));
    await writer.close();
  }

  return new StreamingTextResponse(stream.readable);
} 