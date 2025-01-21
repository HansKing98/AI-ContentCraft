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

interface Section {
  id: string;
  text: string;
  voice: string;
}

export function MultiVoiceTTS({ voices }: Props) {
  const [sections, setSections] = useState<Section[]>([
    { id: '1', text: '', voice: 'af_nicole' },
    { id: '2', text: '', voice: 'af_nicole' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [audioUrl, setAudioUrl] = useState('');

  const addSection = () => {
    setSections([
      ...sections,
      { id: Date.now().toString(), text: '', voice: 'af_nicole' }
    ]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const generateAllAudio = async () => {
    const validSections = sections.filter(s => s.text.trim());
    if (validSections.length === 0) {
      alert('请至少输入一段文本');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-and-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: validSections.map(({ text, voice }) => ({
            text: text.trim(),
            voice
          }))
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
      <h1 className="text-2xl font-bold text-blue-500">多声音文本转语音</h1>
      
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">段落 {index + 1}</h3>
              {sections.length > 1 && (
                <button
                  onClick={() => removeSection(section.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  删除
                </button>
              )}
            </div>
            
            <textarea
              value={section.text}
              onChange={(e) => updateSection(section.id, { text: e.target.value })}
              placeholder="输入文本..."
              className="w-full h-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
            />
            
            <VoiceSelect
              voices={voices}
              value={section.voice}
              onChange={(voice) => updateSection(section.id, { voice })}
            />
          </div>
        ))}
        
        <button
          onClick={addSection}
          className="w-full px-6 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors"
        >
          添加段落
        </button>
        
        <button
          onClick={generateAllAudio}
          disabled={isGenerating}
          className={`w-full px-6 py-2 rounded-lg text-white transition-colors ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
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
    </div>
  );
} 