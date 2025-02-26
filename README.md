# AI ContentCraft

AI ContentCraft 是一个基于 Next.js 的 AI 内容创作工具，它提供多种内容生成功能，包括：

- 故事生成器：根据主题生成短篇故事
- 脚本转换：将故事转换为对话脚本格式
- 文本转语音：将文本转换为语音
- 多声音合成：使用不同的声音角色合成对话

## 技术栈

- **前端**：Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI 集成**：OpenAI/DeepSeek API, Replicate API
- **TTS服务**：火山引擎 TTS
- **样式**：Tailwind CSS

## 功能模块

### 1. 故事生成器

- 根据用户提供的主题生成短篇故事
- 自动将故事转换为脚本格式，区分旁白和对话
- 支持故事配图生成

### 2. 简单文本转语音 (TTS)

- 支持多种声音选择
- 支持情感/风格调整
- 转换任意文本为语音
- 保存历史记录

### 3. 多声音文本转语音

- 为不同角色分配不同的声音
- 支持旁白和对话混合
- 合并生成完整的音频

### 4. 播客生成器

- 自动生成播客脚本
- 为不同主持人分配声音
- 生成完整的音频文件

## 目录结构

```
src/
  ├── app/              # Next.js 应用目录
  │   ├── api/          # API 路由
  │   ├── utils/        # 工具函数
  │   ├── globals.css   # 全局样式
  │   ├── layout.tsx    # 应用布局
  │   └── page.tsx      # 主页
  ├── components/       # React 组件
  │   └── pages/        # 页面组件
  └── types/            # TypeScript 类型定义
```

## API 路由

- `/api/generate-story` - 故事生成
- `/api/generate-script` - 脚本生成 
- `/api/generate-image` - 图像生成
- `/api/generate` - 简单 TTS
- `/api/generate-and-merge` - 多声音合成
- `/api/voices` - 获取可用声音

## 开发设置

### 前提条件

- Node.js 18+
- pnpm

### 配置

创建 `.env.local` 文件并添加以下配置：

```env
# OpenAI 或 DeepSeek API 密钥 (可选的备选方案)
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1

# ARK API 密钥 (主要 LLM 接口)
ARK_API_KEY=your_ark_api_key_here

# Replicate API 密钥 (用于图像生成)
REPLICATE_API_TOKEN=your_replicate_token_here

# TTS 设置
TTS_PROVIDER=volcano  # 设置为'volcano'使用火山引擎TTS，留空使用模拟TTS
VOLCANO_APP_KEY=your_volcano_app_key_here
VOLCANO_ACCESS_KEY=your_volcano_access_key_here
VOLCANO_SECRET_KEY=your_volcano_secret_key_here
VOLCANO_INSTANCE_ID=Long-text-tts7475720465039659299  # 火山引擎TTS实例ID
```

### TTS 服务

项目支持以下 TTS 服务：

1. **火山引擎 TTS**（推荐）
   - 提供高质量的中文和英文语音合成
   - 支持多种音色，包括男声、女声等
   - 支持情感和风格调整
   - 需要在火山引擎控制台申请相关密钥

#### 火山引擎主要音色

| 音色ID | 名称 | 语言 | 特点 |
|-------|-----|------|-----|
| BV700_streaming | 灿灿 | 中文 | 通用女声，支持22种情感/风格 |
| BV701_streaming | 擎苍 | 中文 | 通用男声，支持10种情感 |
| BV705_streaming | 炀炀 | 中文 | 女声，支持多种情感 |
| BV406_streaming | 梓梓 | 中文 | 超自然女声，支持7种情感 |
| BV704_streaming | 方言灿灿 | 多方言 | 支持东北话、粤语、上海话等 |
| BV702_streaming | Stefan | 多语言 | 支持中文、英语、日语等 |

#### 情感/风格支持

灿灿音色（BV700_streaming）支持的情感/风格：
- happy（开心）
- angry（愤怒）
- sad（悲伤）
- fear（恐惧）
- hate（厌恶）
- surprise（惊讶）
- neutral（中性）
- story（故事）
- calm（平静）
- news（新闻）
- radio（广播）
- poetry（诗歌）
- call_center（客服）

2. **模拟 TTS**（开发测试用）
   - 返回模拟的音频 URL，用于开发测试

要使用火山引擎 TTS，需要：
1. 注册[火山引擎账号](https://www.volcengine.com/)
2. 开通 TTS 服务并创建应用
3. 在控制台获取 AppKey、AccessKey 和 SecretKey
4. 创建TTS实例，获取实例ID
5. 将获取的密钥和实例ID填入 `.env.local` 文件

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 部署

该项目可以部署到 Vercel、Netlify 或其他支持 Next.js 的托管服务。
