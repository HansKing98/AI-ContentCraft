import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "UI原型展示 - AI ContentCraft",
  description: "浏览使用Cursor创建的UI原型设计",
};

export default function UILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">UI原型展示</h1>
          <Link 
            href="/" 
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
          >
            <span className="mr-2">←</span>
            <span>返回主页</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 