"use client";

import { useState, useEffect } from "react";
import { StoryGenerator } from "@/components/StoryGenerator";
import { SimpleTTS } from "@/components/SimpleTTS";
import { MultiVoiceTTS } from "@/components/MultiVoiceTTS";
import { PodcastGenerator } from "@/components/PodcastGenerator";

export default function Home() {
  const [activeTab, setActiveTab] = useState("story");
  const [voices, setVoices] = useState<
    Array<{
      id: string;
      name: string;
      language: string;
      gender: string;
    }>
  >([]);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch("/api/voices");
      const data = await response.json();
      setVoices(data);
    } catch (error) {
      console.error("加载声音失败:", error);
      setVoices([
        {
          id: "af_nicole",
          name: "Nicole (Default)",
          language: "en-us",
          gender: "Female",
        },
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* 导航栏 */}
        <nav className="bg-blue-500 rounded-lg p-4 mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab("story")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "story"
                ? "bg-white text-blue-500"
                : "text-white border border-white hover:bg-white/10"
            }`}
          >
            故事生成器
          </button>
          <button
            onClick={() => setActiveTab("simple")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "simple"
                ? "bg-white text-blue-500"
                : "text-white border border-white hover:bg-white/10"
            }`}
          >
            简单TTS
          </button>
          <button
            onClick={() => setActiveTab("multi")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "multi"
                ? "bg-white text-blue-500"
                : "text-white border border-white hover:bg-white/10"
            }`}
          >
            多声音TTS
          </button>
          <button
            onClick={() => setActiveTab("podcast")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "podcast"
                ? "bg-white text-blue-500"
                : "text-white border border-white hover:bg-white/10"
            }`}
          >
            播客生成器
          </button>
        </nav>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {activeTab === "story" && <StoryGenerator voices={voices} />}
          {activeTab === "simple" && <SimpleTTS voices={voices} />}
          {activeTab === "multi" && <MultiVoiceTTS voices={voices} />}
          {activeTab === "podcast" && <PodcastGenerator voices={voices} />}
        </div>
      </div>
    </main>
  );
}
