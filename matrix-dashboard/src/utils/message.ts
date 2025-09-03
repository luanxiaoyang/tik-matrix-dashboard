/**
 * 全局消息提示工具
 */

import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { MessageOptions } from 'element-plus'
import type { NotificationOptions } from 'element-plus'

// 消息类型
type MessageType = 'success' | 'warning' | 'info' | 'error'

// 确认对话框选项
interface ConfirmOptions {
  title?: string
  message?: string
  type?: MessageType
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
}

/**
 * 成功消息
 */
export function successMessage(message: string, options?: Partial<MessageOptions>) {
  return ElMessage.success({
    message,
    duration: 3000,
    showClose: true,
    ...options
  })
}

/**
 * 错误消息
 */
export function errorMessage(message: string, options?: Partial<MessageOptions>) {
  return ElMessage.error({
    message,
    duration: 5000,
    showClose: true,
    ...options
  })
}

/**
 * 警告消息
 */
export function warningMessage(message: string, options?: Partial<MessageOptions>) {
  return ElMessage.warning({
    message,
    duration: 4000,
    showClose: true,
    ...options
  })
}

/**
 * 信息消息
 */
export function infoMessage(message: string, options?: Partial<MessageOptions>) {
  return ElMessage.info({
    message,
    duration: 3000,
    showClose: true,
    ...options
  })
}

/**
 * 加载消息
 */
export function loadingMessage(message = '加载中...', options?: Partial<MessageOptions>) {
  return ElMessage({
    message,
    duration: 0,
    showClose: false,
    ...options
  })
}

/**
 * 确认对话框
 */
export function confirmDialog(
  message: string,
  title = '确认操作',
  options?: ConfirmOptions
): Promise<any> {
  return ElMessageBox.confirm(
    message,
    title,
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancelButton: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      ...options
    }
  )
}

/**
 * 删除确认对话框
 */
export function deleteConfirm(
  message = '此操作将永久删除该数据，是否继续？',
  title = '删除确认'
): Promise<any> {
  return confirmDialog(message, title, {
    type: 'error',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
}

/**
 * 提示对话框
 */
export function alertDialog(
  message: string,
  title = '提示',
  type: MessageType = 'info'
): Promise<any> {
  return ElMessageBox.alert(message, title, {
    type,
    confirmButtonText: '确定',
    closeOnClickModal: false,
    closeOnPressEscape: false
  })
}

/**
 * 输入对话框
 */
export function promptDialog(
  message: string,
  title = '请输入',
  options?: {
    inputValue?: string
    inputPlaceholder?: string
    inputPattern?: RegExp
    inputErrorMessage?: string
    inputValidator?: (value: string) => boolean | string
  }
): Promise<any> {
  return ElMessageBox.prompt(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    closeOnPressEscape: false,
    ...options
  })
}

/**
 * 成功通知
 */
export function successNotify(
  title: string,
  message?: string,
  options?: Partial<NotificationOptions>
) {
  return ElNotification.success({
    title,
    message,
    duration: 4000,
    showClose: true,
    ...options
  })
}

/**
 * 错误通知
 */
export function errorNotify(
  title: string,
  message?: string,
  options?: Partial<NotificationOptions>
) {
  return ElNotification.error({
    title,
    message,
    duration: 6000,
    showClose: true,
    ...options
  })
}

/**
 * 警告通知
 */
export function warningNotify(
  title: string,
  message?: string,
  options?: Partial<NotificationOptions>
) {
  return ElNotification.warning({
    title,
    message,
    duration: 5000,
    showClose: true,
    ...options
  })
}

/**
 * 信息通知
 */
export function infoNotify(
  title: string,
  message?: string,
  options?: Partial<NotificationOptions>
) {
  return ElNotification.info({
    title,
    message,
    duration: 4000,
    showClose: true,
    ...options
  })
}

/**
 * 操作成功提示
 */
export function operationSuccess(operation = '操作') {
  return successMessage(`${operation}成功`)
}

/**
 * 操作失败提示
 */
export function operationError(operation = '操作', error?: string) {
  const message = error ? `${operation}失败：${error}` : `${operation}失败`
  return errorMessage(message)
}

/**
 * 网络错误提示
 */
export function networkError(message = '网络连接异常，请检查网络设置') {
  return errorMessage(message)
}

/**
 * 权限不足提示
 */
export function permissionDenied(message = '权限不足，无法执行此操作') {
  return warningMessage(message)
}

/**
 * 数据加载失败提示
 */
export function loadDataError(message = '数据加载失败，请刷新重试') {
  return errorMessage(message)
}

/**
 * 表单验证失败提示
 */
export function validationError(message = '请检查表单输入是否正确') {
  return warningMessage(message)
}

/**
 * 文件上传成功提示
 */
export function uploadSuccess(filename?: string) {
  const message = filename ? `文件 ${filename} 上传成功` : '文件上传成功'
  return successMessage(message)
}

/**
 * 文件上传失败提示
 */
export function uploadError(error?: string) {
  const message = error ? `文件上传失败：${error}` : '文件上传失败'
  return errorMessage(message)
}

/**
 * 复制成功提示
 */
export function copySuccess(content = '内容') {
  return successMessage(`${content}已复制到剪贴板`)
}

/**
 * 复制失败提示
 */
export function copyError() {
  return errorMessage('复制失败，请手动复制')
}

/**
 * 导出成功提示
 */
export function exportSuccess(filename?: string) {
  const message = filename ? `文件 ${filename} 导出成功` : '导出成功'
  return successMessage(message)
}

/**
 * 导出失败提示
 */
export function exportError(error?: string) {
  const message = error ? `导出失败：${error}` : '导出失败'
  return errorMessage(message)
}

/**
 * 批量操作确认
 */
export function batchOperationConfirm(
  operation: string,
  count: number,
  itemName = '项'
): Promise<any> {
  return confirmDialog(
    `确定要${operation} ${count} ${itemName}数据吗？`,
    `批量${operation}确认`,
    {
      type: 'warning'
    }
  )
}

/**
 * 批量删除确认
 */
export function batchDeleteConfirm(count: number, itemName = '项'): Promise<any> {
  return deleteConfirm(
    `此操作将永久删除选中的 ${count} ${itemName}数据，是否继续？`,
    '批量删除确认'
  )
}