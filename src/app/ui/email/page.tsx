"use client";

import { useEffect } from 'react';

export default function EmailPage() {
  useEffect(() => {
    // 重定向到静态HTML文件
    window.location.replace('/myui/email.html');

  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">正在加载邮件客户端界面...</p>
      </div>
    </div>
  );
} 