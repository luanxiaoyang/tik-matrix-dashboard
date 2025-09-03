import { request } from '@/utils/request'
import type { ApiResponse, PaginationQueryParams, PaginationApiResponse } from '@/types/business'
import type { 
  Role, 
  Permission, 
  CreateRoleParams, 
  UpdateRoleParams, 
  CreatePermissionParams, 
  UpdatePermissionParams,
  PermissionQueryParams,
  RolePermissionParams
} from '@/types/rbac'

// ========== 角色管理 ==========

/**
 * 创建角色
 * @param params 创建参数
 */
export const createRole = (params: CreateRoleParams) => {
  return request.post<ApiResponse<Role>>('/api/roles', params)
}

/**
 * 获取角色列表
 * @param params 分页参数
 */
export const getRoleList = (params: PaginationQueryParams) => {
  return request.get<PaginationApiResponse<Role>>('/api/roles', { params })
}

/**
 * 获取角色详情
 * @param id 角色ID
 */
export const getRoleDetail = (id: number) => {
  return request.get<ApiResponse<Role>>(`/api/roles/${id}`)
}

/**
 * 更新角色
 * @param id 角色ID
 * @param params 更新参数
 */
export const updateRole = (id: number, params: UpdateRoleParams) => {
  return request.patch<ApiResponse<Role>>(`/api/roles/${id}`, params)
}

/**
 * 删除角色
 * @param id 角色ID
 */
export const deleteRole = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/roles/${id}`)
}

/**
 * 为角色添加权限
 * @param roleId 角色ID
 * @param params 权限参数
 */
export const addRolePermissions = (roleId: number, params: RolePermissionParams) => {
  return request.post<ApiResponse<null>>(`/api/roles/${roleId}/permissions`, params)
}

/**
 * 移除角色权限
 * @param roleId 角色ID
 * @param permissionId 权限ID
 */
export const removeRolePermission = (roleId: number, permissionId: number) => {
  return request.delete<ApiResponse<null>>(`/api/roles/${roleId}/permissions/${permissionId}`)
}

// ========== 权限管理 ==========

/**
 * 创建权限
 * @param params 创建参数
 */
export const createPermission = (params: CreatePermissionParams) => {
  return request.post<ApiResponse<Permission>>('/api/permissions', params)
}

/**
 * 获取权限列表
 * @param params 查询参数
 */
export const getPermissionList = (params?: PaginationQueryParams & PermissionQueryParams) => {
  return request.get<PaginationApiResponse<Permission[]>>('/api/permissions', { params })
}

/**
 * 获取权限详情
 * @param id 权限ID
 */
export const getPermissionDetail = (id: number) => {
  return request.get<ApiResponse<Permission>>(`/api/permissions/${id}`)
}

/**
 * 更新权限
 * @param id 权限ID
 * @param params 更新参数
 */
export const updatePermission = (id: number, params: UpdatePermissionParams) => {
  return request.patch<ApiResponse<Permission>>(`/api/permissions/${id}`, params)
}

/**
 * 删除权限
 * @param id 权限ID
 */
export const deletePermission = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/permissions/${id}`)
}

/**
 * 获取权限树
 */
export const getPermissionTree = () => {
  return request.get<ApiResponse<Permission[]>>('/api/permissions?tree=true')
}

/**
 * 根据父级ID获取权限列表
 * @param parentId 父级权限ID
 */
export const getPermissionsByParent = (parentId: number) => {
  return request.get<ApiResponse<Permission[]>>(`/api/permissions/parent/${parentId}`)
}