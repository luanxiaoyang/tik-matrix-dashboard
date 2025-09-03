import type { App, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 角色权限指令实现
 * @param el 元素
 * @param binding 绑定值
 */
function checkRole(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
  const { value } = binding
  const userStore = useUserStore()
  
  if (value) {
    let hasPermission = false
    
    if (Array.isArray(value)) {
      // 数组形式：用户需要拥有其中任意一个角色
      hasPermission = value.some(role => userStore.hasRole(role))
    } else {
      // 单个角色
      hasPermission = userStore.hasRole(value)
    }
    
    if (!hasPermission) {
      // 移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 角色权限指令
 * 用法：v-role="'admin'" 或 v-role="['admin', 'ops']"
 */
const roleDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkRole(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkRole(el, binding)
  }
}

/**
 * 权限指令实现
 * @param el 元素
 * @param binding 绑定值
 */
function checkPermissions(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
  const { value } = binding
  const userStore = useUserStore()
  
  if (value) {
    let hasPermission = false
    
    if (Array.isArray(value)) {
      // 数组形式：用户需要拥有其中任意一个权限
      hasPermission = value.some(permission => userStore.hasPermission(permission))
    } else {
      // 单个权限
      hasPermission = userStore.hasPermission(value)
    }
    
    if (!hasPermission) {
      // 移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 权限指令
 * 用法：v-permission="'user:create'" 或 v-permission="['user:create', 'user:update']"
 */
const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkPermissions(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkPermissions(el, binding)
  }
}

/**
 * 注册权限指令
 * @param app Vue应用实例
 */
export function setupPermissionDirectives(app: App) {
  app.directive('role', roleDirective)
  app.directive('permission', permissionDirective)
}