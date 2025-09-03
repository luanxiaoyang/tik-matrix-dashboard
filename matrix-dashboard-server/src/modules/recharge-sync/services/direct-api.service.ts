import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { 
  ExternalApiResponse, 
  UserRechargeFeatureResponse,
  UserRechargeFeatureItem
} from '../dto/recharge-sync.dto';

@Injectable()
export class DirectApiService {
  private readonly logger = new Logger(DirectApiService.name);
  private readonly baseUrl = 'https://opadmin-api.yay.chat';
  private readonly userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

  /**
   * 使用指定token直接调用YAY API
   * @param userIds 用户ID列表，逗号分隔
   * @param token YAY Bearer token
   * @returns 用户充值功能数据
   */
  async getUserRechargeFeatureWithToken(userIds: string, token: string): Promise<UserRechargeFeatureResponse> {
    const url = `${this.baseUrl}/user/means/get-user-recharge-feature`;
    
    try {
      this.logger.log(`直接调用YAY API: ${url}, userIds: ${userIds}`);
      
      const params = new URLSearchParams({ userIds });
      const fullUrl = `${url}?${params.toString()}`;

      const headers = {
        'User-Agent': this.userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://opadmin.yay.chat',
        'Referer': 'https://opadmin.yay.chat/',
        'Authorization': `Bearer ${token}`,
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'priority': 'u=1, i',
      };

      // 创建带超时的 AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpException(
          `YAY API调用失败: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      const result: ExternalApiResponse<UserRechargeFeatureResponse> = await response.json();
      
      this.logger.log(`YAY API响应: code=${result.code}, msg=${result.msg || result.message}`);

      if (result.code !== 200) {
        throw new HttpException(
          `YAY API返回错误: ${result.msg || result.message}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      if (!result.data || !result.data.items) {
        this.logger.warn('YAY API返回数据为空');
        return { items: [] };
      }

      // 映射字段名称
      const mappedItems: UserRechargeFeatureItem[] = result.data.items.map(item => ({
        uid: item.uid,
        totalRecharge: item.totalRecharge,
        day1Coin: item.day1Coin,
        day2Coin: item.day2Coin,
        day7Coin: item.day7Coin,
        day30Coin: item.day30Coin,
        valuableUser: (item as any).valuableUser || (item as any).isValuableUser,
        hundredUser: (item as any).hundredUser || (item as any).isHundredUser,
        registerTime: item.registerTime,
      }));

      this.logger.log(`成功获取 ${mappedItems.length} 条用户充值功能数据`);
      return { items: mappedItems };

    } catch (error) {
      this.logger.error(`直接调用YAY API失败: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }

      // 处理网络错误、超时等
      if (error.name === 'AbortError') {
        throw new HttpException('YAY API调用超时', HttpStatus.REQUEST_TIMEOUT);
      }

      throw new HttpException(
        `YAY API调用异常: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}
