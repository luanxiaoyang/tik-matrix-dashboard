// 通用API响应结构
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页响应结构
export interface PaginationResponse<T> {
  items?: T[] // 通用分页项目
  users?: T[] // 用户列表专用字段
  total: number
  page: number
  limit?: number // 后端使用limit
  pageSize?: number // 兼容旧版本
  totalPages?: number // 总页数
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  password?: string // 后端返回包含密码字段（已加密）
  nickname?: string
  avatar?: string
  status: 'active' | 'inactive' | 'banned' // 后端支持banned状态
  larkUserId?: string // 飞书用户ID
  larkUserInfo?: Record<string, unknown> // 飞书用户信息
  lastLoginAt?: string
  lastLoginIp?: string // 最后登录IP
  loginCount?: number // 登录次数
  roles?: Role[]
  permissions?: Permission[]
  createdAt: string
  updatedAt: string
  deletedAt?: string // 软删除时间戳
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  isActive?: boolean // 角色是否激活
  sort?: number // 排序字段
  permissions?: string[] // 后端返回的是权限代码字符串数组
  createdAt?: string
  updatedAt?: string
  deletedAt?: string // 软删除时间戳
}

// 登录相关类型
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// 充值同步相关类型
export interface RechargeFeature {
  id: number
  userId: string
  feature: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface RechargeSyncRequest {
  userIds: string
}

export interface RechargeSyncResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

// 充值功能查询参数
export interface GetRechargeFeaturesParams {
  page?: number
  pageSize?: number
  userId?: string
  status?: 'active' | 'inactive'
}

// 同步历史查询参数
export interface GetSyncHistoryParams {
  page?: number
  pageSize?: number
  userId?: string
  startDate?: string
  endDate?: string
}

// 同步历史记录
export interface SyncHistoryRecord {
  id: number
  userId: string
  syncType: 'manual' | 'auto'
  status: 'success' | 'failed' | 'pending'
  message?: string
  createdAt: string
}

// 权限相关类型
export interface Permission {
  id: number
  name: string
  code: string
  type?: 'menu' | 'api' // 权限类型：菜单或API
  description?: string
  parentId?: number // 父权限ID
  resource?: string // 资源路径（如API路径）
  isActive?: boolean // 权限是否激活
  sort?: number // 排序字段
  createdAt?: string
  updatedAt?: string
  deletedAt?: string // 软删除时间戳
}

// 创建用户请求
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  nickname?: string
  avatar?: string
  roleIds?: number[]
  status?: 'active' | 'inactive' | 'banned'
}

// 更新用户请求
export interface UpdateUserRequest {
  username?: string
  email?: string
  nickname?: string
  avatar?: string
  status?: 'active' | 'inactive' | 'banned'
  roleIds?: number[]
}

// 用户管理相关接口参数
export interface GetUsersParams {
  page?: number
  limit?: number // 后端使用limit而不是size
  username?: string
  email?: string
  status?: 'active' | 'inactive' | 'banned'
}

// 重置密码响应
export interface ResetPasswordResponse {
  success: boolean
  newPassword: string
}

// 角色管理相关接口参数
export interface GetRolesParams {
  page?: number
  size?: number
  name?: string
  code?: string
}

// 创建角色请求
export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  permissionIds?: number[]
}

// 更新角色请求
export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissionIds?: number[]
}