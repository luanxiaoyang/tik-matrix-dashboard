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
  baseURL: '/api',
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
    const userStore = useUserStore()
    
    // 添加认证token
    if (userStore.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('Axios response interceptor:', response.status, response.config.url, response.data)
    const { code, msg, data } = response.data
    
    // 成功响应
    if (code === 200) {
      return response
    }
    
    // 业务错误
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录页
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
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
          ElMessage.error(data?.msg || `请求失败 (${status})`)
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