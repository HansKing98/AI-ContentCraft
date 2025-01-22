'use client'

import { useState, useEffect } from 'react'
import { Voice } from '@/types'

export default function SimpleTTSPage() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
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
      setSelectedVoice(data[0]?.id || '')
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    }
  }

  const generateAudio = async () => {
    if (!text.trim()) {
      alert('Please enter some text')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      const audioBlob = new Blob([new Uint8Array(data.audioData)], { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

    } catch (error: any) {
      alert('Failed to generate audio: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Simple Text-to-Speech</h2>

      <div>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.language})
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter text to convert to speech..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
          ${isGenerating || !text.trim() 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
        onClick={generateAudio}
        disabled={isGenerating || !text.trim()}
      >
        {isGenerating ? 'Generating...' : 'Generate Audio'}
      </button>

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