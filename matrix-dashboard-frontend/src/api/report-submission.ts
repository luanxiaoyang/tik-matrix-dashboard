import request from '@/utils/request'
import type {
  ReportSubmission,
  CreateReportSubmissionRequest,
  UpdateReportSubmissionRequest,
  GetReportSubmissionsParams,
  ReportSubmissionPaginationResponse,
  ReportSubmissionStatistics,
  ApiResponse
} from '@/types/api'

/**
 * 获取转化记录提交列表
 * @param params 查询参数
 * @returns 转化记录提交列表
 */
export const getReportSubmissions = (params: GetReportSubmissionsParams) => {
  return request.get<ApiResponse<ReportSubmissionPaginationResponse>>('/report-submissions', { params })
}

/**
 * 根据ID获取转化记录提交详情
 * @param id 转化记录提交ID
 * @returns 转化记录提交详情
 */
export const getReportSubmissionById = (id: number) => {
  return request.get<ApiResponse<ReportSubmission>>(`/report-submissions/${id}`)
}

/**
 * 创建转化记录提交
 * @param data 转化记录提交信息
 * @returns 创建结果
 */
export const createReportSubmission = (data: CreateReportSubmissionRequest) => {
  return request.post<ApiResponse<ReportSubmission>>('/report-submissions', data)
}

/**
 * 更新转化记录提交信息
 * @param id 转化记录提交ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateReportSubmission = (id: number, data: UpdateReportSubmissionRequest) => {
  return request.patch<ApiResponse<ReportSubmission>>(`/report-submissions/${id}`, data)
}

/**
 * 删除转化记录提交
 * @param id 转化记录提交ID
 * @returns 删除结果
 */
export const deleteReportSubmission = (id: number) => {
  return request.delete<ApiResponse<{ success: boolean }>>(`/report-submissions/${id}`)
}

/**
 * 根据YAYChat用户ID查找转化记录提交
 * @param yaychatUserId YAYChat用户ID
 * @param params 查询参数
 * @returns 转化记录提交列表
 */
export const getReportSubmissionsByYaychatUser = (yaychatUserId: string, params?: Omit<GetReportSubmissionsParams, 'yaychatUserId'>) => {
  return request.get<ApiResponse<ReportSubmissionPaginationResponse>>(`/report-submissions/yaychat-user/${yaychatUserId}`, { params })
}

/**
 * 根据TikTok账号ID查找转化记录提交
 * @param tiktokAccountId TikTok账号ID
 * @param params 查询参数
 * @returns 转化记录提交列表
 */
export const getReportSubmissionsByTiktokAccount = (tiktokAccountId: string, params?: Omit<GetReportSubmissionsParams, 'tiktokAccountId'>) => {
  return request.get<ApiResponse<ReportSubmissionPaginationResponse>>(`/report-submissions/tiktok-account/${tiktokAccountId}`, { params })
}

/**
 * 获取转化记录提交统计信息
 * @returns 统计信息
 */
export const getReportSubmissionStatistics = () => {
  return request.get<ApiResponse<ReportSubmissionStatistics>>('/report-submissions/statistics/overview')
}

/**
 * 批量删除转化记录提交
 * @param ids 转化记录提交ID数组
 * @returns 删除结果
 */
export const batchDeleteReportSubmissions = (ids: number[]) => {
  return request.post<ApiResponse<{ success: boolean }>>('/report-submissions/batch-delete', { ids })
}