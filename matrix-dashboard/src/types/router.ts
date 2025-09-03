import 'vue-router'
import type { UserRole } from './auth'

/**
 * 扩展路由元信息类型
 */
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: UserRole[]
    permissions?: string[]
    hidden?: boolean
    keepAlive?: boolean
  }
}