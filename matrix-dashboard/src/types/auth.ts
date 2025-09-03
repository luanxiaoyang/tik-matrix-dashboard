/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 刷新令牌参数
 */
export interface RefreshTokenParams {
  refreshToken: string
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * 角色信息
 */
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  isActive: boolean
  sort: number
  createdAt: string
  updatedAt: string
}

/**
 * 权限信息
 */
export interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  description?: string
  parentId?: number
  resource?: string
  isActive: boolean
  sort: number
  createdAt: string
  updatedAt: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  status: UserStatus
  larkUserId?: string
  larkUserInfo?: any
  lastLoginAt?: string
  lastLoginIp?: string
  loginCount: number
  roles: Role[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: UserInfo
  accessToken: string
  refreshToken: string
  expiresIn: number
}