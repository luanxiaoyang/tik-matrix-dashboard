import type { App, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types/auth'

/**
 * 权限指令
 * 使用方法：v-permission="['permission1', 'permission2']"
 * 或者：v-permission="'single_permission'"
 */
export const permission = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value) {
      const permissions = Array.isArray(value) ? value : [value]
      const hasPermission = permissions.some(permission => 
        userStore.hasPermission(permission)
      )
      
      if (!hasPermission) {
        el.style.display = 'none'
        // 或者完全移除元素
        // el.parentNode?.removeChild(el)
      }
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value) {
      const permissions = Array.isArray(value) ? value : [value]
      const hasPermission = permissions.some(permission => 
        userStore.hasPermission(permission)
      )
      
      if (hasPermission) {
        el.style.display = ''
      } else {
        el.style.display = 'none'
      }
    }
  }
}

/**
 * 角色指令
 * 使用方法：v-role="['ADMIN', 'USER']"
 * 或者：v-role="'ADMIN'"
 */
export const role = {
  mounted(el: HTMLElement, binding: DirectiveBinding<UserRole | UserRole[]>) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value) {
      const roles = Array.isArray(value) ? value : [value]
      const hasRole = roles.some(role => 
        userStore.hasRole(role)
      )
      
      if (!hasRole) {
        el.style.display = 'none'
      }
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<UserRole | UserRole[]>) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value) {
      const roles = Array.isArray(value) ? value : [value]
      const hasRole = roles.some(role => 
        userStore.hasRole(role)
      )
      
      if (hasRole) {
        el.style.display = ''
      } else {
        el.style.display = 'none'
      }
    }
  }
}

/**
 * 注册权限指令
 */
export function setupPermissionDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('role', role)
}

// 兼容旧的导入方式
export const installDirectives = setupPermissionDirectives

export default {
  permission,
  role,
  install: setupPermissionDirectives
}