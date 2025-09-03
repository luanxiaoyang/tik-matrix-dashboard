/**
 * 用户角色枚举
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CONVERSION_ADMIN = 'CONVERSION_ADMIN', 
  CONVERTER = 'CONVERTER',
  OPERATOR = 'OPERATOR'
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string
  username: string
  role: UserRole
  teamId?: string
  createdAt?: string
  avatar?: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}