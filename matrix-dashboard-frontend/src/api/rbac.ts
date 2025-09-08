import request from '@/utils/request'
import type { Role, Permission, PaginationResponse } from '@/types/api'

// 角色管理API
/**
 * 获取角色列表
 * @param params 查询参数
 * @returns 角色列表
 */
export const getRoleList = (params: {
  page?: number
  pageSize?: number
  name?: string
  code?: string
}) => {
  return request.get<PaginationResponse<Role>>('/roles', { params })
}

/**
 * 根据ID获取角色详情
 * @param id 角色ID
 * @returns 角色详情
 */
export const getRoleById = (id: number) => {
  return request.get<Role>(`/roles/${id}`)
}

/**
 * 创建角色
 * @param data 角色信息
 * @returns 创建结果
 */
export const createRole = (data: {
  name: string
  code: string
  description?: string
  permissionIds: number[]
}) => {
  return request.post<Role>('/roles', data)
}

/**
 * 更新角色信息
 * @param id 角色ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateRole = (id: number, data: {
  name?: string
  code?: string
  description?: string
  permissionIds?: number[]
}) => {
  return request.patch<Role>(`/roles/${id}`, data)
}

/**
 * 删除角色
 * @param id 角色ID
 * @returns 删除结果
 */
export const deleteRole = (id: number) => {
  return request.delete<{ success: boolean }>(`/roles/${id}`)
}

// 权限管理API
/**
 * 获取权限列表
 * @param params 查询参数
 * @returns 权限列表
 */
export const getPermissionList = (params: {
  page?: number
  pageSize?: number
  name?: string
  code?: string
}) => {
  return request.get<PaginationResponse<Permission>>('/permissions', { params })
}

/**
 * 根据ID获取权限详情
 * @param id 权限ID
 * @returns 权限详情
 */
export const getPermissionById = (id: number) => {
  return request.get<Permission>(`/permissions/${id}`)
}

/**
 * 创建权限
 * @param data 权限信息
 * @returns 创建结果
 */
export const createPermission = (data: {
  name: string
  code: string
  description?: string
}) => {
  return request.post<Permission>('/permissions', data)
}

/**
 * 更新权限信息
 * @param id 权限ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updatePermission = (id: number, data: {
  name?: string
  code?: string
  description?: string
}) => {
  return request.put<Permission>(`/permissions/${id}`, data)
}

/**
 * 删除权限
 * @param id 权限ID
 * @returns 删除结果
 */
export const deletePermission = (id: number) => {
  return request.delete<{ success: boolean }>(`/permissions/${id}`)
}

/**
 * 获取所有权限（用于角色分配）
 * @returns 权限列表
 */
export const getAllPermissions = () => {
  return request.get<Permission[]>('/permissions')
}

/**
 * 获取所有角色（用于用户分配）
 * @returns 角色列表
 */
export const getAllRoles = () => {
  return request.get<Role[]>('/roles')
}

/**
 * 为角色添加权限
 * @param roleId 角色ID
 * @param permissionIds 权限ID数组
 * @returns 操作结果
 */
export const addRolePermissions = (roleId: number, permissionIds: number[]) => {
  return request.post<{ success: boolean }>(`/roles/${roleId}/permissions`, {
    permissionIds
  })
}

/**
 * 移除角色权限
 * @param roleId 角色ID
 * @param permissionIds 权限ID数组
 * @returns 操作结果
 */
export const removeRolePermissions = (roleId: number, permissionIds: number[]) => {
  return request.delete<{ success: boolean }>(`/roles/${roleId}/permissions`, {
    data: { permissionIds }
  })
}

/**
 * 设置角色权限（替换所有权限）
 * @param roleId 角色ID
 * @param permissionIds 权限ID列表
 * @returns 设置结果
 */
export const setRolePermissions = async (roleId: number, permissionIds: number[]) => {
  // 先获取角色当前权限
  const role = await getRoleById(roleId)
  const currentPermissionIds = role.data.permissions?.map((p: Permission | string) => typeof p === 'string' ? parseInt(p) : p.id) || []
  
  // 删除所有当前权限
  if (currentPermissionIds.length > 0) {
    await removeRolePermissions(roleId, currentPermissionIds)
  }
  
  // 添加新权限
  if (permissionIds.length > 0) {
    return addRolePermissions(roleId, permissionIds)
  }
  
  return { data: { success: true } }
}