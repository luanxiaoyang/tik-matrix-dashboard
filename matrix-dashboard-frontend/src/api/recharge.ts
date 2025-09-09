import request from "@/utils/request";
import type {
  RechargeFeature,
  RechargeSyncRequest,
  RechargeSyncResponse,
  PaginationResponse,
} from "@/types/api";

/**
 * 获取用户充值特性列表
 * @param params 查询参数
 * @returns 充值特性列表
 */
export const getRechargeFeatures = (params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  status?: "active" | "inactive";
}) => {
  return request.get<PaginationResponse<RechargeFeature>>("/recharge-sync/list", { params });
};

/**
 * 同步用户充值特性
 * @param data 同步请求数据
 * @returns 同步结果
 */
export const syncRechargeFeatures = (data: RechargeSyncRequest) => {
  return request.post<RechargeSyncResponse>("/recharge-sync/sync", data);
};

/**
 * 批量同步用户充值特性
 * @param userIds 用户ID数组
 * @returns 同步结果
 */
export const batchSyncRechargeFeatures = (userIds: string[]) => {
  return request.post<RechargeSyncResponse>("/recharge-sync/batch-sync", {
    userIds: userIds.join(","),
  });
};

/**
 * 获取同步历史记录
 * @param params 查询参数
 * @returns 同步历史记录
 */
export const getSyncHistory = (params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<
    PaginationResponse<{
      id: number;
      userId: string;
      syncType: "manual" | "auto";
      status: "success" | "failed" | "pending";
      message?: string;
      createdAt: string;
    }>
  >("/recharge-sync/history", { params });
};

/**
 * 调试YAY登录
 * @returns 调试结果
 */
export const debugYayLogin = () => {
  return request.post<{ success: boolean; message: string }>("/recharge-sync/debug/login");
};

/**
 * 测试外部API连接
 * @returns 测试结果
 */
export const testApiConnection = () => {
  return request.get<{ success: boolean; message: string }>("/test-api/connection");
};

/**
 * 获取用户充值特性（通过token）
 * @param token YAY API token
 * @param userId 用户ID
 * @returns 用户充值特性
 */
export const getUserRechargeFeatureWithToken = (token: string, userId: string) => {
  return request.post<RechargeFeature>("/direct-api/user-recharge-feature", {
    token,
    userId,
  });
};
