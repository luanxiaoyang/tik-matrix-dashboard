/**
 * 全局常量配置
 */

// 应用配置
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: '矩阵看板',
  // 应用版本
  APP_VERSION: '1.0.0',
  // API基础URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  // 上传文件大小限制（MB）
  UPLOAD_SIZE_LIMIT: 10,
  // 分页默认大小
  DEFAULT_PAGE_SIZE: 20,
  // 分页大小选项
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  // Token存储键名
  TOKEN_KEY: 'matrix_token',
  // 用户信息存储键名
  USER_INFO_KEY: 'matrix_user_info',
  // 主题存储键名
  THEME_KEY: 'matrix_theme',
  // 语言存储键名
  LANGUAGE_KEY: 'matrix_language'
}

// 账号状态
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
} as const

// 账号状态标签
export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  [ACCOUNT_STATUS.ACTIVE]: '正常',
  [ACCOUNT_STATUS.INACTIVE]: '未激活',
  [ACCOUNT_STATUS.SUSPENDED]: '已暂停',
  [ACCOUNT_STATUS.DELETED]: '已删除'
}

// 账号状态颜色
export const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  [ACCOUNT_STATUS.ACTIVE]: 'success',
  [ACCOUNT_STATUS.INACTIVE]: 'info',
  [ACCOUNT_STATUS.SUSPENDED]: 'warning',
  [ACCOUNT_STATUS.DELETED]: 'danger'
}

// 转化状态
export const CONVERSION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const

// 转化状态标签
export const CONVERSION_STATUS_LABELS: Record<string, string> = {
  [CONVERSION_STATUS.PENDING]: '待处理',
  [CONVERSION_STATUS.PROCESSING]: '处理中',
  [CONVERSION_STATUS.SUCCESS]: '成功',
  [CONVERSION_STATUS.FAILED]: '失败',
  [CONVERSION_STATUS.CANCELLED]: '已取消'
}

// 转化状态颜色
export const CONVERSION_STATUS_COLORS: Record<string, string> = {
  [CONVERSION_STATUS.PENDING]: 'info',
  [CONVERSION_STATUS.PROCESSING]: 'warning',
  [CONVERSION_STATUS.SUCCESS]: 'success',
  [CONVERSION_STATUS.FAILED]: 'danger',
  [CONVERSION_STATUS.CANCELLED]: 'info'
}

// 转化类型
export const CONVERSION_TYPE = {
  RECHARGE: 'recharge',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  BONUS: 'bonus'
} as const

// 转化类型标签
export const CONVERSION_TYPE_LABELS: Record<string, string> = {
  [CONVERSION_TYPE.RECHARGE]: '充值',
  [CONVERSION_TYPE.WITHDRAWAL]: '提现',
  [CONVERSION_TYPE.TRANSFER]: '转账',
  [CONVERSION_TYPE.BONUS]: '奖励'
}

// 转化类型颜色
export const CONVERSION_TYPE_COLORS: Record<string, string> = {
  [CONVERSION_TYPE.RECHARGE]: 'success',
  [CONVERSION_TYPE.WITHDRAWAL]: 'warning',
  [CONVERSION_TYPE.TRANSFER]: 'info',
  [CONVERSION_TYPE.BONUS]: 'primary'
}

// 同步状态
export const SYNC_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  SYNCING: 'syncing'
} as const

// 同步状态标签
export const SYNC_STATUS_LABELS = {
  [SYNC_STATUS.SUCCESS]: '同步成功',
  [SYNC_STATUS.FAILED]: '同步失败',
  [SYNC_STATUS.PENDING]: '待同步',
  [SYNC_STATUS.SYNCING]: '同步中'
}

// 同步状态颜色
export const SYNC_STATUS_COLORS = {
  [SYNC_STATUS.SUCCESS]: 'success',
  [SYNC_STATUS.FAILED]: 'danger',
  [SYNC_STATUS.PENDING]: 'info',
  [SYNC_STATUS.SYNCING]: 'warning'
}

// 特征状态
export const FEATURE_STATUS = {
  NORMAL: 'normal',
  ABNORMAL: 'abnormal',
  UNKNOWN: 'unknown'
} as const

// 特征状态标签
export const FEATURE_STATUS_LABELS = {
  [FEATURE_STATUS.NORMAL]: '正常',
  [FEATURE_STATUS.ABNORMAL]: '异常',
  [FEATURE_STATUS.UNKNOWN]: '未知'
}

// 特征状态颜色
export const FEATURE_STATUS_COLORS = {
  [FEATURE_STATUS.NORMAL]: 'success',
  [FEATURE_STATUS.ABNORMAL]: 'danger',
  [FEATURE_STATUS.UNKNOWN]: 'info'
}

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
} as const

// 用户角色标签
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.MANAGER]: '经理',
  [USER_ROLES.OPERATOR]: '操作员',
  [USER_ROLES.VIEWER]: '查看者'
}

// 权限列表
export const PERMISSIONS = {
  // 账号管理
  ACCOUNT_VIEW: 'account:view',
  ACCOUNT_CREATE: 'account:create',
  ACCOUNT_EDIT: 'account:edit',
  ACCOUNT_DELETE: 'account:delete',
  ACCOUNT_EXPORT: 'account:export',
  
  // 转化管理
  CONVERSION_VIEW: 'conversion:view',
  CONVERSION_CREATE: 'conversion:create',
  CONVERSION_PROCESS: 'conversion:process',
  CONVERSION_EXPORT: 'conversion:export',
  
  // 充值信息
  RECHARGE_INFO_VIEW: 'recharge_info:view',
  
  // 系统管理
  SYSTEM_CONFIG: 'system:config',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  LOG_VIEW: 'log:view'
} as const

// 操作类型
export const OPERATION_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  EXPORT: 'export',
  IMPORT: 'import',
  SYNC: 'sync',
  PROCESS: 'process'
} as const

// 操作类型标签
export const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPE.CREATE]: '创建',
  [OPERATION_TYPE.UPDATE]: '更新',
  [OPERATION_TYPE.DELETE]: '删除',
  [OPERATION_TYPE.VIEW]: '查看',
  [OPERATION_TYPE.EXPORT]: '导出',
  [OPERATION_TYPE.IMPORT]: '导入',
  [OPERATION_TYPE.SYNC]: '同步',
  [OPERATION_TYPE.PROCESS]: '处理'
}

// 文件类型
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'ogg']
}

// MIME类型映射
export const MIME_TYPES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'txt': 'text/plain',
  'csv': 'text/csv',
  'json': 'application/json',
  'xml': 'application/xml',
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed'
}

// 日期格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_MINUTE: 'YYYY-MM-DD HH:mm',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
}

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接异常，请检查网络设置',
  SERVER_ERROR: '服务器异常，请稍后重试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足，无法访问',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '数据验证失败，请检查输入',
  UPLOAD_ERROR: '文件上传失败',
  DOWNLOAD_ERROR: '文件下载失败',
  EXPORT_ERROR: '数据导出失败',
  IMPORT_ERROR: '数据导入失败'
}

// 成功消息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  CREATE_SUCCESS: '创建成功',
  UPLOAD_SUCCESS: '上传成功',
  DOWNLOAD_SUCCESS: '下载成功',
  EXPORT_SUCCESS: '导出成功',
  IMPORT_SUCCESS: '导入成功',
  SYNC_SUCCESS: '同步成功',
  PROCESS_SUCCESS: '处理成功'
}

// 正则表达式
export const REGEX_PATTERNS = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  BANK_CARD: /^\d{16,19}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^.{6,}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  CHINESE_NAME: /^[\u4e00-\u9fa5]{2,10}$/,
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  NON_NEGATIVE_INTEGER: /^(0|[1-9]\d*)$/,
  POSITIVE_NUMBER: /^(0\.\d+|[1-9]\d*(\.\d+)?)$/,
  NON_NEGATIVE_NUMBER: /^(0|0\.\d+|[1-9]\d*(\.\d+)?)$/
}