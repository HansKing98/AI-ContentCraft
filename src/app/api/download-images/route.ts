import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: Request) {
  const { images, theme } = await req.json();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // 确保 output 目录存在
    const outputDir = path.join(process.cwd(), 'public/output');
    await fs.mkdir(outputDir, { recursive: true });
    
    // 创建时间戳目录
    const downloadDir = path.join(outputDir, timestamp);
    await fs.mkdir(downloadDir, { recursive: true });
    
    // 下载所有图片
    for (let i = 0; i < images.length; i++) {
      const { url, prompt } = images[i];
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const filename = `image-${String(i + 1).padStart(3, '0')}.webp`;
        const filePath = path.join(downloadDir, filename);
        
        await fs.writeFile(filePath, buffer);
        
        // 保存提示词到单独的文件
        await fs.appendFile(
          path.join(downloadDir, 'prompts.txt'),
          `Image ${i + 1}:\n${prompt}\nURL: ${url}\n\n`
        );
      } catch (error: any) {
        await fs.appendFile(
          path.join(downloadDir, 'errors.txt'),
          `Failed to download image ${i + 1}:\nURL: ${url}\nError: ${error.message}\n\n`
        );
      }
    }
    
    // 创建 HTML 预览文件
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${theme || 'Story'} - Image Gallery</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .theme { margin-bottom: 20px; color: #666; }
        .image-container { margin-bottom: 30px; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        .prompt { margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Generated Images</h1>
    <div class="theme">Theme: ${theme || 'Story'}</div>
    ${images.map((img, i) => `
        <div class="image-container">
            <img src="image-${String(i + 1).padStart(3, '0')}.webp" alt="Generated image ${i + 1}">
            <div class="prompt">
                <strong>Prompt ${i + 1}:</strong><br>
                ${img.prompt}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
    
    await fs.writeFile(path.join(downloadDir, 'gallery.html'), htmlContent);
    
    return NextResponse.json({
      success: true,
      directory: path.relative(process.cwd(), downloadDir),
      totalImages: images.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 