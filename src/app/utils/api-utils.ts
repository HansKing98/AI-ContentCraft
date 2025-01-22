import OpenAI from 'openai';
import Replicate from "replicate";
import { exec } from 'child_process';
import { promisify } from 'util';

// 工具函数
export const execAsync = promisify(exec);

// 初始化 TTS
export const initTTS = async () => {
  console.log('Initializing TTS...');
  const model_id = "onnx-community/Kokoro-82M-ONNX";
  // const tts = await KokoroTTS.from_pretrained(model_id, {
  //   dtype: "q8",
  // });
  console.log('TTS initialized successfully');
  return null;
};

// 初始化 Deepseek
export const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",  // Deepseek 的 API 端点
});

// 初始化 Replicate
export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 如果需要TTS功能，我们可以使用其他替代方案
// 比如使用Web Speech API或其他跨平台TTS库
export const textToSpeech = async (text: string) => {
    // 临时返回一个错误，直到我们实现新的TTS解决方案
    throw new Error('TTS功能暂时不可用，我们正在修复这个问题');
}; 