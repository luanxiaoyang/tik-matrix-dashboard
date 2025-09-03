import { request } from '@/utils/request'
import type { 
  RechargeFeature,
  SyncRechargeFeatureParams,
  SyncRechargeFeatureResponse,
  ApiResponse 
} from '@/types/business'

/**
 * 触发批量同步充值特征
 * @param params 同步参数
 */
export const syncRechargeFeatures = (params: SyncRechargeFeatureParams) => {
  return request.post<ApiResponse<SyncRechargeFeatureResponse>>('/sync/recharge-features', params)
}

/**
 * 批量查询用户充值特征
 * @param userIds 用户ID列表
 */
export const getRechargeFeatures = (userIds: number[]) => {
  return request.get<ApiResponse<RechargeFeature[]>>('/recharge-features', {
    userIds: userIds.join(',')
  })
}