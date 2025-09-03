/**
 * Matrix Dashboard API 客户端实现
 * 开箱即用的API调用封装
 */

import type {
  ApiClient as IApiClient,
  ApiResponse,
  LoginDto,
  LoginResponse,
  RefreshTokenDto,
  LarkAuthDto,
  User,
  CreateUserDto,
  UpdateUserDto,
  UserListResponse,
  ChangePasswordDto,
  ResetPasswordDto,
  AssignRolesDto,
  UserStatus,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  SyncRechargeFeatureDto,
  BatchSyncRechargeFeatureDto,
  RechargeFeatureQueryDto,
  UserRechargeFeature,
  RechargeFeatureListResponse,
  SyncResultResponse,
  StatsResponse,
  HealthResponse,
  ApiRequestConfig,
} from './types';

import { API_ENDPOINTS, DEFAULT_CONFIG } from './types';

/**
 * API客户端类
 */
export class ApiClient implements IApiClient {
  private baseURL: string;
  private timeout: number;
  private accessToken: string | null = null;

  constructor(options: { baseURL?: string; timeout?: number } = {}) {
    this.baseURL = options.baseURL || 'http://localhost:8008/api';
    this.timeout = options.timeout || DEFAULT_CONFIG.TIMEOUT;
    this.accessToken = this.getStoredToken();
  }

  /**
   * 获取存储的Token
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * 设置Token
   */
  setToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  /**
   * 清除Token
   */
  clearToken(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * 通用请求方法
   */
  private async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = config;

    // 构建URL
    let url = `${this.baseURL}${endpoint}`;
    if (params && method === 'GET') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // 构建请求头
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // 添加认证头
    if (this.accessToken) {
      requestHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // 添加请求体
    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    requestConfig.signal = controller.signal;

    try {
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      const data = await response.json();

      // Token过期自动刷新
      if (response.status === 401 && this.accessToken) {
        const refreshSuccess = await this.handleTokenRefresh();
        if (refreshSuccess) {
          // 重新发起请求
          return this.request<T>(endpoint, config);
        } else {
          // 刷新失败，跳转到登录页
          this.handleAuthError();
        }
      }

      // 检查响应状态
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时');
        }
        throw error;
      }
      
      throw new Error('网络错误');
    }
  }

  /**
   * 处理Token刷新
   */
  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refreshToken') 
        : null;
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH_REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.code === 200) {
        this.setToken(data.data.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(): void {
    this.clearToken();
    
    // 发出认证错误事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-error'));
      
      // 如果在浏览器环境，可以跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  // ============== 认证相关 ==============

  async login(data: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: data,
    });

    if (response.code === 200 && response.data) {
      this.setToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response;
  }

  async refresh(data: RefreshTokenDto): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(API_ENDPOINTS.AUTH_REFRESH, {
      method: 'POST',
      body: data,
    });
  }

  async logout(data: RefreshTokenDto): Promise<ApiResponse<null>> {
    try {
      const response = await this.request<null>(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
        body: data,
      });
      return response;
    } finally {
      this.clearToken();
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH_PROFILE);
  }

  // ============== Lark相关 ==============

  async getLarkAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request<{ authUrl: string }>(API_ENDPOINTS.LARK_URL);
  }

  async larkLogin(data: LarkAuthDto): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>(API_ENDPOINTS.LARK_LOGIN, {
      method: 'POST',
      body: data,
    });

    if (response.code === 200 && response.data) {
      this.setToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response;
  }

  async bindLark(data: LarkAuthDto): Promise<ApiResponse<any>> {
    return this.request<any>(API_ENDPOINTS.LARK_BIND, {
      method: 'POST',
      body: data,
    });
  }

  async unbindLark(): Promise<ApiResponse<null>> {
    return this.request<null>(API_ENDPOINTS.LARK_UNBIND, {
      method: 'POST',
    });
  }

  // ============== 用户管理 ==============

  async getUsers(params?: { page?: number; limit?: number }): Promise<ApiResponse<UserListResponse>> {
    return this.request<UserListResponse>(API_ENDPOINTS.USERS, {
      params,
    });
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`${API_ENDPOINTS.USERS}/${id}`);
  }

  async createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS, {
      method: 'POST',
      body: data,
    });
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<ApiResponse<User>> {
    return this.request<User>(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    return this.request<null>(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<null>> {
    return this.request<null>(API_ENDPOINTS.USER_CHANGE_PASSWORD, {
      method: 'POST',
      body: data,
    });
  }

  async resetPassword(id: number, data: ResetPasswordDto): Promise<ApiResponse<null>> {
    return this.request<null>(`${API_ENDPOINTS.USERS}/${id}/reset-password`, {
      method: 'POST',
      body: data,
    });
  }

  async assignRoles(id: number, data: AssignRolesDto): Promise<ApiResponse<User>> {
    return this.request<User>(`${API_ENDPOINTS.USERS}/${id}/roles`, {
      method: 'POST',
      body: data,
    });
  }

  async updateUserStatus(id: number, status: UserStatus): Promise<ApiResponse<User>> {
    return this.request<User>(`${API_ENDPOINTS.USERS}/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async getUserPermissions(id: number): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(`${API_ENDPOINTS.USERS}/${id}/permissions`);
  }

  // ============== 角色管理 ==============

  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>(API_ENDPOINTS.ROLES);
  }

  async getRoleById(id: number): Promise<ApiResponse<Role>> {
    return this.request<Role>(`${API_ENDPOINTS.ROLES}/${id}`);
  }

  async createRole(data: CreateRoleDto): Promise<ApiResponse<Role>> {
    return this.request<Role>(API_ENDPOINTS.ROLES, {
      method: 'POST',
      body: data,
    });
  }

  async updateRole(id: number, data: UpdateRoleDto): Promise<ApiResponse<Role>> {
    return this.request<Role>(`${API_ENDPOINTS.ROLES}/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteRole(id: number): Promise<ApiResponse<null>> {
    return this.request<null>(`${API_ENDPOINTS.ROLES}/${id}`, {
      method: 'DELETE',
    });
  }

  async addRolePermissions(id: number, permissionIds: number[]): Promise<ApiResponse<Role>> {
    return this.request<Role>(`${API_ENDPOINTS.ROLES}/${id}/permissions`, {
      method: 'POST',
      body: { permissionIds },
    });
  }

  async removeRolePermissions(id: number, permissionIds: number[]): Promise<ApiResponse<Role>> {
    return this.request<Role>(`${API_ENDPOINTS.ROLES}/${id}/permissions`, {
      method: 'DELETE',
      body: { permissionIds },
    });
  }

  // ============== 权限管理 ==============

  async getPermissions(params?: { tree?: boolean }): Promise<ApiResponse<Permission[]>> {
    return this.request<Permission[]>(API_ENDPOINTS.PERMISSIONS, {
      params,
    });
  }

  async getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    return this.request<Permission>(`${API_ENDPOINTS.PERMISSIONS}/${id}`);
  }

  async createPermission(data: CreatePermissionDto): Promise<ApiResponse<Permission>> {
    return this.request<Permission>(API_ENDPOINTS.PERMISSIONS, {
      method: 'POST',
      body: data,
    });
  }

  async updatePermission(id: number, data: UpdatePermissionDto): Promise<ApiResponse<Permission>> {
    return this.request<Permission>(`${API_ENDPOINTS.PERMISSIONS}/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deletePermission(id: number): Promise<ApiResponse<null>> {
    return this.request<null>(`${API_ENDPOINTS.PERMISSIONS}/${id}`, {
      method: 'DELETE',
    });
  }

  async getPermissionsByParentId(parentId: number): Promise<ApiResponse<Permission[]>> {
    return this.request<Permission[]>(`${API_ENDPOINTS.PERMISSIONS}/parent/${parentId}`);
  }

  // ============== 充值同步 ==============

  async syncRechargeFeature(data: SyncRechargeFeatureDto): Promise<ApiResponse<SyncResultResponse>> {
    return this.request<SyncResultResponse>(API_ENDPOINTS.RECHARGE_SYNC, {
      method: 'POST',
      body: data,
    });
  }

  async batchSyncRechargeFeature(data: BatchSyncRechargeFeatureDto): Promise<ApiResponse<SyncResultResponse>> {
    return this.request<SyncResultResponse>(API_ENDPOINTS.RECHARGE_BATCH_SYNC, {
      method: 'POST',
      body: data,
    });
  }

  async getRechargeFeatureList(params?: RechargeFeatureQueryDto): Promise<ApiResponse<RechargeFeatureListResponse>> {
    return this.request<RechargeFeatureListResponse>(API_ENDPOINTS.RECHARGE_LIST, {
      params,
    });
  }

  async getRechargeFeatureByUid(uid: number): Promise<ApiResponse<UserRechargeFeature>> {
    return this.request<UserRechargeFeature>(`/recharge-sync/user/${uid}`);
  }

  async deleteRechargeFeature(uid: number): Promise<ApiResponse<null>> {
    return this.request<null>(`/recharge-sync/user/${uid}`, {
      method: 'DELETE',
    });
  }

  async getRechargeStats(): Promise<ApiResponse<StatsResponse>> {
    return this.request<StatsResponse>(API_ENDPOINTS.RECHARGE_STATS);
  }

  async resyncRechargeFeature(uid: number): Promise<ApiResponse<SyncResultResponse>> {
    return this.request<SyncResultResponse>(`/recharge-sync/resync/${uid}`, {
      method: 'POST',
    });
  }

  // ============== 测试接口 ==============

  async testConnection(): Promise<ApiResponse<any>> {
    return this.request<any>('/recharge-sync/test/connection');
  }

  async testGetUserRechargeFeature(userIds = '123456'): Promise<ApiResponse<any>> {
    return this.request<any>('/recharge-sync/test/recharge-feature', {
      params: { userIds },
    });
  }

  async testDirectApi(data: { userIds: string; token: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/recharge-sync/test/direct-api', {
      method: 'POST',
      body: data,
    });
  }

  async syncDirect(data: { userIds: string; token: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/recharge-sync/sync-direct', {
      method: 'POST',
      body: data,
    });
  }

  async debugLogin(): Promise<ApiResponse<any>> {
    return this.request<any>('/recharge-sync/debug/login');
  }

  // ============== 健康检查 ==============

  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.HEALTH}`);
      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * 创建API客户端实例
 */
export const createApiClient = (options?: { baseURL?: string; timeout?: number }): ApiClient => {
  return new ApiClient(options);
};

/**
 * 默认API客户端实例
 */
export const apiClient = createApiClient();

/**
 * 快捷方法 - 用于在非类组件中使用
 */
export const api = {
  // 认证
  login: (data: LoginDto) => apiClient.login(data),
  logout: (refreshToken: string) => apiClient.logout({ refreshToken }),
  getProfile: () => apiClient.getProfile(),
  
  // 用户
  getUsers: (params?: { page?: number; limit?: number }) => apiClient.getUsers(params),
  createUser: (data: CreateUserDto) => apiClient.createUser(data),
  updateUser: (id: number, data: UpdateUserDto) => apiClient.updateUser(id, data),
  deleteUser: (id: number) => apiClient.deleteUser(id),
  
  // 角色
  getRoles: () => apiClient.getRoles(),
  
  // 权限
  getPermissions: (tree = false) => apiClient.getPermissions({ tree }),
  
  // 充值数据
  syncRecharge: (userIds: string) => apiClient.syncRechargeFeature({ userIds }),
  getRechargeList: (params?: RechargeFeatureQueryDto) => apiClient.getRechargeFeatureList(params),
  getRechargeStats: () => apiClient.getRechargeStats(),
  
  // 健康检查
  health: () => apiClient.healthCheck(),
};

export default apiClient;