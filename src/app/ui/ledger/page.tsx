"use client";

import { useEffect } from 'react';

export default function LedgerPage() {
  
  useEffect(() => {
    // 完全刷新页面的重定向
    window.location.replace('/myui/ledger.html');
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">正在加载记账应用界面...</p>
      </div>
    </div>
  );
} 