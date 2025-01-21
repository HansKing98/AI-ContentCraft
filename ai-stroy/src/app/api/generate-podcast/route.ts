import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();
        
        if (!topic?.trim()) {
            return NextResponse.json({ 
                success: false, 
                error: '请输入播客主题' 
            }, { status: 400 });
        }

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
                    content: `Create a podcast discussion about "${topic}". The content should be informative and conversational.` 
                }
            ],
        });
        
        let scriptData;
        try {
            scriptData = JSON.parse(response.choices[0].message.content);
        } catch (e) {
            const jsonMatch = response.choices[0].message.content.match(/\[[\s\S]*\]/);
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
        console.error('Error generating podcast:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
} 