import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { ApiResponse } from '@/types/business'

/**
 * 创建axios实例
 */
const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('Axios request interceptor:', config.method?.toUpperCase(), config.url, config.data)
    
    // 安全获取token，避免在store未初始化时出错
    const token = localStorage.getItem('access_token')
    
    // 添加认证token
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 是否正在刷新token
let isRefreshing = false
// 失败请求队列
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

/**
 * 处理队列中的请求
 * @param error 错误信息
 * @param token 新token
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('Axios response interceptor:', response.status, response.config.url, response.data)
    const { code, message, data } = response.data
    
    // 成功响应
    if (code === 200) {
      return response
    }
    
    // 业务错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  async (error) => {
    const { response, config } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 如果是刷新token的请求失败，直接登出
          if (config.url?.includes('/auth/refresh')) {
            ElMessage.error('登录已过期，请重新登录')
            // 清除本地存储的token
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            router.push('/login')
            return Promise.reject(error)
          }
          
          // 如果正在刷新token，将请求加入队列
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then(() => {
              // 重新发送原请求
              return service(config)
            }).catch(err => {
              return Promise.reject(err)
            })
          }
          
          // 开始刷新token
          isRefreshing = true
          
          try {
            // 安全获取userStore
            const userStore = useUserStore()
            await userStore.refreshTokenAction()
            const newToken = localStorage.getItem('access_token')
            processQueue(null, newToken)
            // 重新发送原请求
            return service(config)
          } catch (refreshError) {
            processQueue(refreshError, null)
            ElMessage.error('登录已过期，请重新登录')
            // 清除本地存储的token
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            router.push('/login')
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
          
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络设置')
    }
    
    return Promise.reject(error)
  }
)

/**
 * 通用请求方法
 */
export const request = {
  get<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return service.get(url, { params })
  },
  
  post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return service.post(url, data)
  },
  
  put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return service.put(url, data)
  },
  
  patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return service.patch(url, data)
  },
  
  delete<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return service.delete(url, { params })
  }
}

export default service