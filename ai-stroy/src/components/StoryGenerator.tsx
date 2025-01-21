'use client';

import { useState } from 'react';

interface Props {
  voices: Array<{
    id: string;
    name: string;
    language: string;
    gender: string;
  }>;
}

export function StoryGenerator({ voices }: Props) {
  const [theme, setTheme] = useState('');
  const [story, setStory] = useState('');
  const [script, setScript] = useState<Array<{
    type: 'narration' | 'dialogue';
    text: string;
    character?: string;
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateStory = async () => {
    if (!theme.trim()) {
      alert('请输入故事主题');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStory(data.story);
      } else {
        throw new Error(data.error || '生成故事失败');
      }
    } catch (error) {
      alert('生成故事失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateScript = async () => {
    if (!story.trim()) {
      alert('请先生成故事内容');
      return;
    }

    setIsGeneratingScript(true);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.script) {
        setScript(data.script.scenes);
      } else {
        throw new Error(data.error || '转换脚本失败');
      }
    } catch (error) {
      alert('转换脚本失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const addScriptSection = (type: 'narration' | 'dialogue') => {
    setScript(prev => [...prev, {
      type,
      text: '',
      ...(type === 'dialogue' ? { character: '角色名称' } : {})
    }]);
  };

  const updateScriptSection = (index: number, updates: Partial<typeof script[0]>) => {
    setScript(prev => prev.map((section, i) => 
      i === index ? { ...section, ...updates } : section
    ));
  };

  const deleteScriptSection = (index: number) => {
    setScript(prev => prev.filter((_, i) => i !== index));
  };

  const generateAudio = async () => {
    if (!story.trim() || !selectedVoice) {
      alert('请确保已生成故事并选择语音');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: story, voiceId: selectedVoice }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAudioUrl(data.audioUrl);
      } else {
        throw new Error(data.error || '生成音频失败');
      }
    } catch (error) {
      alert('生成音频失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-500">故事生成器</h1>
      
      <div className="space-y-4">
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="输入故事主题..."
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        
        <button
          onClick={generateStory}
          disabled={isGenerating}
          className={`px-6 py-2 rounded-lg text-white transition-colors ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? '生成中...' : '生成故事'}
        </button>
        
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="生成的故事将显示在这里..."
          className="w-full h-48 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
        />
      </div>
      
      {story && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">脚本转换</h2>
            <button
              onClick={generateScript}
              disabled={isGeneratingScript}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                isGeneratingScript 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGeneratingScript ? '转换中...' : '转换为脚本'}
            </button>
          </div>

          {script.length > 0 && (
            <div className="space-y-4">
              {script.map((section, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {section.type === 'narration' ? '旁白' : '对话'}
                    </span>
                    <button
                      onClick={() => deleteScriptSection(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                  
                  {section.type === 'dialogue' && (
                    <input
                      type="text"
                      value={section.character}
                      onChange={(e) => updateScriptSection(index, { character: e.target.value })}
                      placeholder="角色名称"
                      className="w-full px-3 py-1 mb-2 border border-gray-200 rounded"
                    />
                  )}
                  
                  <textarea
                    value={section.text}
                    onChange={(e) => updateScriptSection(index, { text: e.target.value })}
                    placeholder={section.type === 'narration' ? '旁白内容...' : '对话内容...'}
                    className="w-full h-24 px-3 py-2 border border-gray-200 rounded resize-y"
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  onClick={() => addScriptSection('narration')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  添加旁白
                </button>
                <button
                  onClick={() => addScriptSection('dialogue')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  添加对话
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="">选择语音...</option>
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.language} - {voice.gender})
            </option>
          ))}
        </select>

        <button
          onClick={generateAudio}
          disabled={isGeneratingAudio || !story || !selectedVoice}
          className={`px-6 py-2 rounded-lg text-white transition-colors ${
            isGeneratingAudio || !story || !selectedVoice
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isGeneratingAudio ? '生成音频中...' : '生成音频'}
        </button>

        {audioUrl && (
          <div className="mt-4">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              您的浏览器不支持音频播放
            </audio>
            <a 
              href={audioUrl} 
              download="story-audio.mp3"
              className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
            >
              下载音频
            </a>
          </div>
        )}
      </div>
      
      {/* 这里可以添加脚本转换和音频生成的功能 */}
      
    </div>
  );
} 