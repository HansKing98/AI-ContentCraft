import { NextResponse } from 'next/server';
import { initTTS } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { text, voice = "af_nicole" } = await req.json();
  
  try {
    const tts = await initTTS();
    const audio = await tts.generate(text, {
      voice: voice,
    });
    
    return NextResponse.json({ 
      success: true,
      audioData: audio.data
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 