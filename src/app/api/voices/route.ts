import { NextResponse } from 'next/server';
import { formatSuccessResponse } from '@/app/utils/api-utils';
import { volcanoVoices } from '@/app/utils/tts-service';

export async function GET() {
  // 检查是否使用火山引擎 TTS
  const useVolcanoTTS = process.env.TTS_PROVIDER === 'volcano' || process.env.VOLCANO_APP_KEY;

  let voices = [];
  
  if (useVolcanoTTS) {
    // 使用火山引擎的声音列表
    voices = volcanoVoices;
    console.log('使用火山引擎声音列表，共', voices.length, '个声音');
  } else {
    // 使用默认的声音列表
    voices = [
      { id: "af", name: "默认", language: "zh-CN", gender: "女性" },
      { id: "af_bella", name: "贝拉", language: "zh-CN", gender: "女性" },
      { id: "af_nicole", name: "妮可", language: "zh-CN", gender: "女性" },
      { id: "af_sarah", name: "莎拉", language: "zh-CN", gender: "女性" },
      { id: "af_sky", name: "天蓝", language: "zh-CN", gender: "女性" },
      { id: "am_adam", name: "亚当", language: "zh-CN", gender: "男性" },
      { id: "am_michael", name: "迈克尔", language: "zh-CN", gender: "男性" },
      { id: "bf_emma", name: "艾玛", language: "en-US", gender: "女性" },
      { id: "bf_isabella", name: "伊莎贝拉", language: "en-US", gender: "女性" },
      { id: "bm_george", name: "乔治", language: "en-US", gender: "男性" },
      { id: "bm_lewis", name: "路易斯", language: "en-US", gender: "男性" }
    ];
    console.log('使用模拟声音列表，共', voices.length, '个声音');
  }
  
  return NextResponse.json(formatSuccessResponse({
    voices,
    provider: useVolcanoTTS ? 'volcano' : 'mock'
  }));
} 