import request from '@/utils/request'
import type { LoginRequest, LoginResponse, User } from '@/types/api'

/**
 * 用户登录
 * @param data 登录信息
 * @returns 登录响应数据
 */
export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/auth/login', data)
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getProfile = () => {
  return request.get<User>('/auth/profile')
}

/**
 * 获取飞书授权URL
 * @returns 授权URL
 */
export const getLarkAuthUrl = () => {
  return request.get<{ authUrl: string }>('/auth/lark/url')
}

/**
 * 飞书扫码登录
 * @param code 授权码
 * @returns 登录响应数据
 */
export const larkLogin = (code: string) => {
  return request.post<LoginResponse>('/auth/lark/login', { code })
}

/**
 * 绑定飞书账号
 * @param code 授权码
 * @returns 绑定结果
 */
export const bindLark = (code: string) => {
  return request.post<{ success: boolean }>('/auth/lark/bind', { code })
}

/**
 * 解绑飞书账号
 * @returns 解绑结果
 */
export const unbindLark = () => {
  return request.post<{ success: boolean }>('/auth/lark/unbind')
}

/**
 * 刷新token
 * @param refreshToken 刷新令牌
 * @returns 新的token信息
 */
export const refreshToken = (refreshToken: string) => {
  return request.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
    refreshToken
  })
}

/**
 * 退出登录
 * @returns 退出结果
 */
export const logout = () => {
  return request.post<{ success: boolean }>('/auth/logout')
}