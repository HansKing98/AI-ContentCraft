'use client'

import { useState, useEffect } from 'react'

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  info?: string;
  purchased?: boolean;
  instanceId?: string;
}

export default function SimpleTTSPage() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [history, setHistory] = useState<{text: string, voiceId: string, audioUrl: string}[]>([])
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
          // 默认选择第一个已购买的音色
          const purchasedVoice = data.voices.find((v: Voice) => v.purchased !== false)
          if (purchasedVoice) {
            setSelectedVoice(purchasedVoice.id)
          } else if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].id)
          }
        }
      } catch (error) {
        console.error('获取语音列表失败:', error)
      }
    }

    fetchVoices()
  }, [])

  const generateAudio = async () => {
    if (!text.trim()) {
      alert('请输入要转换的文本')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice: selectedVoice 
        })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      // 假设API返回audioUrl或audioData
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl)
        // 添加到历史记录
        setHistory(prev => [
          { text, voiceId: selectedVoice, audioUrl: data.audioUrl },
          ...prev.slice(0, 4) // 只保留最近的5个
        ])
      } else {
        throw new Error('未返回音频数据')
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert('生成音频失败: ' + errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const getVoiceName = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId)
    return voice ? voice.name : voiceId
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
      <h2 className="text-2xl font-bold text-gray-800">简单文本转语音</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-3">音色选择</h3>
          
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
          
          {/* 音色选择区域 */}
          <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
            {/* 已购买的音色 */}
            {purchasedVoices.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                  已购买的音色 ({purchasedVoices.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                  {purchasedVoices.map(voice => (
                    <div 
                      key={voice.id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedVoice === voice.id 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="voice"
                          checked={selectedVoice === voice.id}
                          onChange={() => setSelectedVoice(voice.id)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="ml-2">
                          <div className="font-medium text-gray-900">{voice.name}</div>
                          <div className="text-xs text-gray-500">
                            {voice.gender}, {voice.language}
                            {voice.info && <span className="ml-1">- {voice.info}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 免费音色 */}
            {freeVoices.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
                  免费音色 ({freeVoices.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                  {freeVoices.map(voice => (
                    <div 
                      key={voice.id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedVoice === voice.id 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="voice"
                          checked={selectedVoice === voice.id}
                          onChange={() => setSelectedVoice(voice.id)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="ml-2">
                          <div className="font-medium text-gray-900">{voice.name}</div>
                          <div className="text-xs text-gray-500">
                            {voice.gender}, {voice.language}
                            {voice.info && <span className="ml-1">- {voice.info}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 未购买的音色 */}
            {!showOnlyPurchased && unpurchasedVoices.length > 0 && (
              <div>
                <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                  未购买的音色 ({unpurchasedVoices.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                  {unpurchasedVoices.map(voice => (
                    <div 
                      key={voice.id}
                      className="p-2 rounded bg-gray-100 border border-gray-200 opacity-70"
                    >
                      <div className="flex items-center">
                        <div className="ml-2">
                          <div className="font-medium text-gray-700">{voice.name}</div>
                          <div className="text-xs text-gray-500">
                            {voice.gender}, {voice.language}
                            {voice.info && <span className="ml-1">- {voice.info}</span>}
                          </div>
                          <div className="text-xs text-red-500 mt-1">需要购买</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filteredVoices.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                没有找到匹配的音色
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
            输入文本
          </label>
          <textarea
            id="text-input"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            placeholder="请输入要转换为语音的文本..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button 
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
            ${isGenerating || !text.trim() || !selectedVoice
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          onClick={generateAudio}
          disabled={isGenerating || !text.trim() || !selectedVoice}
        >
          {isGenerating ? '生成中...' : '生成语音'}
        </button>
      </div>

      {audioUrl && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-3">生成的语音</h3>
          <audio controls className="w-full" src={audioUrl}>
            您的浏览器不支持音频元素
          </audio>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">历史记录</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    {getVoiceName(item.voiceId)}
                  </span>
                  <button 
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setText(item.text)
                      setSelectedVoice(item.voiceId)
                    }}
                  >
                    重用
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.text}</p>
                <audio controls className="w-full" src={item.audioUrl}>
                  您的浏览器不支持音频元素
                </audio>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 