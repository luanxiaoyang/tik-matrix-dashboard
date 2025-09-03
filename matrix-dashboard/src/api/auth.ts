import { request } from '@/utils/request'
import type { LoginParams, LoginResponse, UserInfo, RefreshTokenParams, RefreshTokenResponse } from '@/types/auth'
import type { ApiResponse } from '@/types/business'

/**
 * 用户登录
 * @param params 登录参数
 */
export const login = (params: LoginParams) => {
  return request.post<ApiResponse<LoginResponse>>('/api/auth/login', params)
}

/**
 * 刷新访问令牌
 * @param params 刷新令牌参数
 */
export const refreshToken = (params: RefreshTokenParams) => {
  return request.post<ApiResponse<RefreshTokenResponse>>('/api/auth/refresh', params)
}

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return request.get<ApiResponse<UserInfo>>('/api/auth/profile')
}

/**
 * 用户登出
 * @param params 刷新令牌参数
 */
export const logout = (params: RefreshTokenParams) => {
  return request.post<ApiResponse<null>>('/api/auth/logout', params)
}

/**
 * 获取Lark登录授权URL
 */
export const getLarkAuthUrl = () => {
  return request.get<ApiResponse<{ authUrl: string }>>('/api/auth/lark/url')
}

/**
 * Lark扫码登录
 * @param params Lark认证参数
 */
export const larkLogin = (params: { code: string }) => {
  return request.post<ApiResponse<LoginResponse>>('/api/auth/lark/login', params)
}

/**
 * 绑定Lark账号
 * @param params Lark认证参数
 */
export const bindLark = (params: { code: string }) => {
  return request.post<ApiResponse<null>>('/api/auth/lark/bind', params)
}

/**
 * 解绑Lark账号
 */
export const unbindLark = () => {
  return request.post<ApiResponse<null>>('/api/auth/lark/unbind')
}