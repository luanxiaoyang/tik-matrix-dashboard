import { request } from '@/utils/request'
import type { UserInfo, UserStatus } from '@/types/auth'
import type { ApiResponse, PaginationQueryParams, PaginationApiResponse } from '@/types/business'
import type {
  CreateUserParams,
  UpdateUserParams,
  ChangePasswordParams,
  ResetPasswordParams,
  AssignRolesParams,
  UserQueryParams
} from '@/types/users'

/**
 * 创建用户
 * @param params 创建参数
 */
export const createUser = (params: CreateUserParams) => {
  return request.post<ApiResponse<UserInfo>>('/api/users', params)
}

/**
 * 获取用户列表
 * @param params 查询参数
 */
export const getUserList = (params?: PaginationQueryParams & UserQueryParams) => {
  return request.get<ApiResponse<{
    users: UserInfo[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>>('/api/users', { params })
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
export const getUserDetail = (id: number) => {
  return request.get<ApiResponse<UserInfo>>(`/api/users/${id}`)
}

/**
 * 更新用户
 * @param id 用户ID
 * @param params 更新参数
 */
export const updateUser = (id: number, params: UpdateUserParams) => {
  return request.patch<ApiResponse<UserInfo>>(`/api/users/${id}`, params)
}

/**
 * 删除用户
 * @param id 用户ID
 */
export const deleteUser = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/users/${id}`)
}

/**
 * 修改密码
 * @param params 修改密码参数
 */
export const changePassword = (params: ChangePasswordParams) => {
  return request.post<ApiResponse<null>>('/api/users/change-password', params)
}

/**
 * 重置用户密码
 * @param id 用户ID
 * @param params 重置密码参数
 */
export const resetUserPassword = (id: number, params: ResetPasswordParams) => {
  return request.post<ApiResponse<null>>(`/api/users/${id}/reset-password`, params)
}

/**
 * 分配角色
 * @param id 用户ID
 * @param params 角色分配参数
 */
export const assignUserRoles = (id: number, params: AssignRolesParams) => {
  return request.post<ApiResponse<null>>(`/api/users/${id}/roles`, params)
}

/**
 * 更新用户状态
 * @param id 用户ID
 * @param status 用户状态
 */
export const updateUserStatus = (id: number, status: UserStatus) => {
  return request.patch<ApiResponse<null>>(`/api/users/${id}/status`, { status })
}

/**
 * 获取用户权限列表
 * @param id 用户ID
 */
export const getUserPermissions = (id: number) => {
  return request.get<ApiResponse<string[]>>(`/api/users/${id}/permissions`)
}

/**
 * 修改用户密码
 * @param id 用户ID
 * @param params 密码参数
 */
export const changeUserPassword = (id: number, params: ChangePasswordParams) => {
  return request.patch<ApiResponse<null>>(`/api/users/${id}/password`, params)
}

/**
 * 重置用户密码（管理员操作）
 * @param id 用户ID
 * @param newPassword 新密码
 */
export const resetUserPasswordByAdmin = (id: number, newPassword: string) => {
  return request.post<ApiResponse<null>>(`/api/users/${id}/reset-password`, { newPassword })
}

/**
 * 获取当前用户权限
 */
export const getCurrentUserPermissions = () => {
  return request.get<ApiResponse<string[]>>('/api/auth/profile')
}