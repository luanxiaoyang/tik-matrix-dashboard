import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo, logout, refreshToken } from '@/api/auth'
import type { LoginParams, UserInfo, RefreshTokenParams } from '@/types/auth'

/**
 * Token存储键名
 */
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const accessToken = ref<string>(localStorage.getItem(ACCESS_TOKEN_KEY) || '')
  const refreshTokenValue = ref<string>(localStorage.getItem(REFRESH_TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!accessToken.value && !!userInfo.value)
  const userRoles = computed(() => userInfo.value?.roles || [])
  const userPermissions = computed(() => userInfo.value?.permissions || [])
  
  /**
   * 检查是否有指定权限
   * @param permission 权限代码或权限代码数组
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.value.includes(p))
    }
    return userPermissions.value.includes(permission)
  }
  
  /**
   * 检查是否有指定角色
   * @param roleCode 角色代码
   */
  const hasRole = (roleCode: string): boolean => {
    return userRoles.value.some(role => role.code === roleCode)
  }
  
  /**
   * 登录
   * @param params 登录参数
   */
  const loginAction = async (params: LoginParams) => {
    try {
      const response = await login(params)
      const { user, accessToken: token, refreshToken } = response.data.data
      
      // 保存令牌和用户信息
      accessToken.value = token
      refreshTokenValue.value = refreshToken
      userInfo.value = user
      
      // 保存到本地存储
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      
      return response
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 刷新访问令牌
   */
  const refreshTokenAction = async () => {
    try {
      if (!refreshTokenValue.value) {
        throw new Error('No refresh token available')
      }
      
      const response = await refreshToken({ refreshToken: refreshTokenValue.value })
      const { accessToken: token, refreshToken: newRefreshToken } = response.data.data
      
      // 更新令牌
      accessToken.value = token
      refreshTokenValue.value = newRefreshToken
      
      // 更新本地存储
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
      
      return response
    } catch (error) {
      // 刷新失败，清除所有信息
      await logoutAction()
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
  const logoutAction = async () => {
    try {
      if (refreshTokenValue.value) {
        await logout({ refreshToken: refreshTokenValue.value })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 清除所有状态
      clearUserState()
    }
  }
  
  /**
   * 清除用户状态
   */
  const clearUserState = () => {
    accessToken.value = ''
    refreshTokenValue.value = ''
    userInfo.value = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
  
  /**
   * 检查是否是管理员
   */
  const isAdmin = computed(() => {
    return hasRole('admin')
  })
  
  /**
   * 检查是否是运营人员
   */
  const isOps = computed(() => {
    return hasRole('ops')
  })
  
  /**
   * 检查是否是分析师
   */
  const isAnalyst = computed(() => {
    return hasRole('analyst')
  })
  
  /**
   * 检查是否是只读用户
   */
  const isViewer = computed(() => {
    return hasRole('viewer')
  })

  /**
   * 检查是否是超级管理员
   */
  const isSuperAdmin = computed(() => {
    return hasRole('super_admin') || userInfo.value?.roles?.some(role => role.code === 'super_admin') || false
  })
  
  return {
    // 状态
    accessToken,
    refreshTokenValue,
    userInfo,
    isLoggedIn,
    userRoles,
    userPermissions,
    
    // 计算属性
    isAdmin,
    isOps,
    isAnalyst,
    isViewer,
    isSuperAdmin,
    
    // 方法
    loginAction,
    refreshTokenAction,
    getUserInfoAction,
    logoutAction,
    clearUserState,
    hasPermission,
    hasRole,
    
    // 兼容性别名
    login: loginAction,
    getUserInfo: getUserInfoAction,
    logout: logoutAction
  }
})