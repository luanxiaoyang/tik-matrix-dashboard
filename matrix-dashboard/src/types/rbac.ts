/**
 * RBAC相关类型定义
 */

// 权限类型
export interface Permission {
  id: number
  name: string
  code: string
  description?: string
  parentId?: number
  type: 'menu' | 'button' | 'api'
  path?: string
  method?: string
  icon?: string
  sort: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  children?: Permission[]
}

// 角色类型
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  permissions?: Permission[]
}

// 创建权限参数
export interface CreatePermissionParams {
  name: string
  code: string
  description?: string
  parentId?: number
  type: 'menu' | 'button' | 'api'
  path?: string
  method?: string
  icon?: string
  sort: number
}

// 更新权限参数
export interface UpdatePermissionParams {
  name?: string
  code?: string
  description?: string
  parentId?: number
  type?: 'menu' | 'button' | 'api'
  path?: string
  method?: string
  icon?: string
  sort?: number
  status?: 'active' | 'inactive'
}

// 创建角色参数
export interface CreateRoleParams {
  name: string
  code: string
  description?: string
}

// 更新角色参数
export interface UpdateRoleParams {
  name?: string
  code?: string
  description?: string
  status?: 'active' | 'inactive'
}

// 权限查询参数
export interface PermissionQueryParams {
  view?: 'tree' | 'flat'
  type?: 'menu' | 'button' | 'api'
  status?: 'active' | 'inactive'
  parentId?: number
}

// 角色权限分配参数
export interface RolePermissionParams {
  permissionIds: number[]
}