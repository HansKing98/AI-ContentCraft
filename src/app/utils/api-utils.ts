import OpenAI from 'openai';
import Replicate from "replicate";
import { exec } from 'child_process';
import { promisify } from 'util';
import { openaiCompatClient } from './ark-api';
import { getVolcanoTTS } from './tts-service';
import path from 'path';
import fs from 'fs/promises';

// 工具函数
export const execAsync = promisify(exec);

// 现在使用 ARK API 客户端作为主要的 AI 接口
export const openai = openaiCompatClient;

// 保留 OpenAI 客户端作为备用选项
export const originalOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || "https://api.deepseek.com/v1",
});

// Replicate 配置
export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// 错误处理工具
export const handleApiError = (error: unknown) => {
  console.error('API错误:', error);
  
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message || '发生了错误',
    };
  }
  
  return {
    success: false,
    error: '发生了未知错误',
  };
};

// 格式化响应
export const formatSuccessResponse = <T>(data: T) => {
  return {
    success: true,
    ...data,
  };
};

// TTS 功能，支持火山引擎 TTS 服务
export const textToSpeech = async (text: string, voice = 'default', emotion?: string) => {
  try {
    // 判断是否启用火山引擎 TTS
    const useVolcanoTTS = process.env.TTS_PROVIDER === 'volcano' || process.env.VOLCANO_APP_KEY;
    
    if (useVolcanoTTS) {
      console.log(`使用火山引擎 TTS 服务，文本长度: ${text.length}，声音: ${voice}${emotion ? '，情感: ' + emotion : ''}`);
      
      // 使用火山引擎 TTS 服务
      const volcanoTTS = getVolcanoTTS();
      // 根据voice设置默认音色
      let volcanoVoice = voice;
      if (voice === 'default') {
        volcanoVoice = 'BV700_streaming'; // 默认使用灿灿音色
      }
      
      // 创建带有测试文本的合成选项 - 首次尝试非常短的文本以快速检测问题
      const testText = "测试火山引擎TTS服务连接";
      const audioData = await volcanoTTS.synthesize({
        text: testText, 
        voice: volcanoVoice,
        format: 'mp3',
        emotion: emotion
      });
      
      if (!audioData) {
        throw new Error('TTS 音频生成失败 - 测试连接未能获取有效响应');
      }
      
      console.log('TTS 测试连接成功，现在生成正式内容');
      
      // 测试成功后，生成实际内容
      const realAudioData = await volcanoTTS.synthesize({
        text,
        voice: volcanoVoice,
        format: 'mp3',
        emotion: emotion
      });
      
      if (!realAudioData) {
        throw new Error('TTS 音频生成失败 - 实际内容生成失败');
      }
      
      // 确保输出目录存在
      const outputDir = path.join(process.cwd(), 'public', 'output');
      try {
        await fs.mkdir(outputDir, { recursive: true });
      } catch (err) {
        console.warn('创建输出目录失败，可能已存在', err);
      }
      
      // 生成文件名并保存
      const filename = `tts-${Date.now()}.mp3`;
      const filePath = path.join(outputDir, filename);
      await fs.writeFile(filePath, realAudioData);
      
      console.log(`TTS 音频已保存到 ${filePath}`);
      
      return {
        audioUrl: `/output/${filename}`
      };
    } else {
      // 使用原有 TTS 服务或模拟
      if (!process.env.TTS_API_KEY) {
        console.warn('未配置 TTS API 密钥，使用模拟 TTS');
      }
      
      // 临时模拟 TTS 返回
      return {
        audioUrl: `/api/mock-tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`,
      };
    }
  } catch (error) {
    console.error('TTS 错误:', error);
    // 返回错误信息而不是抛出异常，方便前端处理
    return {
      error: error instanceof Error ? error.message : '未知TTS错误',
      audioUrl: '' // 提供空的audioUrl避免前端解构错误
    };
  }
}; 