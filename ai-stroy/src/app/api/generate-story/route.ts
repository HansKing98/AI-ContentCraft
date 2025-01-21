import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || ''
});

export async function POST(req: Request) {
    try {
        const { theme } = await req.json();
        
        if (!theme?.trim()) {
            return NextResponse.json({ 
                success: false, 
                error: '请输入故事主题' 
            }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { 
                    role: 'system', 
                    content: '你是一位专业的故事作家，能够创作出具有良好情节发展的引人入胜的短篇故事。' 
                },
                { 
                    role: 'user', 
                    content: `写一个短篇故事关于 "${theme}" 大约200个单词` 
                }
            ],
        });
        
        return NextResponse.json({ 
            success: true,
            story: response.choices[0].message.content 
        });
    } catch (error: unknown) {
        console.error('Error generating story:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        }, { status: 500 });
    }
} 