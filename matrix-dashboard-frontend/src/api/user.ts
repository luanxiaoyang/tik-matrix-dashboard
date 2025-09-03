import request from '@/utils/request'
import type { User, CreateUserRequest, UpdateUserRequest, PaginationResponse, GetUsersParams, ApiResponse } from '@/types/api'

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表
 */
export const getUserList = (params: GetUsersParams) => {
  return request.get<ApiResponse<PaginationResponse<User>>>('/users', { params })
}

/**
 * 根据ID获取用户详情
 * @param id 用户ID
 * @returns 用户详情
 */
export const getUserById = (id: number) => {
  return request.get<User>(`/users/${id}`)
}

/**
 * 创建用户
 * @param data 用户信息
 * @returns 创建结果
 */
export const createUser = (data: CreateUserRequest) => {
  return request.post<User>('/users', data)
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateUser = (id: number, data: UpdateUserRequest) => {
  return request.put<User>(`/users/${id}`, data)
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns 删除结果
 */
export const deleteUser = (id: number) => {
  return request.delete<{ success: boolean }>(`/users/${id}`)
}

/**
 * 重置用户密码
 * @param id 用户ID
 * @param newPassword 新密码
 * @returns 重置结果
 */
export const resetUserPassword = (id: number, newPassword: string) => {
  return request.post<{ success: boolean }>(`/users/${id}/reset-password`, {
    newPassword
  })
}

/**
 * 批量删除用户
 * @param ids 用户ID数组
 * @returns 删除结果
 */
export const batchDeleteUsers = (ids: number[]) => {
  return request.post<{ success: boolean }>('/users/batch-delete', { ids })
}