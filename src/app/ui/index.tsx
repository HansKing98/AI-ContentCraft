"use client";

import Link from 'next/link';
import { useState } from 'react';

interface UIPrototype {
  id: string;
  title: string;
  description: string;
  path: string;
  date: string;
  tags: string[];
  thumbnail?: string;
}

const uiPrototypes: UIPrototype[] = [
  {
    id: 'ledger',
    title: '我家记账APP',
    description: '家庭记账应用，包含记账、统计、预算管理等功能',
    path: '/ui/ledger',
    date: '2023-06-15',
    tags: ['记账', '家庭', '财务管理'],
    thumbnail: '/thumbnails/ledger.png'
  },
  {
    id: 'email',
    title: '邮件客户端',
    description: '现代化邮件客户端界面设计',
    path: '/ui/email',
    date: '2023-06-10',
    tags: ['邮件', '通讯', '办公'],
    thumbnail: '/thumbnails/email.png'
  }
];

export default function UIGallery() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // 获取所有标签
  const allTags = Array.from(new Set(uiPrototypes.flatMap(proto => proto.tags)));
  
  // 根据标签筛选原型
  const filteredPrototypes = activeTag 
    ? uiPrototypes.filter(proto => proto.tags.includes(activeTag))
    : uiPrototypes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">UI 原型展示</h2>
        <p className="text-lg text-gray-600">浏览所有使用 Cursor 创建的 UI 原型设计</p>
      </div>
      
      {/* 标签筛选 */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${activeTag === null 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          onClick={() => setActiveTag(null)}
        >
          全部
        </button>
        
        {allTags.map(tag => (
          <button
            key={tag}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeTag === tag 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* 原型卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrototypes.map(prototype => (
          <Link 
            href={prototype.path} 
            key={prototype.id}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              {/* 缩略图 */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {prototype.thumbnail ? (
                  <div 
                    className="w-full h-full bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${prototype.thumbnail})` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <span className="text-4xl">{prototype.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              {/* 内容 */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{prototype.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{prototype.description}</p>
                
                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {prototype.tags.map(tag => (
                    <span 
                      key={`${prototype.id}-${tag}`}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{prototype.date}</span>
                  <span className="text-blue-500 text-sm font-medium group-hover:underline">查看原型</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredPrototypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">没有找到匹配的UI原型</p>
        </div>
      )}
    </div>
  );
} 