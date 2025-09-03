/**
 * 类型转换工具函数
 */

import type { ElTagType } from '@/types/element-plus'
import type { Account, AccountInfo, Conversion, ConversionRecord, ApiResponse } from '@/types/business'

/**
 * 将API响应的Account转换为AccountInfo
 * @param account API响应的Account数据
 * @returns AccountInfo对象
 */
export function convertAccountToAccountInfo(account: Account): AccountInfo {
  return {
    id: account.id,
    phone: account.phoneNo,
    phoneNo: account.phoneNo,
    accountUrl: account.accountLink,
    accountLink: account.accountLink,
    owner: account.ownerId,
    ownerId: account.ownerId,
    creator: account.createdBy,
    createdBy: account.createdBy,
    status: account.status,
    remark: '',
    createdAt: account.createdAt,
    updatedAt: account.createdAt,
    stats: account.stats,
    lastRechargeFeature: account.lastRechargeFeature
  }
}

/**
 * 将API响应的Conversion转换为ConversionRecord
 * @param conversion API响应的Conversion数据
 * @returns ConversionRecord对象
 */
export function convertConversionToRecord(conversion: Conversion): ConversionRecord {
  return {
    id: conversion.id,
    phone: conversion.phoneNo,
    accountUrl: conversion.accountBrief?.accountLink || '',
    accountId: conversion.accountId,
    conversionType: 'register',
    status: 'success',
    submitter: conversion.createdBy,
    submittedAt: conversion.createdAt,
    processedAt: conversion.createdAt,
    processor: conversion.createdBy
  }
}

/**
 * 状态到ElementPlus Tag类型的转换
 * @param status 状态字符串
 * @returns ElementPlus Tag类型
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
 * 操作类型到ElementPlus Tag类型的转换
 * @param operationType 操作类型字符串
 * @returns ElementPlus Tag类型
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

/**
 * 转化类型到ElementPlus Tag类型的转换
 * @param conversionType 转化类型字符串
 * @returns ElementPlus Tag类型
 */
export function getConversionTypeTagType(conversionType: string): ElTagType {
  switch (conversionType?.toLowerCase()) {
    case 'register':
      return 'success'
    case 'recharge':
      return 'primary'
    case 'withdraw':
      return 'warning'
    default:
      return 'info'
  }
}

/**
 * 安全的日期时间格式化
 * @param dateTime 日期时间字符串
 * @returns 格式化后的日期时间字符串
 */
export function safeFormatDateTime(dateTime?: string): string {
  if (!dateTime) return '-'
  try {
    return new Date(dateTime).toLocaleString('zh-CN')
  } catch {
    return dateTime
  }
}