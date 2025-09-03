import { request } from '@/utils/request'
import type { 
  Account, 
  CreateAccountParams, 
  PaginationParams, 
  PaginationResponse,
  ApiResponse 
} from '@/types/business'

/**
 * 创建账号
 * @param params 创建账号参数
 */
export const createAccount = (params: CreateAccountParams) => {
  return request.post<ApiResponse<Account>>('/accounts', params)
}

/**
 * 获取账号列表
 * @param params 查询参数
 */
export const getAccountList = (params?: PaginationParams & {
  ownerId?: string
  createdBy?: string
  createdAtStart?: string
  createdAtEnd?: string
}) => {
  return request.get<ApiResponse<PaginationResponse<Account>>>('/accounts', params)
}

/**
 * 获取账号详情
 * @param id 账号ID
 */
export const getAccountDetail = (id: string) => {
  return request.get<ApiResponse<Account>>(`/accounts/${id}`)
}

/**
 * 更新账号归属
 * @param id 账号ID
 * @param ownerId 新的归属用户ID
 */
export const updateAccountOwner = (id: string, ownerId: string) => {
  return request.patch<ApiResponse<Account>>(`/accounts/${id}/owner`, { ownerId })
}

// 别名导出，保持向后兼容
export const getAccounts = getAccountList