'use client'

import { useState, useEffect } from 'react'
import { Voice, PodcastDialog } from '@/types'

export default function PodcastPage() {
  const [topic, setTopic] = useState('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [dialogs, setDialogs] = useState<PodcastDialog[]>([])
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

  const generatePodcast = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      const scriptResponse = await fetch('/api/generate-podcast-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content })
      })

      const scriptData = await scriptResponse.json()
      if (!scriptData.success) throw new Error(scriptData.error)

      setDialogs(scriptData.script.map((dialog: PodcastDialog) => ({
        ...dialog,
        voice: voices.find(v => v.gender === (dialog.host === 'A' ? 'Male' : 'Female'))?.id
      })))

    } catch (error: any) {
      alert('Failed to generate podcast: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAudio = async () => {
    if (dialogs.length === 0) {
      alert('Please generate podcast content first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-and-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: dialogs.map(dialog => ({
            text: dialog.text,
            voice: dialog.voice
          }))
        })
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

  const translateAndDownload = async () => {
    if (dialogs.length === 0) {
      alert('Please generate podcast content first')
      return
    }

    try {
      const content = dialogs.map(dialog => 
        `[${dialog.host}]\n${dialog.text}`
      ).join('\n\n')

      const response = await fetch('/api/translate-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: content })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      const blob = new Blob([
        content + '\n\n=== Chinese Translation ===\n\n' + data.translation
      ], { type: 'text/plain' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `podcast-script-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error: any) {
      alert('Failed to translate: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Podcast Generator</h2>

      <div className="space-y-4">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter podcast topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <button
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
            ${isGenerating || !topic.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          onClick={generatePodcast}
          disabled={isGenerating || !topic.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate Podcast'}
        </button>
      </div>

      {dialogs.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-4">
            {dialogs.map((dialog, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Host {dialog.host}
                  </span>
                  <select
                    className="p-2 border border-gray-300 rounded text-sm"
                    value={dialog.voice}
                    onChange={(e) => {
                      const newDialogs = [...dialogs]
                      newDialogs[index].voice = e.target.value
                      setDialogs(newDialogs)
                    }}
                  >
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={dialog.text}
                  onChange={(e) => {
                    const newDialogs = [...dialogs]
                    newDialogs[index].text = e.target.value
                    setDialogs(newDialogs)
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors
                ${isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
                }`}
              onClick={generateAudio}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Audio'}
            </button>
            <button
              className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium"
              onClick={translateAndDownload}
            >
              Translate & Download
            </button>
          </div>

          {audioUrl && (
            <div>
              <audio 
                className="w-full" 
                controls 
                src={audioUrl}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
} 