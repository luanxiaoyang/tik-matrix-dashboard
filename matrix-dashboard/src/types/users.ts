/**
 * 用户管理相关类型定义
 */

import type { UserStatus } from './auth'

/**
 * 用户创建参数
 */
export interface CreateUserParams {
  username: string
  email: string
  password: string
  nickname?: string
  avatar?: string
  status?: UserStatus
}

/**
 * 用户更新参数
 */
export interface UpdateUserParams {
  username?: string
  email?: string
  nickname?: string
  avatar?: string
  status?: UserStatus
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

/**
 * 重置密码参数
 */
export interface ResetPasswordParams {
  newPassword: string
}

/**
 * 分配角色参数
 */
export interface AssignRolesParams {
  roleIds: number[]
}

/**
 * 用户查询参数
 */
export interface UserQueryParams {
  username?: string
  email?: string
  status?: UserStatus
  roleId?: number
}