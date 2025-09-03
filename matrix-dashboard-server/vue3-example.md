# Vue 3 + Matrix Dashboard API 完整集成示例

> 基于Vue 3 + Composition API + Element Plus 的完整前端集成方案

## 🚀 项目初始化

### 1. 创建Vue 3项目
```bash
# 使用 Vite 创建项目
npm create vue@latest matrix-dashboard-frontend

# 选择配置
✔ Add TypeScript? Yes
✔ Add JSX Support? No  
✔ Add Vue Router for Single Page Application development? Yes
✔ Add Pinia for state management? Yes
✔ Add Vitest for Unit Testing? No
✔ Add an End-to-End Testing Solution? No
✔ Add ESLint for code quality? Yes
✔ Add Prettier for code formatting? Yes

cd matrix-dashboard-frontend
npm install
```

### 2. 安装依赖
```bash
# Element Plus UI框架
npm install element-plus @element-plus/icons-vue

# HTTP请求库 (可选，也可以使用fetch)
npm install axios

# 工具库
npm install dayjs
```

### 3. 项目配置

#### vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 代理API请求到后端
      '/api': {
        target: 'http://localhost:8008',
        changeOrigin: true,
      }
    }
  }
})
```

#### main.js
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
```

## 📁 项目结构

```
src/
├── api/                    # API相关
│   ├── client.js          # API客户端
│   └── endpoints.js       # 接口端点定义
├── components/             # 通用组件
│   ├── PermissionButton.vue
│   └── UserTable.vue
├── composables/           # 组合式函数
│   ├── useAuth.js
│   ├── useUsers.js
│   └── useRecharge.js
├── layouts/               # 布局组件
│   └── DefaultLayout.vue
├── router/                # 路由配置
│   └── index.js
├── stores/                # Pinia状态管理
│   ├── auth.js
│   └── user.js
├── utils/                 # 工具函数
│   ├── request.js
│   └── auth.js
└── views/                 # 页面组件
    ├── Login.vue
    ├── Dashboard.vue
    ├── Users.vue
    └── Recharge.vue
```

## 🔧 核心文件实现

### 1. API客户端封装

#### src/api/client.js
```javascript
import { ElMessage } from 'element-plus'

class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:8008/api'
    this.timeout = 30000
  }

  // 获取Token
  getToken() {
    return localStorage.getItem('accessToken')
  }

  // 设置Token
  setToken(token) {
    localStorage.setItem('accessToken', token)
  }

  // 清除Token
  clearToken() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // 通用请求方法
  async request(url, options = {}) {
    const { method = 'GET', body, params, headers = {} } = options

    // 构建完整URL
    let fullUrl = `${this.baseURL}${url}`
    if (params && method === 'GET') {
      const searchParams = new URLSearchParams(params)
      fullUrl += `?${searchParams.toString()}`
    }

    // 构建请求配置
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    // 添加认证头
    const token = this.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求体
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(fullUrl, config)
      const data = await response.json()

      // Token过期处理
      if (response.status === 401) {
        await this.handleTokenRefresh()
        throw new Error('认证失败，请重新登录')
      }

      // 业务错误处理
      if (data.code !== 200) {
        throw new Error(data.message || '请求失败')
      }

      return data
    } catch (error) {
      ElMessage.error(error.message)
      throw error
    }
  }

  // Token刷新处理
  async handleTokenRefresh() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      this.clearToken()
      window.location.href = '/login'
      return
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()
      if (data.code === 200) {
        this.setToken(data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
      } else {
        this.clearToken()
        window.location.href = '/login'
      }
    } catch {
      this.clearToken()
      window.location.href = '/login'
    }
  }

  // 登录
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { username, password }
    })

    if (data.code === 200) {
      this.setToken(data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
    }

    return data
  }

  // 登出
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: { refreshToken }
        })
      } catch (error) {
        console.warn('登出请求失败:', error)
      }
    }
    this.clearToken()
  }

  // 获取用户信息
  async getProfile() {
    return this.request('/auth/profile')
  }

  // 获取用户列表
  async getUsers(params = {}) {
    return this.request('/users', { params })
  }

  // 创建用户
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData
    })
  }

  // 同步充值数据
  async syncRecharge(userIds) {
    return this.request('/recharge-sync/sync', {
      method: 'POST',
      body: { userIds }
    })
  }

  // 获取充值数据列表
  async getRechargeList(params = {}) {
    return this.request('/recharge-sync/list', { params })
  }

  // 获取统计数据
  async getStats() {
    return this.request('/recharge-sync/stats')
  }
}

export const apiClient = new ApiClient()
export default apiClient
```

### 2. 认证组合式函数

#### src/composables/useAuth.js
```javascript
import { ref, computed } from 'vue'
import { apiClient } from '@/api/client'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const user = ref(null)
const loading = ref(false)

export function useAuth() {
  const router = useRouter()

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const userPermissions = computed(() => {
    if (!user.value?.roles) return []
    
    const permissions = []
    user.value.roles.forEach(role => {
      permissions.push(...(role.permissions || []))
    })
    
    return [...new Set(permissions)]
  })

  // 检查权限
  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  // 登录
  const login = async (credentials) => {
    loading.value = true
    try {
      const result = await apiClient.login(credentials.username, credentials.password)
      user.value = result.data.user
      ElMessage.success('登录成功')
      
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect || '/dashboard'
      router.push(redirect)
      
      return result
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await apiClient.logout()
      user.value = null
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    if (!apiClient.getToken()) return null
    
    loading.value = true
    try {
      const result = await apiClient.getProfile()
      user.value = result.data
      return result.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isLoggedIn,
    userPermissions,
    hasPermission,
    login,
    logout,
    fetchUserProfile
  }
}
```

### 3. 用户管理组合式函数

#### src/composables/useUsers.js
```javascript
import { ref, reactive } from 'vue'
import { apiClient } from '@/api/client'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const total = ref(0)
  
  const pagination = reactive({
    page: 1,
    limit: 10
  })

  // 获取用户列表
  const fetchUsers = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params
      }
      
      const result = await apiClient.getUsers(queryParams)
      users.value = result.data.users
      total.value = result.data.total
      
      return result
    } catch (error) {
      ElMessage.error('获取用户列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建用户
  const createUser = async (userData) => {
    try {
      const result = await apiClient.createUser(userData)
      ElMessage.success('用户创建成功')
      
      // 刷新列表
      await fetchUsers()
      
      return result
    } catch (error) {
      ElMessage.error('用户创建失败')
      throw error
    }
  }

  // 删除用户
  const deleteUser = async (userId) => {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await apiClient.request(`/users/${userId}`, { method: 'DELETE' })
      ElMessage.success('用户删除成功')
      
      // 刷新列表
      await fetchUsers()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('用户删除失败')
      }
    }
  }

  // 更新用户状态
  const updateUserStatus = async (userId, status) => {
    try {
      await apiClient.request(`/users/${userId}/status`, {
        method: 'PATCH',
        body: { status }
      })
      
      ElMessage.success('用户状态更新成功')
      await fetchUsers()
    } catch (error) {
      ElMessage.error('用户状态更新失败')
    }
  }

  // 分页改变
  const handlePageChange = (page) => {
    pagination.page = page
    fetchUsers()
  }

  const handleSizeChange = (size) => {
    pagination.limit = size
    pagination.page = 1
    fetchUsers()
  }

  return {
    users,
    loading,
    total,
    pagination,
    fetchUsers,
    createUser,
    deleteUser,
    updateUserStatus,
    handlePageChange,
    handleSizeChange
  }
}
```

### 4. 路由配置

#### src/router/index.js
```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { apiClient } from '@/api/client'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: { 
      requiresAuth: true,
      permission: 'user:read'
    }
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/Recharge.vue'),
    meta: { 
      requiresAuth: true,
      permission: 'recharge:read'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to) => {
  const token = apiClient.getToken()
  
  // 不需要认证的页面
  if (!to.meta.requiresAuth) {
    return true
  }
  
  // 检查是否已登录
  if (!token) {
    ElMessage.warning('请先登录')
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 检查权限
  if (to.meta.permission) {
    try {
      const result = await apiClient.getProfile()
      const user = result.data
      
      const permissions = []
      user.roles?.forEach(role => {
        permissions.push(...(role.permissions || []))
      })
      
      if (!permissions.includes(to.meta.permission)) {
        ElMessage.error('权限不足')
        return '/dashboard'
      }
    } catch (error) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
  }
  
  return true
})

export default router
```

### 5. 页面组件示例

#### src/views/Login.vue
```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>Matrix Dashboard 登录</h2>
      </template>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'

const formRef = ref()
const { login, loading } = useAuth()

const form = reactive({
  username: 'admin',
  password: 'admin123'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      await login(form)
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-card h2 {
  text-align: center;
  margin: 0;
  color: #303133;
}
</style>
```

#### src/views/Users.vue
```vue
<template>
  <div class="users-container">
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建用户
      </el-button>
      <el-button @click="fetchUsers()">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="users" :loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusType(row.status)"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editUser(row)">
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteUser(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.limit"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 创建用户对话框 -->
    <CreateUserDialog 
      v-model="showCreateDialog"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'
import { Plus, Refresh } from '@element-plus/icons-vue'
import CreateUserDialog from '@/components/CreateUserDialog.vue'
import dayjs from 'dayjs'

const {
  users,
  loading,
  total,
  pagination,
  fetchUsers,
  deleteUser,
  handlePageChange,
  handleSizeChange
} = useUsers()

const showCreateDialog = ref(false)

// 状态相关
const getStatusType = (status) => {
  const types = {
    'ACTIVE': 'success',
    'INACTIVE': 'danger',
    'PENDING': 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'ACTIVE': '激活',
    'INACTIVE': '禁用',
    'PENDING': '待激活'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 事件处理
const editUser = (user) => {
  // 编辑用户逻辑
  console.log('编辑用户:', user)
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  fetchUsers()
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
```

## 🎯 使用说明

### 1. 启动项目
```bash
# 启动后端 (端口8008)
cd matrix-dashboard-server
pnpm run start:dev

# 启动前端 (端口5173) 
cd matrix-dashboard-frontend
npm run dev
```

### 2. 访问地址
- 前端: http://localhost:5173
- 后端API: http://localhost:8008/api  
- Swagger文档: http://localhost:8008/docs

### 3. 默认账号
- 用户名: admin
- 密码: admin123

## 🔍 开发技巧

### 1. API调试
```javascript
// 在浏览器控制台测试API
import { apiClient } from '@/api/client'

// 测试登录
await apiClient.login('admin', 'admin123')

// 测试获取用户
await apiClient.getUsers()
```

### 2. 权限控制
```vue
<template>
  <!-- 使用v-if指令控制显示 -->
  <el-button v-if="hasPermission('user:create')">
    创建用户
  </el-button>
  
  <!-- 使用PermissionButton组件 -->
  <PermissionButton permission="user:delete">
    删除用户  
  </PermissionButton>
</template>
```

### 3. 错误处理
```javascript
// 全局错误处理
app.config.errorHandler = (error) => {
  console.error('Vue error:', error)
  ElMessage.error('系统错误，请稍后重试')
}

// API错误处理
try {
  await apiClient.createUser(userData)
} catch (error) {
  // 错误已在apiClient中处理
  console.error('创建用户失败:', error)
}
```

这个完整示例展示了如何使用Vue 3 + Composition API + Element Plus构建一个功能完整的管理后台前端，包含了认证、权限控制、用户管理等核心功能。代码结构清晰，便于维护和扩展。

---

*Happy Coding with Vue 3! 🎉*