import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest } from '@/types/api'
import { login, getProfile, logout } from '@/api/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const accessToken = ref<string>('')
  const refreshToken = ref<string>('')
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userRoles = computed(() => user.value?.roles || [])
  // 获取用户权限列表
  const userPermissions = computed(() => {
    if (!user.value?.roles) return []
    return user.value.roles.reduce((permissions: string[], role) => {
      if (role.permissions) {
        // 后端返回的permissions是字符串数组，直接使用
        permissions.push(...role.permissions)
      }
      return permissions
    }, [])
  })

  /**
   * 用户登录
   * @param loginData 登录数据
   */
  const userLogin = async (loginData: LoginRequest) => {
    try {
      isLoading.value = true
      const response = await login(loginData)
      
      // 保存用户信息和token
      user.value = response.data.user
      accessToken.value = response.data.accessToken
      refreshToken.value = response.data.refreshToken
      
      // 保存到localStorage
      localStorage.setItem('access_token', response.data.accessToken)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      localStorage.setItem('user_info', JSON.stringify(response.data.user))
      
      ElMessage.success('登录成功')
      
      // 跳转到首页
      router.push('/')
      
      return response
    } catch (error) {
      // 登录失败
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取用户信息
   */
  const fetchUserProfile = async () => {
    try {
      const response = await getProfile()
      user.value = response.data
      localStorage.setItem('user_info', JSON.stringify(response.data))
      return response
    } catch (error) {
      // 获取用户信息失败
      // 如果获取用户信息失败，清除本地存储
      clearAuth()
      throw error
    }
  }

  /**
   * 用户退出登录
   */
  const userLogout = async () => {
    try {
      await logout()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // 退出登录失败
    } finally {
      clearAuth()
      ElMessage.success('已退出登录')
      router.push('/login')
    }
  }

  /**
   * 清除认证信息
   */
  const clearAuth = () => {
    user.value = null
    accessToken.value = ''
    refreshToken.value = ''
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
  }

  /**
   * 从localStorage恢复认证状态
   */
  const restoreAuth = () => {
    const token = localStorage.getItem('access_token')
    const refresh = localStorage.getItem('refresh_token')
    const userInfo = localStorage.getItem('user_info')
    
    if (token && refresh && userInfo) {
      accessToken.value = token
      refreshToken.value = refresh
      try {
        user.value = JSON.parse(userInfo)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // 解析用户信息失败
        clearAuth()
      }
    }
  }

  /**
   * 设置用户信息
   * @param userData 用户数据
   */
  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user_info', JSON.stringify(userData))
  }

  /**
   * 设置访问令牌
   * @param access 访问令牌
   * @param refresh 刷新令牌
   */
  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  /**
   * 检查用户是否有指定权限
   * @param permission 权限代码
   * @returns 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    return userPermissions.value.includes(permission)
  }

  /**
   * 检查用户是否有指定角色
   * @param roleCode 角色代码
   * @returns 是否有角色
   */
  const hasRole = (roleCode: string): boolean => {
    return userRoles.value.some(role => role.code === roleCode)
  }

  return {
    // 状态
    user,
    accessToken,
    refreshToken,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    userRoles,
    userPermissions,
    
    // 方法
    userLogin,
    fetchUserProfile,
    userLogout,
    clearAuth,
    restoreAuth,
    setUser,
    setTokens,
    hasPermission,
    hasRole
  }
})