import { request } from '@/utils/request'
import type { LoginParams, LoginResponse, UserInfo } from '@/types/auth'
import type { ApiResponse } from '@/types/business'

/**
 * 用户登录
 * @param params 登录参数
 */
export const login = (params: LoginParams) => {
  return request.post<ApiResponse<LoginResponse>>('/auth/login', params)
}

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return request.get<ApiResponse<UserInfo>>('/auth/me')
}

/**
 * 用户登出
 */
export const logout = () => {
  return request.post<ApiResponse<null>>('/auth/logout')
}