import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { text, context } = await req.json();
        
        if (!text) {
            return NextResponse.json({ 
                success: false, 
                error: 'Text is required' 
            }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { 
                    role: 'system', 
                    content: `You are a professional image prompt engineer. Create concise but detailed image prompts that maintain consistency.

Requirements:
1. Keep prompts under 75 words
2. Focus on key visual elements and maintain character/setting consistency
3. Include artistic style and mood
4. Avoid NSFW content
5. Use natural, descriptive language
6. Output in English only

Story context:
${context || 'No context provided'}` 
                },
                { 
                    role: 'user', 
                    content: `Create an image generation prompt for this scene while maintaining consistency with any provided context: "${text}"` 
                }
            ],
        });

        return NextResponse.json({ 
            success: true,
            prompt: response.choices[0].message.content
        });
    } catch (error: any) {
        console.error('Error generating prompt:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
} 