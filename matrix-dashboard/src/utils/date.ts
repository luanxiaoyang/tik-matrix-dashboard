/**
 * 日期时间工具函数
 */

import { DATE_FORMATS } from '@/constants'

/**
 * 格式化日期时间
 * @param date 日期对象、时间戳或日期字符串
 * @param format 格式字符串
 */
export function formatDateTime(
  date: Date | number | string,
  format = DATE_FORMATS.DATETIME
): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param date 日期对象、时间戳或日期字符串
 */
export function formatDate(date: Date | number | string): string {
  return formatDateTime(date, DATE_FORMATS.DATE)
}

/**
 * 格式化时间
 * @param date 日期对象、时间戳或日期字符串
 */
export function formatTime(date: Date | number | string): string {
  return formatDateTime(date, DATE_FORMATS.TIME)
}

/**
 * 格式化月份
 * @param date 日期对象、时间戳或日期字符串
 */
export function formatMonth(date: Date | number | string): string {
  return formatDateTime(date, DATE_FORMATS.MONTH)
}

/**
 * 格式化年份
 * @param date 日期对象、时间戳或日期字符串
 */
export function formatYear(date: Date | number | string): string {
  return formatDateTime(date, DATE_FORMATS.YEAR)
}

/**
 * 获取相对时间描述
 * @param date 日期对象、时间戳或日期字符串
 */
export function getRelativeTime(date: Date | number | string): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 判断是否为今天
 * @param date 日期对象、时间戳或日期字符串
 */
export function isToday(date: Date | number | string): boolean {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

/**
 * 判断是否为昨天
 * @param date 日期对象、时间戳或日期字符串
 */
export function isYesterday(date: Date | number | string): boolean {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  )
}

/**
 * 判断是否为本周
 * @param date 日期对象、时间戳或日期字符串
 */
export function isThisWeek(date: Date | number | string): boolean {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return d >= startOfWeek && d <= endOfWeek
}

/**
 * 判断是否为本月
 * @param date 日期对象、时间戳或日期字符串
 */
export function isThisMonth(date: Date | number | string): boolean {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth()
  )
}

/**
 * 判断是否为本年
 * @param date 日期对象、时间戳或日期字符串
 */
export function isThisYear(date: Date | number | string): boolean {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
}

/**
 * 获取日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function getDateRange(
  startDate: Date | number | string,
  endDate: Date | number | string
): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  
  if (start === end) {
    return start
  }
  
  return `${start} ~ ${end}`
}

/**
 * 获取时间差描述
 * @param startDate 开始时间
 * @param endDate 结束时间
 */
export function getTimeDuration(
  startDate: Date | number | string,
  endDate: Date | number | string
): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return ''
  }
  
  const diff = Math.abs(end.getTime() - start.getTime())
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((diff % (60 * 1000)) / 1000)
  
  const parts: string[] = []
  
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds}秒`)
  
  return parts.join('') || '0秒'
}

/**
 * 获取本周开始和结束日期
 */
export function getThisWeekRange(): [Date, Date] {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return [startOfWeek, endOfWeek]
}

/**
 * 获取本月开始和结束日期
 */
export function getThisMonthRange(): [Date, Date] {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return [startOfMonth, endOfMonth]
}

/**
 * 获取本年开始和结束日期
 */
export function getThisYearRange(): [Date, Date] {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  
  return [startOfYear, endOfYear]
}

/**
 * 获取最近N天的日期范围
 * @param days 天数
 */
export function getRecentDaysRange(days: number): [Date, Date] {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  
  const start = new Date(end)
  start.setDate(end.getDate() - days + 1)
  start.setHours(0, 0, 0, 0)
  
  return [start, end]
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 数字
 * @param separator 分隔符
 */
export function formatNumber(num: number | string, separator = ','): string {
  const numStr = num.toString()
  const parts = numStr.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return parts.join('.')
}

/**
 * 格式化金额
 * @param amount 金额
 * @param currency 货币符号
 * @param decimals 小数位数
 */
export function formatCurrency(
  amount: number | string,
  currency = '¥',
  decimals = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${currency}0.00`
  
  return `${currency}${formatNumber(num.toFixed(decimals))}`
}

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (isNaN(value)) return '0%'
  return `${(value * 100).toFixed(decimals)}%`
}