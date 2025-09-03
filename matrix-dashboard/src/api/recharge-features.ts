import { request } from '@/utils/request'
import type { 
  RechargeInfo,
  QueryRechargeInfoParams,
  QueryRechargeInfoResponse,
  PaginationResponse,
  ApiResponse 
} from '@/types/business'

/**
 * 查询充值信息
 * @param params 查询参数
 */
export const getRechargeInfos = (params: QueryRechargeInfoParams) => {
  return request.get<ApiResponse<QueryRechargeInfoResponse>>('/recharge-infos', {
    params
  })
}

/**
 * 根据账号ID查询充值信息
 * @param accountId 账号ID
 */
export const getRechargeInfoByAccountId = (accountId: string) => {
  return request.get<ApiResponse<RechargeInfo>>(`/recharge-infos/account/${accountId}`)
}