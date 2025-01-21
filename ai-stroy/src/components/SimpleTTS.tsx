'use client';

import { useState } from 'react';
import { VoiceSelect } from './VoiceSelect';

interface Props {
  voices: Array<{
    id: string;
    name: string;
    language: string;
    gender: string;
  }>;
}

export function SimpleTTS({ voices }: Props) {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('af_nicole');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const generateAudio = async () => {
    if (!text.trim()) {
      alert('请输入要转换的文本');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: [{
            text: text.trim(),
            voice: selectedVoice
          }]
        })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            if (data.type === 'complete' && data.success) {
              setAudioUrl(data.filename);
            }
          } catch (e) {
            console.warn('Failed to parse line:', line, e);
          }
        }
      }
    } catch (error) {
      alert('生成音频失败: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-500">简单文本转语音</h1>
      
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要转换的文本..."
          className="w-full h-48 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
        />
        
        <div className="w-full">
          <VoiceSelect
            voices={voices}
            value={selectedVoice}
            onChange={setSelectedVoice}
          />
        </div>
        
        <button
          onClick={generateAudio}
          disabled={isGenerating}
          className={`w-full px-6 py-2 rounded-lg text-white transition-colors ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? '生成中...' : '生成音频'}
        </button>
        
        {audioUrl && (
          <div className="w-full">
            <audio controls className="w-full" src={audioUrl}>
              <source src={audioUrl} type="audio/wav" />
              您的浏览器不支持音频播放
            </audio>
          </div>
        )}
      </div>
    </div>
  );
} 