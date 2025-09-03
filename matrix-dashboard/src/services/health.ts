import { request } from '@/utils/request'

/**
 * 健康检查响应接口
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers?: number
  }
  environment: string
  version?: string
  error?: string
  database?: {
    status: 'connected' | 'disconnected'
    responseTime?: number
  }
  redis?: {
    status: 'connected' | 'disconnected'
    responseTime?: number
  }
}

/**
 * 健康检查服务
 * @description 系统健康状态监控相关API
 */
export class HealthService {
  /**
   * 获取系统健康状态
   * @description 检查服务状态和数据库连接
   * @returns Promise<HealthCheckResponse> 健康检查结果
   */
  static async getHealthCheck(): Promise<{ data: HealthCheckResponse }> {
    return request.get<HealthCheckResponse>('/api/health')
  }
}

/**
 * 健康检查API - 兼容性导出
 * @deprecated 请使用 HealthService.getHealthCheck() 替代
 */
export const getHealthCheck = HealthService.getHealthCheck