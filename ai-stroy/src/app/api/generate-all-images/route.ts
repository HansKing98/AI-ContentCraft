import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Replicate from "replicate";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || '',
});

export async function POST(req: Request) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const writeJSON = async (data: any) => {
        await writer.write(encoder.encode(JSON.stringify(data) + '\n'));
    };

    try {
        const { sections } = await req.json();

        await writeJSON({
            type: 'status',
            message: 'Analyzing story context...'
        });

        // 分析故事上下文
        const contextResponse = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { 
                    role: 'system', 
                    content: `Extract key story elements (characters, settings, themes) from the story sections. Keep it concise.` 
                },
                { 
                    role: 'user', 
                    content: `Analyze these story sections and extract key elements:\n${sections.map((s: any) => s.text).join('\n\n')}` 
                }
            ],
        });

        const storyContext = contextResponse.choices[0].message.content;

        await writeJSON({
            type: 'status',
            message: 'Generating prompts...'
        });

        // 生成所有提示词
        const promptResults = [];
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            
            await writeJSON({
                type: 'prompt_progress',
                current: i + 1,
                total: sections.length,
                message: `Generating prompt ${i + 1}/${sections.length}`
            });

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

        await writeJSON({
            type: 'status',
            message: 'Generating images...'
        });

        // 生成所有图片
        for (let i = 0; i < promptResults.length; i++) {
            const { sectionId, prompt } = promptResults[i];
            
            await writeJSON({
                type: 'image_progress',
                current: i + 1,
                total: promptResults.length,
                message: `Generating image ${i + 1}/${promptResults.length}`
            });

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
                    if (output.output && Array.isArray(output.output)) {
                        imageUrl = output.output[0];
                    } else {
                        imageUrl = output.url || output.output || output.image;
                    }
                }

                if (!imageUrl) {
                    throw new Error('No valid image URL in API response');
                }

                await writeJSON({
                    type: 'section_complete',
                    sectionId: sectionId,
                    prompt: prompt,
                    imageUrl: String(imageUrl),
                    current: i + 1,
                    total: promptResults.length
                });

            } catch (error: any) {
                await writeJSON({
                    type: 'section_error',
                    sectionId: sectionId,
                    error: error.message
                });
            }
        }

        await writeJSON({
            type: 'complete',
            message: 'All images generated successfully'
        });
    } catch (error: any) {
        await writeJSON({
            type: 'error',
            error: error.message
        });
    } finally {
        await writer.close();
    }

    return new NextResponse(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
} 