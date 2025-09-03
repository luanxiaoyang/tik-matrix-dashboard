import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface YayLoginResponse {
  code: number;
  msg?: string;
  message?: string;
  token?: string;
}

@Injectable()
export class YayAuthService {
  private readonly logger = new Logger(YayAuthService.name);
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private cachedToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.baseUrl = 'https://opadmin-api.yay.chat';
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';
  }

  /**
   * 获取YAY认证Token
   * @param forceRefresh 是否强制刷新
   * @returns Bearer Token
   */
  async getAuthToken(forceRefresh: boolean = false): Promise<string> {
    // 如果有缓存的token且未过期，直接返回
    if (!forceRefresh && this.cachedToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      this.logger.debug('使用缓存的YAY token');
      return this.cachedToken;
    }

    // 从环境变量获取YAY登录信息
    const username = this.configService.get('YAY_USERNAME');
    const password = this.configService.get('YAY_PASSWORD');

    if (!username || !password) {
      throw new HttpException(
        'YAY登录信息未配置，请设置 YAY_USERNAME 和 YAY_PASSWORD 环境变量',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`🔐 尝试登录YAY (第${attempt}/${maxRetries}次)`);
        
        const token = await this.loginYay(username, password);
        if (token) {
          // 缓存token，设置1小时过期时间
          this.cachedToken = token;
          this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1小时后过期
          
          this.logger.log('✅ YAY登录成功，获取到token');
          return token;
        }
      } catch (error) {
        this.logger.warn(`⏰ 登录尝试第${attempt}次失败: ${error.message}`);
        
        // 如果是认证错误，不再重试
        if (error.message.includes('用户名') || error.message.includes('密码')) {
          this.logger.error('🚫 用户名或密码错误，停止重试');
          break;
        }
      }

      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < maxRetries) {
        await this.sleep(2000 * attempt); // 递增等待时间
      }
    }

    throw new HttpException(
      '❌ 所有YAY登录尝试均失败',
      HttpStatus.UNAUTHORIZED
    );
  }

  /**
   * 执行YAY登录
   * @param username 用户名
   * @param password 密码
   * @returns Bearer Token
   */
  private async loginYay(username: string, password: string): Promise<string> {
    const loginUrl = `${this.baseUrl}/login`;
    
    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      const headers = {
        'User-Agent': this.userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://opadmin.yay.chat',
        'Referer': 'https://opadmin.yay.chat/',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'priority': 'u=1, i',
      };

      const loginData = {
        username,
        password,
      };

      this.logger.debug(`调用YAY登录API: ${loginUrl}`);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(loginData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpException(
          `YAY登录API调用失败: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      const result: YayLoginResponse = await response.json();
      
      this.logger.debug(`YAY登录响应: code=${result.code}`);

      if (result.code === 200) {
        const token = result.token;
        if (token) {
          return `Bearer ${token}`;
        } else {
          throw new HttpException('登录响应中没有token', HttpStatus.UNAUTHORIZED);
        }
      } else {
        const errorMsg = result.msg || result.message || '未知错误';
        throw new HttpException(`YAY登录失败: ${errorMsg}`, HttpStatus.UNAUTHORIZED);
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new HttpException('YAY登录请求超时', HttpStatus.REQUEST_TIMEOUT);
      }

      throw new HttpException(
        `YAY登录异常: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 清除缓存的token
   */
  clearTokenCache(): void {
    this.cachedToken = null;
    this.tokenExpiry = null;
    this.logger.log('🗑️  已清除YAY token缓存');
  }

  /**
   * 获取完整的请求头（包含认证信息）
   * @param additionalHeaders 额外的请求头
   * @param forceRefresh 是否强制刷新token
   * @returns 完整的请求头
   */
  async getAuthHeaders(additionalHeaders: Record<string, string> = {}, forceRefresh: boolean = false): Promise<Record<string, string>> {
    const authToken = await this.getAuthToken(forceRefresh);
    
    return {
      'User-Agent': this.userAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8',
      'Origin': 'https://opadmin.yay.chat',
      'Referer': 'https://opadmin.yay.chat/',
      'Authorization': authToken,
      'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'priority': 'u=1, i',
      ...additionalHeaders,
    };
  }

  /**
   * 检查token是否有效
   * @returns 是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      if (!this.cachedToken) {
        return false;
      }

      // 调用一个简单的API来验证token有效性
      const headers = await this.getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(`${this.baseUrl}/user/info`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return response.ok;
    } catch (error) {
      this.logger.warn(`Token验证失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 延时函数
   * @param ms 毫秒
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
