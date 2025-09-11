import request from "../utils/request";
import type {
  TiktokAccount,
  CreateTiktokAccountRequest,
  UpdateTiktokAccountRequest,
  AssignUserRequest,
  BatchAssignRequest,
  UpdateStatsRequest,
  TiktokAccountQueryParams,
  TiktokAccountStats,
  ApiResponse,
  PaginationResponse,
  AccountStatus,
} from "../types/api";

/**
 * 获取TikTok账号列表
 * @param params 查询参数
 * @returns 分页的TikTok账号列表
 */
export const getTiktokAccounts = (
  params?: TiktokAccountQueryParams,
): Promise<ApiResponse<PaginationResponse<TiktokAccount>>> => {
  return request.get("/tiktok-accounts", { params });
};

/**
 * 创建TikTok账号
 * @param data 创建账号的数据
 * @returns 创建的账号信息
 */
export const createTiktokAccount = (
  data: CreateTiktokAccountRequest,
): Promise<ApiResponse<TiktokAccount>> => {
  return request.post("/tiktok-accounts", data);
};

/**
 * 根据ID获取TikTok账号详情
 * @param id 账号ID
 * @returns 账号详情
 */
export const getTiktokAccountById = (id: string): Promise<ApiResponse<TiktokAccount>> => {
  return request.get(`/tiktok-accounts/${id}`);
};

/**
 * 更新TikTok账号信息
 * @param id 账号ID
 * @param data 更新的数据
 * @returns 更新后的账号信息
 */
export const updateTiktokAccount = (
  id: string,
  data: UpdateTiktokAccountRequest,
): Promise<ApiResponse<TiktokAccount>> => {
  return request.patch(`/tiktok-accounts/${id}`, data);
};

/**
 * 删除TikTok账号
 * @param id 账号ID
 * @returns 删除结果
 */
export const deleteTiktokAccount = (id: string): Promise<ApiResponse<void>> => {
  return request.delete(`/tiktok-accounts/${id}`);
};

/**
 * 为账号分配用户
 * @param id 账号ID
 * @param data 分配用户的数据
 * @returns 更新后的账号信息
 */
export const assignUsers = (
  id: string,
  data: AssignUserRequest,
): Promise<ApiResponse<TiktokAccount>> => {
  return request.post(`/tiktok-accounts/${id}/assign`, data);
};

/**
 * 批量分配用户
 * @param data 批量分配的数据
 * @returns 批量分配结果
 */
export const batchAssignUsers = (data: BatchAssignRequest): Promise<ApiResponse<void>> => {
  return request.post(`/tiktok-accounts/batch-assign`, data);
};

/**
 * 根据用户ID获取分配的账号
 * @param userId 用户ID
 * @param type 账号类型 - operations: 运营账号, conversion: 转化账号
 * @returns 用户分配的账号列表
 */
export const getAccountsByUser = (
  userId: string, 
  type: 'operations' | 'conversion' = 'operations'
): Promise<ApiResponse<TiktokAccount[]>> => {
  return request.get(`/tiktok-accounts/user/${userId}`, { params: { type } });
};

/**
 * 更新账号统计数据
 * @param id 账号ID
 * @param data 统计数据
 * @returns 更新后的账号信息
 */
export const updateAccountStats = (
  id: string,
  data: UpdateStatsRequest,
): Promise<ApiResponse<TiktokAccount>> => {
  return request.patch(`/tiktok-accounts/${id}/stats`, data);
};

/**
 * 更新账号状态
 * @param id 账号ID
 * @param status 新状态
 * @returns 更新后的账号信息
 */
export const updateAccountStatus = (
  id: string,
  status: AccountStatus,
): Promise<ApiResponse<TiktokAccount>> => {
  return request.patch(`/tiktok-accounts/${id}/status`, { status });
};

/**
 * 根据URL查找账号
 * @param url 账号URL
 * @returns 匹配的账号信息
 */
export const findAccountByUrl = (url: string): Promise<ApiResponse<TiktokAccount | null>> => {
  return request.get("/tiktok-accounts/find-by-url", { params: { url } });
};

/**
 * 根据手机号查找账号
 * @param phone 手机号
 * @returns 匹配的账号列表
 */
export const findAccountsByPhone = (phone: string): Promise<ApiResponse<TiktokAccount[]>> => {
  return request.get("/tiktok-accounts/find-by-phone", { params: { phone } });
};

/**
 * 获取账号统计概览
 * @returns 账号统计数据
 */
export const getAccountStats = (): Promise<ApiResponse<TiktokAccountStats>> => {
  return request.get("/tiktok-accounts/statistics/overview");
};
