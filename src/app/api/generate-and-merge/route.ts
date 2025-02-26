import { NextResponse } from 'next/server';

// 使用响应流处理长时间运行的请求
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  
  // 创建一个响应流
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // 启动处理
  (async () => {
    try {
      const { sections } = await req.json();
      
      if (!sections || !Array.isArray(sections) || sections.length === 0) {
        await writer.write(encoder.encode(JSON.stringify({ 
          type: 'error',
          message: '请提供有效的音频部分'
        }) + '\n'));
        await writer.close();
        return;
      }
      
      // 向客户端发送初始状态
      await writer.write(encoder.encode(JSON.stringify({ 
        type: 'status',
        message: '准备开始生成音频...'
      }) + '\n'));
      
      // 生成每个部分的音频并发送进度
      const totalSections = sections.length;
      
      for (let i = 0; i < totalSections; i++) {
        // 仅用于日志，防止未使用警告
        console.log(`处理部分: ${JSON.stringify(sections[i]).substring(0, 50)}...`);
        
        // 发送进度更新
        await writer.write(encoder.encode(JSON.stringify({
          type: 'progress',
          current: i + 1,
          total: totalSections,
          message: `生成第 ${i + 1}/${totalSections} 部分`
        }) + '\n'));
        
        // 模拟音频生成延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 发送合并开始通知
      await writer.write(encoder.encode(JSON.stringify({
        type: 'status',
        message: '合并音频文件...'
      }) + '\n'));
      
      // 模拟合并延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 发送完成消息
      await writer.write(encoder.encode(JSON.stringify({
        type: 'complete',
        success: true,
        filename: `https://www.w3schools.com/html/horse.mp3?t=${Date.now()}` // 示例音频URL
      }) + '\n'));
      
    } catch (error) {
      console.error('音频生成错误:', error);
      
      let errorMessage = '处理请求时发生未知错误';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      await writer.write(encoder.encode(JSON.stringify({
        type: 'error',
        message: errorMessage
      }) + '\n'));
    } finally {
      await writer.close();
    }
  })();
  
  // 返回流式响应
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 