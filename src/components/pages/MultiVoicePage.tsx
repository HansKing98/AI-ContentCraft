'use client'

import { useState, useEffect } from 'react'
import { Voice, ScriptSection } from '@/types'

export default function MultiVoicePage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [sections, setSections] = useState<ScriptSection[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices')
      const data = await response.json()
      setVoices(data)
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    }
  }

  const addSection = (type: 'narration' | 'dialogue') => {
    setSections([...sections, {
      id: `section-${Date.now()}`,
      type,
      text: '',
      character: type === 'dialogue' ? 'Character Name' : undefined,
      voice: voices[0]?.id
    }])
  }

  const updateSection = (id: string, updates: Partial<ScriptSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ))
  }

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id))
  }

  const generateAudio = async () => {
    if (sections.length === 0) {
      alert('Please add at least one section')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-and-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections })
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line) continue

          const data = JSON.parse(line)
          if (data.type === 'complete' && data.success) {
            setAudioUrl(`/output/${data.filename}`)
          }
        }
      }

    } catch (error: any) {
      alert('Failed to generate audio: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Multi-Voice Text-to-Speech</h2>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {section.type}
                </span>
                {section.type === 'dialogue' && (
                  <input
                    type="text"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    value={section.character}
                    onChange={(e) => updateSection(section.id, { character: e.target.value })}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="p-1 border border-gray-300 rounded text-sm"
                  value={section.voice}
                  onChange={(e) => updateSection(section.id, { voice: e.target.value })}
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                <button
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  onClick={() => removeSection(section.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={section.text}
              onChange={(e) => updateSection(section.id, { text: e.target.value })}
              placeholder={`Enter ${section.type} text...`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          onClick={() => addSection('narration')}
        >
          Add Narration
        </button>
        <button
          className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          onClick={() => addSection('dialogue')}
        >
          Add Dialogue
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
          {isGenerating ? 'Generating...' : 'Generate Audio'}
        </button>
      </div>

      {audioUrl && (
        <div className="mt-6">
          <audio 
            className="w-full" 
            controls 
            src={audioUrl}
          />
        </div>
      )}
    </div>
  )
} 