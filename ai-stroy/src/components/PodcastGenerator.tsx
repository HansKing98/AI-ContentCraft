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

interface Dialog {
  id: string;
  host: 'A' | 'B';
  text: string;
}

export function PodcastGenerator({ voices }: Props) {
  const [topic, setTopic] = useState('');
  const [hostAVoice, setHostAVoice] = useState('am_michael');
  const [hostBVoice, setHostBVoice] = useState('af_nicole');
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [audioUrl, setAudioUrl] = useState('');

  const generatePodcast = async () => {
    if (!topic.trim()) {
      alert('请输入播客主题');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setDialogs(data.script.map((dialog: any, index: number) => ({
          id: index.toString(),
          host: dialog.host,
          text: dialog.text
        })));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert('生成播客内容失败: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async () => {
    if (dialogs.length === 0) {
      alert('请先生成播客内容');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-and-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: dialogs.map(dialog => ({
            text: dialog.text.trim(),
            voice: dialog.host === 'A' ? hostAVoice : hostBVoice
          })),
          theme: topic.substring(0, 20)
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
            if (data.type === 'progress') {
              setProgress({ current: data.current, total: data.total });
            } else if (data.type === 'complete' && data.success) {
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
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-500">播客生成器</h1>
      
      <div className="space-y-6">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="输入播客主题或内容..."
          className="w-full h-48 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主持人 A 声音
            </label>
            <VoiceSelect
              voices={voices}
              value={hostAVoice}
              onChange={setHostAVoice}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主持人 B 声音
            </label>
            <VoiceSelect
              voices={voices}
              value={hostBVoice}
              onChange={setHostBVoice}
            />
          </div>
        </div>
        
        <button
          onClick={generatePodcast}
          disabled={isGenerating}
          className={`w-full px-6 py-2 rounded-lg text-white transition-colors ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? '生成中...' : '生成播客内容'}
        </button>
        
        {dialogs.length > 0 && (
          <div className="space-y-4">
            {dialogs.map((dialog) => (
              <div 
                key={dialog.id}
                className="p-4 border-2 border-gray-200 rounded-lg space-y-2"
              >
                <div className={`inline-block px-2 py-1 rounded text-white ${
                  dialog.host === 'A' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  主持人 {dialog.host}
                </div>
                <textarea
                  value={dialog.text}
                  onChange={(e) => setDialogs(dialogs.map(d => 
                    d.id === dialog.id ? { ...d, text: e.target.value } : d
                  ))}
                  className="w-full h-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
                />
              </div>
            ))}
            
            <button
              onClick={generateAudio}
              disabled={isGenerating}
              className={`w-full px-6 py-2 rounded-lg text-white transition-colors ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isGenerating ? '生成中...' : '生成音频'}
            </button>
            
            {progress.total > 0 && (
              <div className="w-full space-y-2">
                <div className="text-sm text-gray-600">
                  生成进度: {progress.current}/{progress.total}
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {audioUrl && (
              <div className="w-full">
                <audio controls className="w-full" src={audioUrl}>
                  <source src={audioUrl} type="audio/wav" />
                  您的浏览器不支持音频播放
                </audio>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 