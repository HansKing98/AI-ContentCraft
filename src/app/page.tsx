"use client";

import { useState } from 'react'
import StoryPage from '@/components/pages/StoryPage'
import SimpleTTSPage from '@/components/pages/SimpleTTSPage'
import MultiVoicePage from '@/components/pages/MultiVoicePage'
import PodcastPage from '@/components/pages/PodcastPage'

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'story', label: '故事生成器', icon: '📝' },
  { id: 'simple', label: '简单TTS', icon: '🔊' },
  { id: 'multi', label: '多声音TTS', icon: '🎭' },
  { id: 'podcast', label: '播客生成器', icon: '🎙️' },
];

export default function Home() {
  const [activePage, setActivePage] = useState('story')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">AI内容创作工具</h2>
        <p className="text-lg text-gray-600">选择工具，开始创作您的内容</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-sm transition-colors
              ${activePage === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            onClick={() => setActivePage(tab.id)}
          >
            <span className="text-3xl mb-2">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activePage === 'story' && <StoryPage />}
        {activePage === 'simple' && <SimpleTTSPage />}
        {activePage === 'multi' && <MultiVoicePage />}
        {activePage === 'podcast' && <PodcastPage />}
      </div>
    </div>
  )
}
