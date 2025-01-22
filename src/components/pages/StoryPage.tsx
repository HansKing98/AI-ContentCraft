'use client'

import { useState } from 'react'
import { ScriptSection } from '@/types'

interface Scene {
  type: 'narration' | 'dialogue';
  character?: string;
  text: string;
}

export default function StoryPage() {
  const [theme, setTheme] = useState('')
  const [story, setStory] = useState('')
  const [script, setScript] = useState<ScriptSection[]>([])
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [scriptGenerated, setScriptGenerated] = useState(false)

  const generateStory = async () => {
    if (!theme.trim()) {
      alert('Please enter a theme')
      return
    }

    setIsGeneratingStory(true)
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setStory(data.story)
      
      const scriptResponse = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: data.story })
      })

      const scriptData = await scriptResponse.json()
      if (!scriptData.success) throw new Error(scriptData.error)
      
      setScript(scriptData.scenes.map((scene: Scene, index: number) => ({
        ...scene,
        id: `section-${index}`
      })))

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Failed to generate story: ' + errorMessage)
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const generateImage = async (text: string) => {
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      return data.imageUrl
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Failed to generate image: ' + errorMessage)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const generateScript = async () => {
    if (!story) {
      alert('Please generate a story first')
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
      
      setScript(data.scenes.map((scene: Scene, index: number) => ({
        ...scene,
        id: `section-${index}`
      })))
      setScriptGenerated(true)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Failed to convert to script: ' + errorMessage)
    } finally {
      setIsGeneratingScript(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Story Generator</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter story theme..."
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
          {isGeneratingStory ? 'Generating...' : 'Generate Story'}
        </button>
      </div>

      {story && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Generated Story</h3>
          <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
            {story}
          </div>
          
          <div className="flex gap-4">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors
                ${isGeneratingScript 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
                }`}
              onClick={generateScript}
              disabled={isGeneratingScript}
            >
              {isGeneratingScript ? 'Converting...' : 'Convert to Script'}
            </button>
            
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors
                ${isGeneratingImage 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
                }`}
              onClick={() => generateImage(story)}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? 'Generating...' : 'Generate Story Image'}
            </button>
          </div>
        </div>
      )}

      {scriptGenerated && script.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Story Script</h3>
          {script.map((section) => (
            <div key={section.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  section.type === 'narration' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {section.type}
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
              Add Narration
            </button>
            <button
              className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              onClick={() => {
                const newSection = {
                  id: `section-${script.length}`,
                  type: 'dialogue' as const,
                  character: 'Character Name',
                  text: ''
                }
                setScript([...script, newSection])
              }}
            >
              Add Dialogue
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 