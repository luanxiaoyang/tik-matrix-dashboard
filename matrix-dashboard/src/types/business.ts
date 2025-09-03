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
 * 账号详情信息（用于详情页面）
 */
export interface AccountInfo {
  id: string
  phone: string // 手机编号，支持格式如：us-1、美国1、云845等
  phoneNo: string // 手机编号，支持格式如：us-1、美国1、云845等
  accountUrl: string
  accountLink: string
  owner: string
  ownerId: string
  creator?: string
  createdBy?: string
  status: string
  remark?: string
  createdAt: string
  updatedAt?: string
  stats?: {
    conversionCount: number
  }
  lastRechargeFeature?: AccountRechargeFeature
}

/**
 * 创建账号参数
 */
export interface CreateAccountParams {
  phone: string // 手机编号，支持格式如：us-1、美国1、云845等
  phoneNo: string // 手机编号，支持格式如：us-1、美国1、云845等
  accountUrl: string
  accountLink: string
  owner?: string
  ownerId?: string
  status?: string
  remark?: string
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
  registerUserId: number // 7位数的用户ID
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
 * 充值信息
 */
export interface RechargeInfo {
  id: string
  phone: string // 手机编号，支持格式如：us-1、美国1、云845等
  accountUrl: string
  accountId: string
  ownerId: string // 账号归属用户ID
  uid: number // YayChat用户ID
  totalRecharge: number // 总充值金额（美分）
  day1Coin: number // 1天内金币
  day2Coin: number // 2天内金币
  day7Coin: number // 7天内金币
  day30Coin: number // 30天内金币
  registerTime: number // 注册时间戳（毫秒）
  hundredUser: boolean // 是否百元用户（后端返回）
  valuableUser: boolean // 是否价值用户（后端返回）
  lastUpdatedAt: string // 最后更新时间
}

/**
 * 查询充值信息参数
 */
export interface QueryRechargeInfoParams {
  accountIds?: string[]
  phoneNos?: string[]
  page?: number
  pageSize?: number
  ownerId?: string // 限制查看归属用户
}

/**
 * 充值信息查询响应
 */
export interface QueryRechargeInfoResponse {
  total: number
  items: RechargeInfo[]
  page: number
  pageSize: number
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