# 前端开发规则

## 1. 技术栈规范

### 1.1 核心技术栈
- **框架**: Vue 3.5+ (Composition API)
- **构建工具**: Vite 7.0+
- **语言**: TypeScript 5.8+
- **UI组件库**: Element Plus 2.11+
- **状态管理**: Pinia 3.0+
- **路由**: Vue Router 4.5+
- **HTTP客户端**: Axios 1.11+
- **Node.js版本**: ^20.19.0 || >=22.12.0

### 1.2 开发工具
- **代码检查**: ESLint 9.31+ (Vue TypeScript配置)
- **类型检查**: vue-tsc 3.0+
- **开发调试**: Vue DevTools 8.0+

## 2. 项目结构规范

### 2.1 目录结构
```
src/
├── api/                 # API接口定义
│   ├── auth.ts         # 认证相关接口
│   ├── user.ts         # 用户管理接口
│   └── *.ts            # 其他业务接口
├── assets/             # 静态资源
│   ├── base.css        # 基础样式
│   ├── main.css        # 主样式文件
│   └── *.svg           # 图标资源
├── components/         # 公共组件
│   ├── icons/          # 图标组件
│   └── *.vue           # 通用组件
├── router/             # 路由配置
│   └── index.ts        # 路由定义
├── stores/             # 状态管理
│   ├── auth.ts         # 认证状态
│   └── *.ts            # 其他状态模块
├── types/              # 类型定义
│   └── api.ts          # API类型定义
├── utils/              # 工具函数
│   ├── request.ts      # HTTP请求封装
│   └── *.ts            # 其他工具函数
├── views/              # 页面组件
│   ├── *View.vue       # 页面组件
│   └── *Management.vue # 管理页面
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

### 2.2 文件命名规范
- **组件文件**: 使用PascalCase，如 `UserManagement.vue`
- **页面文件**: 以View结尾，如 `DashboardView.vue`
- **工具文件**: 使用camelCase，如 `request.ts`
- **类型文件**: 使用camelCase，如 `api.ts`

## 3. 代码规范

### 3.1 TypeScript规范

#### 3.1.1 类型定义
```typescript
// ✅ 正确：使用interface定义对象类型
export interface User {
  id: number
  username: string
  email: string
  status: 'active' | 'inactive' | 'banned'
  roles?: Role[]
  createdAt: string
}

// ✅ 正确：使用泛型定义通用类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
```

#### 3.1.2 函数注释规范
```typescript
/**
 * 获取用户列表
 * @param params 查询参数
 * @returns Promise<ApiResponse<PaginationResponse<User>>> 用户列表响应
 */
export const getUserList = (params: GetUsersParams) => {
  return request.get<ApiResponse<PaginationResponse<User>>>('/users', { params })
}
```

### 3.2 Vue组件规范

#### 3.2.1 组件结构
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入语句
import { ref, reactive, computed, onMounted } from 'vue'
import type { User } from '@/types/api'

// 类型定义
interface SearchForm {
  username: string
  email: string
  status: string
}

// 响应式数据
const loading = ref(false)
const searchForm = reactive<SearchForm>({
  username: '',
  email: '',
  status: ''
})

// 计算属性
const filteredData = computed(() => {
  // 计算逻辑
})

// 方法定义
const handleSearch = () => {
  // 搜索逻辑
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
/* 组件样式 */
</style>
```

#### 3.2.2 组件命名和导入
```typescript
// ✅ 正确：使用PascalCase命名组件
const UserManagement = defineComponent({
  name: 'UserManagement'
})

// ✅ 正确：路由懒加载
component: () => import('../views/UserManagement.vue')
```

### 3.3 API调用规范

#### 3.3.1 请求封装
```typescript
// utils/request.ts
import axios, { type AxiosResponse, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:1106/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：添加认证token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    // 错误处理逻辑
    return Promise.reject(error)
  }
)
```

#### 3.3.2 API接口定义
```typescript
// api/user.ts
import request from '@/utils/request'
import type { User, CreateUserRequest, ApiResponse } from '@/types/api'

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表
 */
export const getUserList = (params: GetUsersParams) => {
  return request.get<ApiResponse<PaginationResponse<User>>>('/users', { params })
}
```

## 4. 开发流程规范

### 4.1 端口配置
- **前端开发服务器**: 必须运行在 **5818 端口**
- **后端API服务器**: 必须运行在 **1106 端口**
- 端口被占用时，必须先结束占用进程

### 4.2 环境变量配置
```bash
# .env.example
VITE_API_BASE_URL=http://localhost:1106/api
VITE_HOST=localhost
VITE_PORT=5818
VITE_API_TIMEOUT=10000
VITE_APP_VERSION=1.0.0
```

### 4.3 开发命令
```bash
# 开发环境启动
npm run dev

# 类型检查
npm run type-check

# 代码检查和修复
npm run lint

# 构建生产版本
npm run build
```

## 5. 路由和权限规范

### 5.1 路由配置
```typescript
// router/index.ts
const routes = [
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UserManagement.vue'),
    meta: {
      title: '用户管理',
      requiresAuth: true,
      permission: 'user:read'
    }
  }
]
```

### 5.2 权限控制
```typescript
// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    ElMessage.error('没有访问权限')
    next(false)
    return
  }
  
  next()
})
```

## 6. 状态管理规范

### 6.1 Store结构
```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import type { User } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  
  // 方法
  const login = async (credentials: LoginRequest) => {
    // 登录逻辑
  }
  
  const logout = () => {
    // 登出逻辑
  }
  
  const hasPermission = (permission: string) => {
    // 权限检查逻辑
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasPermission
  }
})
```

## 7. 样式规范

### 7.1 CSS类命名
```scss
// ✅ 正确：使用kebab-case
.user-management {
  .page-header {
    .header-left {}
    .header-right {}
  }
  
  .search-card {}
  .table-card {}
}
```

### 7.2 组件样式作用域
```vue
<style scoped>
/* 组件内部样式，使用scoped避免样式污染 */
.user-management {
  padding: 20px;
}
</style>
```

## 8. 错误处理规范

### 8.1 API错误处理
```typescript
// 统一错误处理
const handleApiError = (error: AxiosError) => {
  if (error.response) {
    const { status, data } = error.response
    switch (status) {
      case 401:
        ElMessage.error('登录已过期，请重新登录')
        // 跳转到登录页
        break
      case 403:
        ElMessage.error('没有访问权限')
        break
      case 500:
        ElMessage.error('服务器内部错误')
        break
      default:
        ElMessage.error(data?.message || '请求失败')
    }
  } else {
    ElMessage.error('网络连接失败')
  }
}
```

### 8.2 组件错误边界
```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { ElMessage } from 'element-plus'

// 捕获子组件错误
onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error, info)
  ElMessage.error('页面加载失败，请刷新重试')
  return false
})
</script>
```

## 9. 性能优化规范

### 9.1 组件懒加载
```typescript
// 路由懒加载
component: () => import('../views/UserManagement.vue')

// 组件异步加载
const AsyncComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
```

### 9.2 列表优化
```vue
<template>
  <!-- 使用v-memo优化列表渲染 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.status]">
    {{ item.name }}
  </div>
</template>
```

## 10. 测试规范

### 10.1 组件测试
```typescript
// 使用Vitest进行单元测试
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserManagement from '@/views/UserManagement.vue'

describe('UserManagement', () => {
  it('should render correctly', () => {
    const wrapper = mount(UserManagement)
    expect(wrapper.find('.user-management').exists()).toBe(true)
  })
})
```

## 11. 代码质量控制

### 11.1 禁止事项
- **禁止存在未使用的代码元素**：变量、方法、组件、事件、指令、过滤器、插件
- **禁止直接修改props**：使用computed或emit事件
- **禁止在模板中使用复杂逻辑**：提取到computed或methods中
- **禁止忽略TypeScript类型检查**：避免使用any类型

### 11.2 必须遵循
- **必须为所有函数添加JSDoc注释**
- **必须使用TypeScript严格模式**
- **必须遵循ESLint规则**
- **必须进行代码review**

## 12. 版本控制规范

### 12.1 提交信息格式
```
type(scope): description

# 类型说明：
# feat: 新功能
# fix: 修复bug
# docs: 文档更新
# style: 代码格式调整
# refactor: 代码重构
# test: 测试相关
# chore: 构建过程或辅助工具的变动

# 示例：
feat(user): add user management page
fix(auth): fix login token expiration issue
```

### 12.2 分支管理
- **main**: 主分支，用于生产环境
- **develop**: 开发分支，用于集成测试
- **feature/***: 功能分支，用于新功能开发
- **hotfix/***: 热修复分支，用于紧急修复

## 13. 部署规范

### 13.1 构建配置
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境关闭sourcemap
    minify: 'terser',
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
```

### 13.2 环境配置
- **开发环境**: `.env.development`
- **测试环境**: `.env.test`
- **生产环境**: `.env.production`

---

## 更新日志

### v1.0.0 (2024-12-19)
- 初始版本发布
- 建立基础开发规范
- 定义项目结构和代码规范
- 制定开发流程和质量控制标准

---

**注意事项**：
1. 本规范基于当前项目技术栈制定，随着技术栈升级可能需要更新
2. 所有开发人员必须严格遵循本规范
3. 如需修改规范，需经过团队讨论和评审
4. 定期review和更新规范内容，确保与最佳实践保持一致