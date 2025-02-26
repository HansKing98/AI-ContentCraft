'use client'

import { useState, useEffect } from 'react'
import { Voice, ScriptSection } from '@/types'

interface SectionWithVoice extends ScriptSection {
  voice?: string;
}

export default function MultiVoicePage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [sections, setSections] = useState<SectionWithVoice[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [filterGender, setFilterGender] = useState<string>('all')
  const [showOnlyPurchased, setShowOnlyPurchased] = useState(false)

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices')
        const data = await response.json()
        if (data.success && data.voices) {
          setVoices(data.voices)
        } else {
          console.error('无效的声音数据:', data)
        }
      } catch (error) {
        console.error('获取声音列表失败:', error)
      }
    }

    fetchVoices()
  }, [])

  const addSection = (type: 'narration' | 'dialogue') => {
    // 默认选择第一个已购买的音色或免费音色
    const defaultVoice = voices.find(v => v.purchased !== false)?.id || 
                        voices.find(v => v.id === 'BV001_streaming')?.id || 
                        voices[0]?.id;
    
    setSections([...sections, {
      id: `section-${Date.now()}`,
      type,
      text: '',
      character: type === 'dialogue' ? '角色名称' : undefined,
      voice: defaultVoice
    }])
  }

  const updateSection = (id: string, updates: Partial<SectionWithVoice>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ))
  }

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id))
  }

  const generateAudio = async () => {
    if (sections.length === 0) {
      alert('请至少添加一个部分')
      return
    }

    // 检查所有部分是否都有文本和声音
    const invalidSections = sections.filter(s => !s.text.trim() || !s.voice)
    if (invalidSections.length > 0) {
      alert('请确保所有部分都有文本和选择的声音')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setStatusMessage('正在准备音频生成...')
    setAudioUrl(null)

    try {
      const response = await fetch('/api/generate-and-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections })
      })

      if (!response.body) {
        throw new Error('响应没有内容')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const data = JSON.parse(line)
            
            if (data.type === 'progress') {
              setProgress(Math.floor((data.current / data.total) * 100))
              setStatusMessage(`正在生成部分 ${data.current}/${data.total}`)
            } else if (data.type === 'status') {
              setStatusMessage(data.message)
            } else if (data.type === 'complete' && data.success) {
              setAudioUrl(`/output/${data.filename}`)
              setStatusMessage('音频生成完成！')
            } else if (data.type === 'error') {
              throw new Error(data.message || '生成音频时出错')
            }
          } catch (e) {
            console.error('解析进度更新失败:', e, line)
          }
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setStatusMessage(`错误: ${errorMessage}`)
      alert('生成音频失败: ' + errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // 过滤和分组音色
  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (voice.info || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || voice.language === filterLanguage;
    const matchesGender = filterGender === 'all' || voice.gender === filterGender;
    const matchesPurchased = !showOnlyPurchased || voice.purchased !== false;
    
    return matchesSearch && matchesLanguage && matchesGender && matchesPurchased;
  });

  // 获取所有可用的语言和性别选项
  const languages = Array.from(new Set(voices.map(voice => voice.language)));
  const genders = Array.from(new Set(voices.map(voice => voice.gender)));

  // 将音色分组
  const purchasedVoices = filteredVoices.filter(voice => voice.purchased === true);
  const freeVoices = filteredVoices.filter(voice => voice.id === 'BV001_streaming' || voice.id === 'BV002_streaming');
  const unpurchasedVoices = filteredVoices.filter(voice => 
    voice.purchased === false && 
    voice.id !== 'BV001_streaming' && 
    voice.id !== 'BV002_streaming'
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">多声音文本转语音</h2>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-3">音色筛选</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* 搜索框 */}
          <div>
            <label htmlFor="voice-search" className="block text-sm font-medium text-gray-700 mb-1">
              搜索音色
            </label>
            <input
              type="text"
              id="voice-search"
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="输入音色名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* 语言筛选 */}
          <div>
            <label htmlFor="language-filter" className="block text-sm font-medium text-gray-700 mb-1">
              语言
            </label>
            <select
              id="language-filter"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              <option value="all">全部语言</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          
          {/* 性别筛选 */}
          <div>
            <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-700 mb-1">
              性别
            </label>
            <select
              id="gender-filter"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="all">全部性别</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 只显示已购买选项 */}
        <div className="mb-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              checked={showOnlyPurchased}
              onChange={(e) => setShowOnlyPurchased(e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">只显示已购买的音色</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  section.type === 'narration' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {section.type === 'narration' ? '旁白' : '对话'}
                </span>
                {section.type === 'dialogue' && (
                  <input
                    type="text"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    value={section.character}
                    onChange={(e) => updateSection(section.id, { character: e.target.value })}
                    placeholder="角色名称"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="p-2 border border-gray-300 rounded text-sm"
                  value={section.voice}
                  onChange={(e) => updateSection(section.id, { voice: e.target.value })}
                >
                  <option value="">选择声音...</option>
                  
                  {/* 已购买的音色 */}
                  {purchasedVoices.length > 0 && (
                    <optgroup label="已购买的音色">
                      {purchasedVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender}, {voice.language})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* 免费音色 */}
                  {freeVoices.length > 0 && (
                    <optgroup label="免费音色">
                      {freeVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender}, {voice.language})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* 未购买的音色 */}
                  {!showOnlyPurchased && unpurchasedVoices.length > 0 && (
                    <optgroup label="未购买的音色 (不可用)">
                      {unpurchasedVoices.map((voice) => (
                        <option key={voice.id} value={voice.id} disabled>
                          {voice.name} ({voice.gender}, {voice.language}) - 需要购买
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <button
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  onClick={() => removeSection(section.id)}
                >
                  删除
                </button>
              </div>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              value={section.text}
              onChange={(e) => updateSection(section.id, { text: e.target.value })}
              placeholder={`输入${section.type === 'narration' ? '旁白' : '对话'}内容...`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          onClick={() => addSection('narration')}
        >
          添加旁白
        </button>
        <button
          className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          onClick={() => addSection('dialogue')}
        >
          添加对话
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors
            ${isGenerating || sections.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          onClick={generateAudio}
          disabled={isGenerating || sections.length === 0}
        >
          {isGenerating ? '生成中...' : '生成音频'}
        </button>
      </div>

      {isGenerating && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{statusMessage}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-3">生成的音频</h3>
          <audio controls className="w-full" src={audioUrl}>
            您的浏览器不支持音频元素
          </audio>
        </div>
      )}
    </div>
  )
} 