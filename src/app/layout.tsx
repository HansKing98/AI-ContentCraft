import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI ContentCraft - 内容创作工具",
  description: "使用AI生成故事、脚本、播客和音频，提升您的创意工作流程",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-blue-600">AI ContentCraft</h1>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-white border-t mt-auto py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} AI ContentCraft - 由Next.js驱动
          </div>
        </footer>
      </body>
    </html>
  );
}
