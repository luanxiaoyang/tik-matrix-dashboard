import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YayAuthService } from './yay-auth.service';
import { 
  ExternalApiResponse, 
  UserRechargeFeatureResponse 
} from '../dto/recharge-sync.dto';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private yayAuthService: YayAuthService,
  ) {
    this.baseUrl = 'https://opadmin-api.yay.chat';
  }

  /**
   * 调用外部API获取用户充值功能数据
   * @param userIds 用户ID列表，逗号分隔
   * @returns 用户充值功能数据
   */
  async getUserRechargeFeature(userIds: string): Promise<UserRechargeFeatureResponse> {
    const url = `${this.baseUrl}/user/means/get-user-recharge-feature`;
    
    try {
      this.logger.log(`调用外部API: ${url}, userIds: ${userIds}`);
      
      const params = new URLSearchParams({ userIds });
      const fullUrl = `${url}?${params.toString()}`;

      // 获取带认证的请求头
      const headers = await this.yayAuthService.getAuthHeaders();

      // 创建带超时的 AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 如果是401未授权，尝试刷新token重试
      if (response.status === 401) {
        this.logger.warn('收到401响应，尝试刷新YAY token后重试');
        this.yayAuthService.clearTokenCache();
        
        // 重新获取认证头并重试
        const newHeaders = await this.yayAuthService.getAuthHeaders({}, true);
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 30000);

        try {
          const retryResponse = await fetch(fullUrl, {
            method: 'GET',
            headers: newHeaders,
            signal: retryController.signal,
          });

          clearTimeout(retryTimeoutId);

          if (!retryResponse.ok) {
            throw new HttpException(
              `外部API重试调用失败: ${retryResponse.status} ${retryResponse.statusText}`,
              HttpStatus.BAD_GATEWAY
            );
          }

          // 使用重试的响应继续处理
          const retryResult: ExternalApiResponse<UserRechargeFeatureResponse> = await retryResponse.json();
          
          this.logger.log(`外部API重试响应: code=${retryResult.code}, message=${retryResult.message}`);

          if (retryResult.code !== 200) {
            throw new HttpException(
              `外部API重试返回错误: ${retryResult.message}`,
              HttpStatus.BAD_GATEWAY
            );
          }

          if (!retryResult.data || !retryResult.data.items) {
            this.logger.warn('外部API重试返回数据为空');
            return { items: [] };
          }

          this.logger.log(`重试成功获取 ${retryResult.data.items.length} 条用户充值功能数据`);
          return retryResult.data;

        } catch (retryError) {
          clearTimeout(retryTimeoutId);
          throw new HttpException(
            `外部API重试失败: ${retryError.message}`,
            HttpStatus.BAD_GATEWAY
          );
        }
      }

      if (!response.ok) {
        throw new HttpException(
          `外部API调用失败: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      const result: ExternalApiResponse<UserRechargeFeatureResponse> = await response.json();
      
      this.logger.log(`外部API响应: code=${result.code}, message=${result.message}`);

      if (result.code !== 200) {
        throw new HttpException(
          `外部API返回错误: ${result.message}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      if (!result.data || !result.data.items) {
        this.logger.warn('外部API返回数据为空');
        return { items: [] };
      }

      this.logger.log(`成功获取 ${result.data.items.length} 条用户充值功能数据`);
      return result.data;

    } catch (error) {
      this.logger.error(`调用外部API失败: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }

      // 处理网络错误、超时等
      if (error.name === 'AbortError') {
        throw new HttpException('外部API调用超时', HttpStatus.REQUEST_TIMEOUT);
      }

      throw new HttpException(
        `外部API调用异常: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * 批量调用外部API（处理大量用户ID）
   * @param userIds 用户ID数组
   * @param batchSize 批次大小，默认100
   * @returns 合并后的用户充值功能数据
   */
  async batchGetUserRechargeFeature(
    userIds: number[],
    batchSize: number = 100
  ): Promise<UserRechargeFeatureResponse> {
    if (userIds.length === 0) {
      return { items: [] };
    }

    this.logger.log(`批量获取用户充值功能数据，总数: ${userIds.length}, 批次大小: ${batchSize}`);

    const allItems = [];
    const batches = [];

    // 分批处理
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    this.logger.log(`共分为 ${batches.length} 个批次处理`);

    // 并发处理所有批次
    const promises = batches.map(async (batch, index) => {
      try {
        this.logger.log(`处理第 ${index + 1} 批次，用户数: ${batch.length}`);
        const userIdsStr = batch.join(',');
        const result = await this.getUserRechargeFeature(userIdsStr);
        return result.items;
      } catch (error) {
        this.logger.error(`第 ${index + 1} 批次处理失败: ${error.message}`);
        return []; // 返回空数组，不影响其他批次
      }
    });

    const results = await Promise.all(promises);
    
    // 合并所有结果
    for (const items of results) {
      allItems.push(...items);
    }

    this.logger.log(`批量处理完成，共获取 ${allItems.length} 条数据`);

    return { items: allItems };
  }
}
