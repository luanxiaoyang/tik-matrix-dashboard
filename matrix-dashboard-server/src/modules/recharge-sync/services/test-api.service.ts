import { Injectable, Logger } from '@nestjs/common';
import { YayAuthService } from './yay-auth.service';

@Injectable()
export class TestApiService {
  private readonly logger = new Logger(TestApiService.name);
  private readonly baseUrl = 'https://opadmin-api.yay.chat';

  constructor(private yayAuthService: YayAuthService) {}

  /**
   * 测试YAY API连接和认证
   * @returns 测试结果
   */
  async testConnection(): Promise<any> {
    try {
      this.logger.log('🔍 开始测试YAY API连接...');
      
      // 获取认证头
      const headers = await this.yayAuthService.getAuthHeaders();
      
      // 测试一个简单的API接口
      const testUrl = `${this.baseUrl}/article/gift/list`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

      const response = await fetch(testUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: null,
          name: null,
          tabType: null,
          pageNum: 1,
          pageSize: 10
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      this.logger.log(`测试API响应: status=${response.status}, code=${result.code}`);

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: result,
        message: response.ok ? '连接测试成功' : '连接测试失败'
      };

    } catch (error) {
      this.logger.error(`测试API连接失败: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        message: '连接测试异常'
      };
    }
  }

  /**
   * 测试获取用户充值功能数据接口
   * @param userIds 测试用户ID
   * @returns 测试结果
   */
  async testGetUserRechargeFeature(userIds: string = '123456'): Promise<any> {
    try {
      this.logger.log(`🔍 测试获取用户充值功能数据接口，userIds: ${userIds}`);
      
      // 获取认证头
      const headers = await this.yayAuthService.getAuthHeaders();
      
      const url = `${this.baseUrl}/user/means/get-user-recharge-feature`;
      const params = new URLSearchParams({ userIds });
      const fullUrl = `${url}?${params.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      this.logger.log(`充值功能API响应: status=${response.status}, code=${result.code}`);

      return {
        success: response.ok && result.code === 200,
        status: response.status,
        statusText: response.statusText,
        data: result,
        message: response.ok && result.code === 200 ? '充值功能数据获取成功' : '充值功能数据获取失败'
      };

    } catch (error) {
      this.logger.error(`测试充值功能API失败: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        message: '充值功能API测试异常'
      };
    }
  }
}
