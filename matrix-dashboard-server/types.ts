/**
 * Matrix Dashboard API TypeScript 类型定义
 * 自动生成，请勿手动修改
 */

// ============== 通用类型 ==============

/** API 通用响应格式 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/** 分页响应格式 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 用户状态枚举 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

/** 权限类型枚举 */
export enum PermissionType {
  MENU = 'MENU',
  OPERATION = 'OPERATION',
  API = 'API',
}

/** 同步状态枚举 */
export enum SyncStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// ============== 实体类型 ==============

/** 用户实体 */
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  status: UserStatus;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  larkUserId?: string;
  larkUserInfo?: any;
}

/** 角色实体 */
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  sort: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/** 权限实体 */
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: PermissionType;
  description?: string;
  parentId?: number;
  resource?: string;
  isActive: boolean;
  sort: number;
  children?: Permission[];
  createdAt: string;
  updatedAt: string;
}

/** 用户充值功能数据 */
export interface UserRechargeFeature {
  id: number;
  uid: number;
  totalRecharge: number;
  day1Coin: number;
  day2Coin: number;
  day7Coin: number;
  day30Coin: number;
  isValuableUser: boolean;
  isHundredUser: boolean;
  registerTime: number;
  syncStatus: SyncStatus;
  syncAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============== 请求DTO类型 ==============

/** 登录请求 */
export interface LoginDto {
  username: string;
  password: string;
}

/** 刷新Token请求 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/** Lark授权请求 */
export interface LarkAuthDto {
  code: string;
}

/** 创建用户请求 */
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  avatar?: string;
  status?: UserStatus;
  roleIds?: number[];
}

/** 更新用户请求 */
export interface UpdateUserDto {
  username?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  status?: UserStatus;
  roleIds?: number[];
}

/** 修改密码请求 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/** 重置密码请求 */
export interface ResetPasswordDto {
  newPassword: string;
}

/** 分配角色请求 */
export interface AssignRolesDto {
  roleIds: number[];
}

/** 创建角色请求 */
export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  sort?: number;
  permissionIds?: number[];
}

/** 更新角色请求 */
export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  sort?: number;
  permissionIds?: number[];
}

/** 创建权限请求 */
export interface CreatePermissionDto {
  name: string;
  code: string;
  type: PermissionType;
  description?: string;
  parentId?: number;
  resource?: string;
  isActive?: boolean;
  sort?: number;
}

/** 更新权限请求 */
export interface UpdatePermissionDto {
  name?: string;
  code?: string;
  type?: PermissionType;
  description?: string;
  parentId?: number;
  resource?: string;
  isActive?: boolean;
  sort?: number;
}

/** 同步充值功能数据请求 */
export interface SyncRechargeFeatureDto {
  userIds: string; // 逗号分隔的用户ID
}

/** 批量同步充值功能数据请求 */
export interface BatchSyncRechargeFeatureDto {
  userIds: number[];
}

/** 充值功能数据查询请求 */
export interface RechargeFeatureQueryDto {
  page?: number;
  limit?: number;
  uid?: number;
  isValuableUser?: boolean;
  isHundredUser?: boolean;
  syncStatus?: SyncStatus;
}

// ============== 响应类型 ==============

/** 登录响应 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** 用户列表响应 */
export interface UserListResponse extends PaginatedResponse<User> {}

/** 角色列表响应 */
export type RoleListResponse = Role[];

/** 权限列表响应 */
export type PermissionListResponse = Permission[];

/** 充值数据列表响应 */
export interface RechargeFeatureListResponse extends PaginatedResponse<UserRechargeFeature> {}

/** 同步结果响应 */
export interface SyncResultResponse {
  syncedCount: number;
  failedCount: number;
  details: Array<{
    uid: number;
    status: 'success' | 'failed';
    message: string;
  }>;
}

/** 统计数据响应 */
export interface StatsResponse {
  totalUsers: number;
  syncedUsers: number;
  failedUsers: number;
  pendingUsers: number;
  lastSyncAt?: string;
  valuableUsers: number;
  hundredUsers: number;
}

/** 健康检查响应 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime?: number;
  memory?: any;
  environment?: string;
  error?: string;
}

// ============== API客户端类型 ==============

/** API请求配置 */
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

/** API客户端接口 */
export interface ApiClient {
  // 认证相关
  login(data: LoginDto): Promise<ApiResponse<LoginResponse>>;
  refresh(data: RefreshTokenDto): Promise<ApiResponse<LoginResponse>>;
  logout(data: RefreshTokenDto): Promise<ApiResponse<null>>;
  getProfile(): Promise<ApiResponse<User>>;
  
  // Lark相关
  getLarkAuthUrl(): Promise<ApiResponse<{ authUrl: string }>>;
  larkLogin(data: LarkAuthDto): Promise<ApiResponse<LoginResponse>>;
  bindLark(data: LarkAuthDto): Promise<ApiResponse<any>>;
  unbindLark(): Promise<ApiResponse<null>>;
  
  // 用户管理
  getUsers(params?: { page?: number; limit?: number }): Promise<ApiResponse<UserListResponse>>;
  getUserById(id: number): Promise<ApiResponse<User>>;
  createUser(data: CreateUserDto): Promise<ApiResponse<User>>;
  updateUser(id: number, data: UpdateUserDto): Promise<ApiResponse<User>>;
  deleteUser(id: number): Promise<ApiResponse<null>>;
  changePassword(data: ChangePasswordDto): Promise<ApiResponse<null>>;
  resetPassword(id: number, data: ResetPasswordDto): Promise<ApiResponse<null>>;
  assignRoles(id: number, data: AssignRolesDto): Promise<ApiResponse<User>>;
  updateUserStatus(id: number, status: UserStatus): Promise<ApiResponse<User>>;
  getUserPermissions(id: number): Promise<ApiResponse<string[]>>;
  
  // 角色管理
  getRoles(): Promise<ApiResponse<RoleListResponse>>;
  getRoleById(id: number): Promise<ApiResponse<Role>>;
  createRole(data: CreateRoleDto): Promise<ApiResponse<Role>>;
  updateRole(id: number, data: UpdateRoleDto): Promise<ApiResponse<Role>>;
  deleteRole(id: number): Promise<ApiResponse<null>>;
  addRolePermissions(id: number, permissionIds: number[]): Promise<ApiResponse<Role>>;
  removeRolePermissions(id: number, permissionIds: number[]): Promise<ApiResponse<Role>>;
  
  // 权限管理
  getPermissions(params?: { tree?: boolean }): Promise<ApiResponse<PermissionListResponse>>;
  getPermissionById(id: number): Promise<ApiResponse<Permission>>;
  createPermission(data: CreatePermissionDto): Promise<ApiResponse<Permission>>;
  updatePermission(id: number, data: UpdatePermissionDto): Promise<ApiResponse<Permission>>;
  deletePermission(id: number): Promise<ApiResponse<null>>;
  getPermissionsByParentId(parentId: number): Promise<ApiResponse<Permission[]>>;
  
  // 充值同步
  syncRechargeFeature(data: SyncRechargeFeatureDto): Promise<ApiResponse<SyncResultResponse>>;
  batchSyncRechargeFeature(data: BatchSyncRechargeFeatureDto): Promise<ApiResponse<SyncResultResponse>>;
  getRechargeFeatureList(params?: RechargeFeatureQueryDto): Promise<ApiResponse<RechargeFeatureListResponse>>;
  getRechargeFeatureByUid(uid: number): Promise<ApiResponse<UserRechargeFeature>>;
  deleteRechargeFeature(uid: number): Promise<ApiResponse<null>>;
  getRechargeStats(): Promise<ApiResponse<StatsResponse>>;
  resyncRechargeFeature(uid: number): Promise<ApiResponse<SyncResultResponse>>;
  
  // 测试接口
  testConnection(): Promise<ApiResponse<any>>;
  testGetUserRechargeFeature(userIds?: string): Promise<ApiResponse<any>>;
  testDirectApi(data: { userIds: string; token: string }): Promise<ApiResponse<any>>;
  syncDirect(data: { userIds: string; token: string }): Promise<ApiResponse<any>>;
  debugLogin(): Promise<ApiResponse<any>>;
  
  // 健康检查
  healthCheck(): Promise<HealthResponse>;
}

// ============== 工具类型 ==============

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** 排序参数 */
export interface SortParams {
  field: string;
  order: 'ASC' | 'DESC';
}

/** 查询参数 */
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: Record<string, any>;
}

/** 操作结果 */
export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
}

/** 权限检查函数类型 */
export type PermissionChecker = (permission: string) => boolean;

/** 路由守卫函数类型 */
export type RouteGuard = (to: any, from: any, next: any) => void;

// ============== 常量 ==============

/** API端点常量 */
export const API_ENDPOINTS = {
  // 认证
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_PROFILE: '/auth/profile',
  
  // Lark
  LARK_URL: '/auth/lark/url',
  LARK_LOGIN: '/auth/lark/login',
  LARK_BIND: '/auth/lark/bind',
  LARK_UNBIND: '/auth/lark/unbind',
  
  // 用户
  USERS: '/users',
  USER_CHANGE_PASSWORD: '/users/change-password',
  
  // 角色和权限
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  
  // 充值同步
  RECHARGE_SYNC: '/recharge-sync/sync',
  RECHARGE_BATCH_SYNC: '/recharge-sync/batch-sync',
  RECHARGE_LIST: '/recharge-sync/list',
  RECHARGE_STATS: '/recharge-sync/stats',
  
  // 健康检查
  HEALTH: '/health',
} as const;

/** 默认配置 */
export const DEFAULT_CONFIG = {
  BASE_URL: 'http://localhost:8008/api',
  TIMEOUT: 30000,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/** 错误码映射 */
export const ERROR_CODES = {
  200: '操作成功',
  400: '请求参数错误',
  401: '未登录或登录已过期',
  403: '权限不足',
  404: '资源不存在',
  500: '服务器内部错误',
} as const;

// ============== 导出所有类型 ==============
// 所有类型已通过 export 关键字单独导出