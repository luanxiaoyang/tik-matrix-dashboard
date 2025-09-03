# 🚀 Matrix Dashboard API 快速接入指南

> 面向前端开发的简化版API文档，一看就懂，一用就会！

## 🎯 快速开始

### 基本信息
- **API地址**: `http://localhost:8008/api`
- **文档地址**: `http://localhost:8008/docs` (Swagger UI)
- **认证方式**: Bearer Token

### 启动服务
```bash
pnpm run start:dev
```

---

## 🔐 认证流程

### 1️⃣ 登录获取Token
```javascript
// 登录
POST http://localhost:8008/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

// 响应
{
  "code": 200,
  "data": {
    "user": { ... },
    "accessToken": "eyJ...", // 用这个调用其他接口
    "refreshToken": "eyJ..."  // Token过期时用这个刷新
  }
}
```

### 2️⃣ 调用其他接口
```javascript
// 请求头加上认证信息
headers: {
  "Authorization": "Bearer " + accessToken
}
```

### 3️⃣ Token刷新
```javascript
// 当收到401错误时，使用refreshToken刷新
POST /api/auth/refresh
{
  "refreshToken": "eyJ..."
}
```

---

## 📱 核心接口速查

### 🏥 健康检查
```javascript
GET /api/health  // 检查服务状态，无需认证
```

### 👤 用户相关
```javascript
GET  /api/auth/profile          // 获取当前用户信息
POST /api/auth/logout           // 登出
GET  /api/users                 // 获取用户列表 (需要权限)
POST /api/users                 // 创建用户 (需要权限)
GET  /api/users/123             // 获取用户详情
PATCH /api/users/123            // 更新用户信息
DELETE /api/users/123           // 删除用户
```

### 🔑 权限管理
```javascript
GET  /api/roles                 // 获取角色列表
GET  /api/permissions           // 获取权限列表
GET  /api/permissions?tree=true // 获取权限树形结构
```

### 💰 充值数据同步
```javascript
POST /api/recharge-sync/sync                    // 同步充值数据
GET  /api/recharge-sync/list                    // 查询充值数据列表
GET  /api/recharge-sync/user/123456             // 查询指定用户充值数据
GET  /api/recharge-sync/stats                   // 获取统计信息
POST /api/recharge-sync/test/connection         // 测试连接
```

---

## 🎨 前端集成代码

### 基础请求封装
```javascript
class ApiClient {
  constructor(baseURL = 'http://localhost:8008/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  // 通用请求方法
  async request(url, options = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    // Token过期自动刷新
    if (response.status === 401 && this.token) {
      await this.refreshToken();
      return this.request(url, options);
    }

    return data;
  }

  // 登录
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.code === 200) {
      this.token = data.data.accessToken;
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }

    return data;
  }

  // 刷新Token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const data = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (data.code === 200) {
      this.token = data.data.accessToken;
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return true;
    }

    return false;
  }

  // 登出
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// 创建全局实例
const api = new ApiClient();
```

### React Hook 示例
```jsx
import { useState, useEffect } from 'react';

// 认证Hook
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.request('/auth/profile');
      if (data.code === 200) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('认证检查失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await api.login(username, password);
    if (data.code === 200) {
      setUser(data.data.user);
      return data.data.user;
    }
    throw new Error(data.message);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
}

// 用户列表Hook
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const data = await api.request(`/users?page=${page}&limit=${limit}`);
      if (data.code === 200) {
        setUsers(data.data.users);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, total, fetchUsers };
}
```

### Vue 3 Composition API 示例
```javascript
import { ref, onMounted, reactive } from 'vue';

// Vue 3 组合式函数
export function useAuth() {
  const user = ref(null);
  const loading = ref(true);
  const token = ref(localStorage.getItem('accessToken'));

  const checkAuth = async () => {
    try {
      if (!token.value) {
        loading.value = false;
        return;
      }

      const response = await fetch('http://localhost:8008/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200) {
          user.value = result.data;
        }
      }
    } catch (error) {
      console.error('认证检查失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const login = async (username, password) => {
    const response = await fetch('http://localhost:8008/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.code === 200) {
      token.value = result.data.accessToken;
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      user.value = result.data.user;
      return result.data.user;
    }
    throw new Error(result.message);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && token.value) {
      await fetch('http://localhost:8008/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ refreshToken })
      });
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    token.value = null;
    user.value = null;
  };

  onMounted(checkAuth);

  return { user, loading, token, login, logout };
}
```

---

## 📊 Vue 3 常用业务场景

### 场景1: Vue 3 用户管理页面
```javascript
// UserManagement.vue
<template>
  <div class="user-management">
    <el-button type="primary" @click="showCreateDialog = true">
      创建用户
    </el-button>
    
    <el-table :data="users" :loading="loading" style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="editUser(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 状态管理
const users = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const showCreateDialog = ref(false);

// API 调用
const fetchUsers = async (page = 1, limit = 10) => {
  loading.value = true;
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:8008/api/users?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    if (result.code === 200) {
      users.value = result.data.users;
      total.value = result.data.total;
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:8008/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    if (result.code === 200) {
      ElMessage.success('删除成功');
      await fetchUsers(currentPage.value, pageSize.value);
    }
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 事件处理
const handlePageChange = (page) => {
  fetchUsers(page, pageSize.value);
};

const getStatusType = (status) => {
  const types = {
    'ACTIVE': 'success',
    'INACTIVE': 'danger',
    'PENDING': 'warning'
  };
  return types[status] || 'info';
};

onMounted(() => {
  fetchUsers();
});
</script>
```

### 场景2: Vue 3 充值数据管理
```vue
<!-- RechargeManager.vue -->
<template>
  <div class="recharge-manager">
    <!-- 同步操作 -->
    <el-card class="sync-card">
      <template #header>
        <span>充值数据同步</span>
      </template>
      
      <el-form inline>
        <el-form-item label="用户ID">
          <el-input 
            v-model="syncForm.userIds" 
            placeholder="请输入用户ID，逗号分隔"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="syncing" 
            @click="handleSync"
          >
            同步数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-statistic title="总用户数" :value="stats.totalUsers" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="已同步" :value="stats.syncedUsers" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="价值用户" :value="stats.valuableUsers" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="百元用户" :value="stats.hundredUsers" />
      </el-col>
    </el-row>

    <!-- 数据列表 -->
    <el-table :data="rechargeList" :loading="loading">
      <el-table-column prop="uid" label="用户ID" />
      <el-table-column prop="totalRecharge" label="总充值" />
      <el-table-column prop="isValuableUser" label="价值用户">
        <template #default="{ row }">
          <el-tag :type="row.isValuableUser ? 'success' : 'info'">
            {{ row.isValuableUser ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="syncStatus" label="同步状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.syncStatus)">
            {{ row.syncStatus }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 状态管理
const rechargeList = ref([]);
const loading = ref(false);
const syncing = ref(false);
const stats = reactive({
  totalUsers: 0,
  syncedUsers: 0,
  valuableUsers: 0,
  hundredUsers: 0
});

const syncForm = reactive({
  userIds: ''
});

// API 调用
const fetchRechargeList = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8008/api/recharge-sync/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    if (result.code === 200) {
      rechargeList.value = result.data.items;
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8008/api/recharge-sync/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    if (result.code === 200) {
      Object.assign(stats, result.data);
    }
  } catch (error) {
    console.error('获取统计失败:', error);
  }
};

const handleSync = async () => {
  if (!syncForm.userIds.trim()) {
    ElMessage.warning('请输入用户ID');
    return;
  }

  syncing.value = true;
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8008/api/recharge-sync/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userIds: syncForm.userIds })
    });
    
    const result = await response.json();
    if (result.code === 200) {
      ElMessage.success(`同步成功: ${result.data.syncedCount} 个用户`);
      await fetchRechargeList();
      await fetchStats();
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    ElMessage.error('同步失败');
  } finally {
    syncing.value = false;
  }
};

const getStatusType = (status) => {
  const types = {
    'success': 'success',
    'failed': 'danger',
    'pending': 'warning'
  };
  return types[status] || 'info';
};

onMounted(() => {
  fetchRechargeList();
  fetchStats();
});
</script>
```

### 场景3: Vue 3 权限控制
```vue
<!-- PermissionButton.vue -->
<template>
  <el-button 
    v-if="hasPermission" 
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  permission: {
    type: String,
    required: true
  }
});

defineEmits(['click']);

// 从父组件注入用户信息
const user = inject('currentUser', null);

const hasPermission = computed(() => {
  if (!user?.value || !props.permission) return false;
  
  const permissions = [];
  user.value.roles?.forEach(role => {
    permissions.push(...(role.permissions || []));
  });
  
  return permissions.includes(props.permission);
});
</script>
```

```vue
<!-- 使用示例 -->
<template>
  <div>
    <!-- 提供用户信息 -->
    <template v-if="user">
      <PermissionButton 
        permission="user:create" 
        type="primary"
        @click="handleCreateUser"
      >
        创建用户
      </PermissionButton>
      
      <PermissionButton 
        permission="recharge:create" 
        type="success"
        @click="handleSyncRecharge"
      >
        同步充值
      </PermissionButton>
    </template>
  </div>
</template>

<script setup>
import { provide } from 'vue';
import { useAuth } from './composables/useAuth';
import PermissionButton from './components/PermissionButton.vue';

const { user } = useAuth();

// 提供用户信息给子组件
provide('currentUser', user);

const handleCreateUser = () => {
  console.log('创建用户');
};

const handleSyncRecharge = () => {
  console.log('同步充值数据');
};
</script>
```

---

## 🎯 常见错误处理

### 错误码对照表
```javascript
const ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '未登录或登录已过期',
  403: '权限不足',
  404: '资源不存在',
  500: '服务器内部错误',
};

// 统一错误处理
const handleError = (error) => {
  const message = ERROR_MESSAGES[error.status] || error.message || '未知错误';
  
  // 显示错误提示
  showMessage(message, 'error');
  
  // 401错误跳转到登录页
  if (error.status === 401) {
    window.location.href = '/login';
  }
};
```

### 请求重试机制
```javascript
const requestWithRetry = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await api.request(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## 🔧 调试技巧

### 1. 开发环境调试
```javascript
// 在浏览器控制台中测试API
const testApi = async () => {
  // 设置全局api实例
  window.api = new ApiClient();
  
  // 测试登录
  const loginResult = await api.login('admin', 'admin123');
  console.log('登录结果:', loginResult);
  
  // 测试获取用户信息
  const profile = await api.request('/auth/profile');
  console.log('用户信息:', profile);
};
```

### 2. 请求日志
```javascript
// 添加请求日志
const originalRequest = api.request;
api.request = async function(url, options) {
  console.log(`🚀 请求: ${options?.method || 'GET'} ${url}`, options);
  
  const startTime = Date.now();
  try {
    const result = await originalRequest.call(this, url, options);
    console.log(`✅ 响应: ${url} (${Date.now() - startTime}ms)`, result);
    return result;
  } catch (error) {
    console.error(`❌ 错误: ${url} (${Date.now() - startTime}ms)`, error);
    throw error;
  }
};
```

---

## 📝 总结

这个API系统提供了完整的用户认证、权限管理和数据同步功能。关键点：

1. **认证流程**: 登录 → 获取Token → 带Token请求 → Token过期自动刷新
2. **权限控制**: 基于RBAC模型，用户-角色-权限三层结构
3. **数据同步**: 支持从外部YAY平台同步充值数据
4. **错误处理**: 统一的错误码和错误处理机制

Vue 3 前端开发时，建议：
- 使用 Composition API 简化状态管理
- 封装统一的API请求类
- 实现自动Token刷新机制
- 做好权限控制和错误处理
- 配合 Element Plus 组件库提升开发效率

有任何问题，可以访问 `http://localhost:8008/docs` 查看完整的Swagger文档！

---

*快速上手，让Vue 3开发更高效！* 🚀

### Vue 3 + Element Plus 项目结构示例
```
src/
├── api/
│   └── client.js          # API客户端封装
├── components/
│   ├── PermissionButton.vue  # 权限按钮组件
│   └── UserTable.vue       # 用户表格组件
├── composables/
│   ├── useAuth.js         # 认证相关组合式函数
│   ├── useUsers.js        # 用户管理组合式函数
│   └── useRecharge.js     # 充值数据组合式函数
├── router/
│   └── index.js           # 路由配置
├── views/
│   ├── Login.vue          # 登录页面
│   ├── Dashboard.vue      # 仪表板
│   ├── Users.vue          # 用户管理
│   └── Recharge.vue       # 充值管理
└── main.js                # 入口文件
```

---

*快速上手，让开发更高效！* 🚀