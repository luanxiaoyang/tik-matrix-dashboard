/**
 * Element Plus 组件类型扩展
 */

// Element Plus Tag 组件的 type 属性类型
export type ElTagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

// Element Plus Button 组件的 type 属性类型
export type ElButtonType = 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'text'

// Element Plus Alert 组件的 type 属性类型
export type ElAlertType = 'success' | 'warning' | 'info' | 'error'

/**
 * 状态到 Element Plus Tag 类型的映射函数
 * @param status 状态字符串
 * @returns Element Plus Tag 类型
 */
export function getStatusTagType(status: string): ElTagType {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'success':
    case 'completed':
      return 'success'
    case 'pending':
    case 'processing':
      return 'warning'
    case 'failed':
    case 'error':
    case 'disabled':
      return 'danger'
    case 'info':
      return 'info'
    default:
      return 'primary'
  }
}

/**
 * 操作类型到 Element Plus Tag 类型的映射函数
 * @param operationType 操作类型字符串
 * @returns Element Plus Tag 类型
 */
export function getOperationTagType(operationType: string): ElTagType {
  switch (operationType?.toLowerCase()) {
    case 'create':
    case 'add':
      return 'success'
    case 'update':
    case 'edit':
      return 'warning'
    case 'delete':
    case 'remove':
      return 'danger'
    case 'view':
    case 'read':
      return 'info'
    default:
      return 'primary'
  }
}