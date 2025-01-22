"use client";

import { useState } from 'react'
import StoryPage from '@/components/pages/StoryPage'
import SimpleTTSPage from '@/components/pages/SimpleTTSPage'
import MultiVoicePage from '@/components/pages/MultiVoicePage'
import PodcastPage from '@/components/pages/PodcastPage'

export default function Home() {
  const [activePage, setActivePage] = useState('story')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="flex gap-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activePage === 'story' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActivePage('story')}
          >
            Story Generator
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activePage === 'simple' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActivePage('simple')}
          >
            Simple TTS
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activePage === 'multi' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActivePage('multi')}
          >
            Multi-Voice TTS
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activePage === 'podcast' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActivePage('podcast')}
          >
            Podcast Generator
          </button>
        </nav>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {activePage === 'story' && <StoryPage />}
          {activePage === 'simple' && <SimpleTTSPage />}
          {activePage === 'multi' && <MultiVoicePage />}
          {activePage === 'podcast' && <PodcastPage />}
        </div>
      </div>
    </div>
  )
}
