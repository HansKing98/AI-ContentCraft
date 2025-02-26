'use client'

import { useState } from 'react'
import { ScriptSection } from '@/types'

export default function StoryPage() {
  const [theme, setTheme] = useState('')
  const [story, setStory] = useState('')
  const [script, setScript] = useState<ScriptSection[]>([])
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [scriptGenerated, setScriptGenerated] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const generateStory = async () => {
    if (!theme.trim()) {
      alert('请输入故事主题')
      return
    }

    setIsGeneratingStory(true)
    setScript([])
    setScriptGenerated(false)
    setImageUrl(null)
    
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setStory(data.story)
      
      // 自动生成脚本
      const scriptResponse = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: data.story })
      })

      const scriptData = await scriptResponse.json()
      if (!scriptData.success) throw new Error(scriptData.error)
      
      setScript(scriptData.scenes)
      setScriptGenerated(true)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert('生成故事失败: ' + errorMessage)
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const generateImage = async () => {
    if (!story) {
      alert('请先生成故事')
      return
    }

    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: story.substring(0, 1000) })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      setImageUrl(data.imageUrl)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert('生成图片失败: ' + errorMessage)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const generateScript = async () => {
    if (!story) {
      alert('请先生成故事')
      return
    }

    setIsGeneratingScript(true)
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setScript(data.scenes)
      setScriptGenerated(true)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert('转换为脚本失败: ' + errorMessage)
    } finally {
      setIsGeneratingScript(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">故事生成器</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="输入故事主题..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />

        <button 
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
            ${isGeneratingStory || !theme.trim() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          onClick={generateStory}
          disabled={isGeneratingStory || !theme.trim()}
        >
          {isGeneratingStory ? '生成中...' : '生成故事'}
        </button>
      </div>

      {story && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700">生成的故事</h3>
            <div className="flex gap-2">
              <button
                className={`py-2 px-3 rounded-lg text-sm text-white font-medium transition-colors
                  ${isGeneratingImage 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                  }`}
                onClick={generateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? '生成中...' : '生成插图'}
              </button>
              
              <button
                className={`py-2 px-3 rounded-lg text-sm text-white font-medium transition-colors
                  ${isGeneratingScript 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                onClick={generateScript}
                disabled={isGeneratingScript}
              >
                {isGeneratingScript ? '转换中...' : '转换为脚本'}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="prose max-w-none whitespace-pre-wrap">
              {story}
            </div>
          </div>
          
          {imageUrl && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">故事插图</h3>
              <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="故事插图" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {scriptGenerated && script.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">故事脚本</h3>
          <div className="space-y-3">
            {script.map((section) => (
              <div key={section.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    section.type === 'narration' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {section.type === 'narration' ? '旁白' : '对话'}
                  </span>
                  {section.character && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      {section.character}
                    </span>
                  )}
                </div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded bg-white min-h-[100px] resize-y"
                  value={section.text}
                  onChange={(e) => {
                    const newScript = [...script]
                    const index = newScript.findIndex(s => s.id === section.id)
                    newScript[index] = { ...newScript[index], text: e.target.value }
                    setScript(newScript)
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
              className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              onClick={() => {
                const newSection = {
                  id: `section-${script.length}`,
                  type: 'narration' as const,
                  text: ''
                }
                setScript([...script, newSection])
              }}
            >
              添加旁白
            </button>
            <button
              className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              onClick={() => {
                const newSection = {
                  id: `section-${script.length}`,
                  type: 'dialogue' as const,
                  character: '角色名称',
                  text: ''
                }
                setScript([...script, newSection])
              }}
            >
              添加对话
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 