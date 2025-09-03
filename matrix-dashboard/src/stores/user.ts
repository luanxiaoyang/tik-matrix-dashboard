import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo } from '@/api/auth'
import type { LoginParams, UserInfo, UserRole } from '@/types/auth'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  
  /**
   * 登录
   * @param params 登录参数
   */
  const loginAction = async (params: LoginParams) => {
    try {
      const response = await login(params)
      const { token: newToken, userInfo: info } = response.data.data
      
      token.value = newToken
      userInfo.value = info
      
      // 保存到本地存储
      localStorage.setItem('token', newToken)
      
      return response
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 获取用户信息
   */
  const getUserInfoAction = async () => {
    try {
      const response = await getUserInfo()
      userInfo.value = response.data.data
      return response
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 登出
   */
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }
  
  /**
   * 检查用户权限
   * @param permission 权限标识或权限数组
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (!userInfo.value) return false
    // 这里可以根据实际需求实现权限检查逻辑
    // 目前简单返回true，实际项目中应该检查用户的权限列表
    return true
  }

  /**
   * 检查用户角色
   * @param role 角色
   */
  const hasRole = (role: UserRole): boolean => {
    if (!userInfo.value) return false
    return userInfo.value.role === role
  }
  
  /**
   * 检查是否是管理员
   */
  const isAdmin = computed(() => {
    if (!userInfo.value) return false
    return ['SUPER_ADMIN', 'CONVERSION_ADMIN'].includes(userInfo.value.role)
  })
  
  /**
   * 检查是否是超级管理员
   */
  const isSuperAdmin = computed(() => {
    if (!userInfo.value) return false
    return userInfo.value.role === 'SUPER_ADMIN'
  })
  
  return {
    token,
    userInfo,
    login: loginAction,
    loginAction,
    getUserInfo: getUserInfoAction,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    isSuperAdmin
  }
})