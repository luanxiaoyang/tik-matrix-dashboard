import { request } from '@/utils/request'
import type { 
  Conversion, 
  CreateConversionParams, 
  PaginationParams, 
  PaginationResponse,
  ApiResponse 
} from '@/types/business'

/**
 * 提交用户
 * @param params 用户参数
 */
export const createConversion = (params: CreateConversionParams) => {
  return request.post<ApiResponse<Conversion>>('/conversions', params)
}

/**
 * 获取转化列表
 * @param params 查询参数
 */
export const getConversionList = (params?: PaginationParams & {
  registerUserId?: number
  phoneNo?: string
  accountId?: string
  createdBy?: string
}) => {
  return request.get<ApiResponse<PaginationResponse<Conversion>>>('/conversions', params)
}

/**
 * 获取转化详情
 * @param id 转化ID
 */
export const getConversionDetail = (id: string) => {
  return request.get<ApiResponse<Conversion>>(`/conversions/${id}`)
}

// 别名导出，保持向后兼容
export const submitConversion = createConversion