/**
 * 账号状态枚举
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

/**
 * 账号信息
 */
export interface Account {
  id: string
  phoneNo: string // 手机编号，支持格式如：us-1、美国1、云845等
  accountLink: string
  ownerId: string
  createdBy: string
  status: AccountStatus
  createdAt: string
  stats?: {
    conversionCount: number
  }
  lastRechargeFeature?: AccountRechargeFeature
}

/**
 * 创建账号参数
 */
export interface CreateAccountParams {
  phoneNo: string // 手机编号，支持格式如：us-1、美国1、云845等
  accountLink: string
  ownerId?: string
}

/**
 * 转化记录
 */
export interface Conversion {
  id: string
  registerUserId: number
  accountId: string
  phoneNo: string // 手机编号，支持格式如：us-1、美国1、云845等
  createdBy: string
  createdAt: string
  duplicated?: boolean
  accountBrief?: {
    id: string
    phoneNo: string // 手机编号
    accountLink: string
    ownerId: string
  }
  lastRechargeFeature?: AccountRechargeFeature
}

/**
 * 创建转化参数
 */
export interface CreateConversionParams {
  registerUserId: number
  accountId?: string
  phoneNo?: string // 手机编号，支持格式如：us-1、美国1、云845等
}

/**
 * 账号充值特征（用于账号详情）
 */
export interface AccountRechargeFeature {
  userId: number
  features: Record<string, any> | null
  lastSyncedAt: string
  source: string
}

/**
 * 转化记录
 */
export interface ConversionRecord {
  id: string
  phone: string // 手机编号，支持格式如：us-1、美国1、云845等
  accountUrl: string
  accountId?: string
  conversionType: 'register' | 'recharge' | 'withdraw'
  amount?: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  submitter: string
  submittedAt: string
  processedAt?: string
  processor?: string
  remark?: string
  failureReason?: string
}

/**
  * 充值特征
  */
 export interface RechargeFeature {
   id: string
   phone: string // 手机编号，支持格式如：us-1、美国1、云845等
   accountUrl: string
   syncStatus: 'synced' | 'not_synced' | 'sync_failed'
   featureStatus: 'has_recharge' | 'no_recharge'
   totalAmount: number | null
   rechargeCount: number | null
   lastRechargeTime: string | null
   updatedAt: string
   syncError: string | null
   syncing?: boolean
 }

/**
 * 批量同步充值特征参数
 */
export interface SyncRechargeFeatureParams {
  userIds: number[]
}

/**
 * 批量同步响应
 */
export interface SyncRechargeFeatureResponse {
  total: number
  success: number
  failed: Array<{
    userId: number
    reason: string
  }>
  taskId?: string
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  q?: string
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  page: number
  pageSize: number
  total: number
  items: T[]
}

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}