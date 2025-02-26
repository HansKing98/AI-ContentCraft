/**
 * 火山引擎 TTS 服务工具函数
 * 文档参考: https://www.volcengine.com/docs/6561/1257584
 */

interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
  volume?: number;
  format?: 'mp3' | 'wav';
  sampleRate?: 16000 | 8000 | 24000;
  emotion?: string;
}

interface TTSRequestBody {
  app: {
    appid: string;
    token: string;
    cluster: string;
  };
  user: {
    uid: string;
  };
  audio: {
    voice_type: string;
    encoding: string;
    rate: number;
    speed_ratio: number;
    volume_ratio: number;
    emotion?: string;
  };
  request: {
    reqid: string;
    text: string;
    operation: string;
  };
}

// 定义火山引擎语音的接口
interface VolcanoVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
  info?: string;
  purchased?: boolean;
  instanceId?: string;
}

export class VolcanoTTS {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly apiUrl: string = 'https://openspeech.bytedance.com/api/v1/tts';
  private readonly appKey: string;
  private readonly instanceId: string;

  constructor() {
    this.accessKey = process.env.VOLCANO_ACCESS_KEY || '';
    this.secretKey = process.env.VOLCANO_SECRET_KEY || '';
    this.appKey = process.env.VOLCANO_APP_KEY || '';
    this.instanceId = process.env.VOLCANO_INSTANCE_ID || 'Long-text-tts7475720465039659299';
    
    if (!this.accessKey || !this.secretKey || !this.appKey) {
      console.warn('火山引擎 TTS 密钥未配置，请在 .env.local 中设置 VOLCANO_ACCESS_KEY, VOLCANO_SECRET_KEY 和 VOLCANO_APP_KEY');
    }
  }

  /**
   * 调用火山引擎 TTS 接口
   */
  async synthesize(options: TTSOptions): Promise<Buffer | null> {
    if (!this.accessKey || !this.secretKey || !this.appKey) {
      throw new Error('火山引擎 TTS 密钥未配置');
    }

    try {
      // 标准化语音ID - 确保使用正确的格式
      let voiceId = options.voice || 'BV001_streaming';
      
      // 如果是使用streaming类型语音但未包含_streaming后缀，添加后缀
      if (!voiceId.includes('_streaming') && !voiceId.includes('_V2_streaming')) {
        voiceId = `${voiceId}_streaming`;
      }
      
      // 检查音色是否已购买
      const voiceInfo = volcanoVoices.find(v => v.id === voiceId);
      const isPurchased = voiceInfo?.purchased === true;
      
      // 如果音色未购买，使用默认免费音色
      if (voiceInfo && !isPurchased) {
        console.warn(`音色 ${voiceId} 未购买，将使用默认免费音色 BV001_streaming`);
        voiceId = 'BV001_streaming';
      }
      
      // 获取实例ID（如果有）
      const instanceId = voiceInfo?.instanceId || this.instanceId;
      
      console.log(`使用火山引擎TTS，音色ID: ${voiceId}，实例ID: ${instanceId}`);

      // 生成唯一请求ID
      const reqId = `tts-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 构建请求体，按照官方文档格式
      const requestBody: TTSRequestBody = {
        app: {
          appid: this.appKey,
          token: this.secretKey,
          cluster: "volcano_tts"
        },
        user: {
          uid: "2101497846"
        },
        audio: {
          voice_type: voiceId,
          encoding: options.format || 'mp3',
          rate: options.sampleRate || 24000,
          speed_ratio: options.speed || 1.0,
          volume_ratio: options.volume || 1.0
        },
        request: {
          reqid: reqId,
          text: options.text,
          operation: "query"
        }
      };
      
      // 如果指定了情感/风格，添加到请求中
      if (options.emotion) {
        requestBody.audio.emotion = options.emotion;
      }

      // 更新鉴权头格式，根据最新文档使用 Bearer; {token} 格式
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer; ${this.accessKey}`,
        'Accept': 'audio/mpeg, application/json'
      };

      console.log('火山引擎TTS请求信息:', {
        url: this.apiUrl,
        headers: {
          ...headers,
          'Authorization': 'Bearer; [HIDDEN]' // 日志中隐藏敏感信息
        },
        body: requestBody
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      // 记录响应状态和头信息
      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };
      console.log('火山引擎TTS响应状态:', responseInfo);

      if (!response.ok) {
        let errorText = '';
        let errorDetail = {};
        let suggestedReasons = '';
        try {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('access denied')) {
            suggestedReasons = `这个音色需要授权。请在火山引擎控制台购买该音色，或使用免费音色BV001_streaming(通用女声)或BV002_streaming(通用男声)`;
            console.log('尝试使用免费音色重新生成...');
          }
          errorText = JSON.stringify(errorData);
          errorDetail = errorData;
          console.error('火山引擎TTS错误响应:', errorData);
        } catch {
          errorText = await response.text();
          console.error('火山引擎TTS错误响应(文本):', errorText);
        }
        
        // 根据状态码提供更具体的错误信息
        let errorMessage = '火山引擎 TTS 错误';
        switch (response.status) {
          case 400:
            errorMessage = '请求参数错误，请检查文本内容和音色设置';
            break;
          case 401:
            errorMessage = '认证失败，请检查密钥配置';
            break;
          case 403:
            errorMessage = '无权限访问，请检查服务开通状态';
            break;
          case 429:
            errorMessage = '请求过于频繁，请稍后重试';
            break;
          case 500:
            errorMessage = '服务器内部错误，请稍后重试';
            break;
          default:
            errorMessage = `服务调用失败 (${response.status})`;
        }
        
        const fullError = {
          message: errorMessage,
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorDetail,
          requestInfo: {
            url: this.apiUrl,
            headers: {
              ...headers,
              'Authorization': 'Bearer; [HIDDEN]' // 隐藏敏感信息
            },
            body: requestBody
          },
          responseInfo
        };
        console.error('完整错误信息:', fullError);
        throw new Error(`${errorMessage}: ${errorText}

- 建议：${suggestedReasons}`);
      }

      // 获取响应数据
      const responseData = await response.json();
      console.log('火山引擎TTS响应数据:', {
        code: responseData.code,
        message: responseData.message,
        sequence: responseData.sequence,
        addition: responseData.addition
      });

      if (responseData.code !== 3000) {
        throw new Error(`火山引擎TTS错误: ${responseData.message}`);
      }

      // 解析Base64编码的音频数据
      if (responseData.data) {
        const audioBuffer = Buffer.from(responseData.data, 'base64');
        const dataSize = audioBuffer.byteLength;
        console.log(`火山引擎TTS生成成功，数据大小: ${dataSize}字节`);
        
        // 检查音频数据大小是否合理
        if (dataSize < 100) { // 如果音频数据小于100字节，可能是无效数据
          throw new Error('生成的音频数据异常，数据量过小');
        }
        
        return audioBuffer;
      } else {
        throw new Error('火山引擎TTS响应中没有音频数据');
      }
    } catch (error) {
      console.error('火山引擎 TTS 服务错误:', error);
      throw error; // 向上抛出错误，而不是返回null
    }
  }
}

// 单例模式
let volcanoTTSInstance: VolcanoTTS | null = null;

export function getVolcanoTTS(): VolcanoTTS {
  if (!volcanoTTSInstance) {
    volcanoTTSInstance = new VolcanoTTS();
  }
  return volcanoTTSInstance;
}

// 火山引擎语音列表 - 按照最新文档更新
// 参考: https://www.volcengine.com/docs/6561/97465
export const volcanoVoices: VolcanoVoice[] = [
  // 已购买的音色（按照用户提供的列表）
  { id: 'BV001_streaming', name: '通用女声', language: 'zh-CN', gender: '女性', info: '支持12种情感', purchased: true },
  { id: 'BV002_streaming', name: '通用男声', language: 'zh-CN', gender: '男性', purchased: true },
  { id: 'BV701_streaming', name: '擎苍', language: 'zh-CN', gender: '男性', info: '支持10种情感', purchased: true, instanceId: 'BV701_tUVXt9UOqebn2qO-' },
  { id: 'BV033_streaming', name: '温柔小哥', language: 'zh-CN', gender: '男性', info: '教育场景', purchased: true, instanceId: 'BV033_0L8DcPZ2hrqt2vZe' },
  { id: 'BV504_streaming', name: '活力男声-Jackson', language: 'en-US', gender: '男性', info: '美式发音', purchased: true, instanceId: 'BV504_lBSUS7J_DJgJ09h2' },
  { id: 'BV119_streaming', name: '通用赘婿', language: 'zh-CN', gender: '男性', info: '支持8种情感', purchased: true, instanceId: 'BV119_f2gZKIxQT3mQtfwg' },
  { id: 'BV051_streaming', name: '奶气萌娃', language: 'zh-CN', gender: '女性', info: '特色音色', purchased: true, instanceId: 'BV051_N52TE6OD7QjzA5ba' },
  { id: 'BV007_streaming', name: '亲切女声', language: 'zh-CN', gender: '女性', info: '客服场景', purchased: true, instanceId: 'BV007_o-9IWMFQDrNWQ448' },
  { id: 'BV115_streaming', name: '古风少御', language: 'zh-CN', gender: '男性', info: '支持8种情感', purchased: true, instanceId: 'BV115_knayBYO-6UkMaXma' },
  { id: 'BV034_streaming', name: '知性姐姐-双语', language: 'zh-CN', gender: '女性', info: '教育场景', purchased: true, instanceId: 'BV034_0r-XD4fCLckn_gtX' },
  { id: 'BV102_streaming', name: '儒雅青年', language: 'zh-CN', gender: '男性', info: '有声阅读', purchased: true, instanceId: 'BV102_Vi_uYVUfifxvhJBC' },
  { id: 'BV005_streaming', name: '活泼女声', language: 'zh-CN', gender: '女性', info: '视频配音', purchased: true, instanceId: 'BV005_T_Fe6sWT8pPOeoMg' },
  { id: 'BV213_streaming', name: '广西表哥', language: 'zh-CN', gender: '男性', info: '广西普通话', purchased: true, instanceId: 'BV213_8k_Y27z5OvH7g0W7' },
  { id: 'BV503_streaming', name: '活力女声-Ariana', language: 'en-US', gender: '女性', info: '美式发音', purchased: true, instanceId: 'BV503_acbGgLKmFokfo5Sg' },
  { id: 'BV522_streaming', name: '气质女生', language: 'ja-JP', gender: '女性', info: '日语', purchased: true, instanceId: 'BV522_h0Ssvuk_6xpI_hjM' },
  { id: 'BV700_streaming', name: '灿灿', language: 'zh-CN', gender: '女性', info: '支持22种情感/风格', purchased: true, instanceId: 'BV700_lnjLu60YPrNHtBzp' },
  { id: 'BV056_streaming', name: '阳光男声', language: 'zh-CN', gender: '男性', info: '视频配音', purchased: true, instanceId: 'BV056_1xqKj_UoGWuTYOH0' },
  { id: 'BV524_streaming', name: '日语男声', language: 'ja-JP', gender: '男性', info: '日语', purchased: true, instanceId: 'BV524_yw5k3g8PGtV0O1IH' },
  { id: 'BV113_streaming', name: '甜宠少御', language: 'zh-CN', gender: '男性', info: '有声阅读', purchased: true, instanceId: 'BV113_fCkVj-1UMkMLSgxu' },
  { id: 'BV705_streaming', name: '炀炀', language: 'zh-CN', gender: '女性', info: '支持多种情感', purchased: true, instanceId: 'BV705_G0aPYotNGcSmWkTE' },
  { id: 'BV019_streaming', name: '重庆小伙', language: 'zh-CN', gender: '男性', info: '重庆话', purchased: true, instanceId: 'BV019_iz3dsZd29aq7F0Hh' },
  { id: 'BV021_streaming', name: '东北老铁', language: 'zh-CN', gender: '男性', info: '东北话', purchased: true, instanceId: 'BV021_Nhj3imqq2P9TxfUB' },
  
  // 未购买的音色（需要开通）
  { id: 'BV700_V2_streaming', name: '灿灿 2.0', language: 'zh-CN', gender: '女性', info: '支持22种情感/风格', purchased: false },
  { id: 'BV701_V2_streaming', name: '擎苍 2.0', language: 'zh-CN', gender: '男性', info: '支持10种情感', purchased: false },
  { id: 'BV001_V2_streaming', name: '通用女声 2.0', language: 'zh-CN', gender: '女性', purchased: false },
  { id: 'BV406_V2_streaming', name: '梓梓 2.0', language: 'zh-CN', gender: '女性', purchased: false },
  { id: 'BV406_streaming', name: '梓梓', language: 'zh-CN', gender: '女性', info: '支持7种情感', purchased: false },
  { id: 'BV407_V2_streaming', name: '燃燃 2.0', language: 'zh-CN', gender: '男性', purchased: false },
  { id: 'BV407_streaming', name: '燃燃', language: 'zh-CN', gender: '男性', purchased: false },
  { id: 'BV123_streaming', name: '阳光青年', language: 'zh-CN', gender: '男性', info: '支持7种情感', purchased: false },
  { id: 'BV120_streaming', name: '反卷青年', language: 'zh-CN', gender: '男性', info: '支持7种情感', purchased: false },
  { id: 'BV107_streaming', name: '霸气青叔', language: 'zh-CN', gender: '男性', info: '支持8种情感', purchased: false },
  { id: 'BV100_streaming', name: '质朴青年', language: 'zh-CN', gender: '男性', info: '支持8种情感', purchased: false },
  { id: 'BV104_streaming', name: '温柔淑女', language: 'zh-CN', gender: '女性', info: '支持8种情感', purchased: false },
  { id: 'BV004_streaming', name: '开朗青年', language: 'zh-CN', gender: '男性', info: '支持8种情感', purchased: false },
  { id: 'BV704_streaming', name: '方言灿灿', language: '多方言', gender: '女性', info: '支持东北话、粤语、上海话等', purchased: false },
  { id: 'BV702_streaming', name: 'Stefan', language: '多语言', gender: '男性', info: '支持中文、英语、日语等', purchased: false },
  { id: 'BV421_streaming', name: '天才少女', language: '多语言', gender: '女性', info: '支持中文、英语、日语等多语言', purchased: false },
]; 