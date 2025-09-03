# Matrix Dashboard Server API 接口文档

> TikTok账号监控与引流归因统计系统 API 文档

## 📋 目录
- [基础信息](#基础信息)
- [认证授权](#认证授权)
- [通用响应格式](#通用响应格式)
- [错误码说明](#错误码说明)
- [API 接口](#api-接口)
  - [1. 健康检查 Health](#1-健康检查-health)
  - [2. 认证模块 Auth](#2-认证模块-auth)
  - [3. 用户管理 User](#3-用户管理-user)
  - [4. 权限管理 RBAC](#4-权限管理-rbac)
  - [5. 充值同步 Recharge Sync](#5-充值同步-recharge-sync)

---

## 基础信息

- **Base URL**: `http://localhost:8008/api`
- **Swagger 文档**: `http://localhost:8008/docs`
- **支持格式**: JSON
- **字符编码**: UTF-8
- **时区**: Asia/Shanghai (+08:00)

### 技术栈
- **框架**: NestJS 10 + TypeScript
- **数据库**: MySQL 8 + TypeORM
- **认证**: JWT + Bearer Token
- **文档**: Swagger/OpenAPI 3.0
- **缓存**: Redis (可选)

---

## 认证授权

### Bearer Token 认证
大部分接口需要在请求头中携带 JWT Token：

```http
Authorization: Bearer <access_token>
```

### Token 类型
- **Access Token**: 访问令牌，有效期较短 (默认2小时)
- **Refresh Token**: 刷新令牌，有效期较长 (默认7天)

### 权限系统
基于 RBAC (Role-Based Access Control) 模型：
- **用户 (User)** ← 多对多 → **角色 (Role)** ← 多对多 → **权限 (Permission)**

---

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "users": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## API 接口

## 1. 健康检查 Health

### 1.1 服务健康检查
- **路径**: `GET /health`
- **描述**: 检查服务运行状态和数据库连接
- **权限**: 无需认证

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 67890123,
    "heapUsed": 45678901
  },
  "environment": "development"
}
```

---

## 2. 认证模块 Auth

### 2.1 账号密码登录
- **路径**: `POST /auth/login`
- **描述**: 使用用户名/邮箱和密码登录
- **权限**: 无需认证

**请求参数:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "nickname": "管理员",
      "avatar": "https://example.com/avatar.jpg",
      "roles": [
        {
          "id": 1,
          "name": "超级管理员",
          "code": "super_admin",
          "permissions": ["user:create", "user:read", "user:update", "user:delete"]
        }
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 刷新访问令牌
- **路径**: `POST /auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **权限**: 无需认证

**请求参数:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.3 用户登出
- **路径**: `POST /auth/logout`
- **描述**: 登出并使刷新令牌失效
- **权限**: 需要认证

**请求参数:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.4 获取当前用户信息
- **路径**: `GET /auth/profile`
- **描述**: 获取当前登录用户的详细信息
- **权限**: 需要认证

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "nickname": "管理员",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "lastLoginAt": "2023-12-01T10:30:00.000Z",
    "roles": [...]
  }
}
```

### 2.5 Lark (飞书) 相关接口

#### 2.5.1 获取Lark登录授权URL
- **路径**: `GET /auth/lark/url`
- **描述**: 获取飞书OAuth登录授权链接
- **权限**: 无需认证

#### 2.5.2 Lark OAuth回调
- **路径**: `GET /auth/lark/callback?code={code}&state={state}`
- **描述**: 飞书OAuth回调处理，自动重定向到前端
- **权限**: 无需认证

#### 2.5.3 Lark扫码登录
- **路径**: `POST /auth/lark/login`
- **描述**: 通过飞书授权码直接登录
- **权限**: 无需认证

**请求参数:**
```json
{
  "code": "lark_auth_code"
}
```

#### 2.5.4 绑定Lark账号
- **路径**: `POST /auth/lark/bind`
- **描述**: 将当前用户与飞书账号绑定
- **权限**: 需要认证

#### 2.5.5 解绑Lark账号
- **路径**: `POST /auth/lark/unbind`
- **描述**: 解除当前用户与飞书账号的绑定
- **权限**: 需要认证

---

## 3. 用户管理 User

### 3.1 创建用户
- **路径**: `POST /users`
- **描述**: 创建新用户
- **权限**: `user:create`

**请求参数:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "nickname": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "status": "ACTIVE",
  "roleIds": [2, 3]
}
```

### 3.2 获取用户列表
- **路径**: `GET /users?page=1&limit=10`
- **描述**: 分页获取用户列表
- **权限**: `user:read`

**查询参数:**
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "nickname": "管理员",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ACTIVE",
        "createdAt": "2023-12-01T10:30:00.000Z",
        "roles": [...]
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 3.3 获取用户详情
- **路径**: `GET /users/{id}`
- **描述**: 根据ID获取用户详细信息
- **权限**: `user:read`

### 3.4 更新用户
- **路径**: `PATCH /users/{id}`
- **描述**: 更新指定用户信息
- **权限**: `user:update`

### 3.5 删除用户
- **路径**: `DELETE /users/{id}`
- **描述**: 删除指定用户
- **权限**: `user:delete`

### 3.6 修改密码
- **路径**: `POST /users/change-password`
- **描述**: 当前用户修改自己的密码
- **权限**: 需要认证

**请求参数:**
```json
{
  "oldPassword": "old_password",
  "newPassword": "new_password"
}
```

### 3.7 重置用户密码
- **路径**: `POST /users/{id}/reset-password`
- **描述**: 管理员重置指定用户密码
- **权限**: `user:update`

**请求参数:**
```json
{
  "newPassword": "new_password"
}
```

### 3.8 分配角色
- **路径**: `POST /users/{id}/roles`
- **描述**: 为用户分配角色
- **权限**: `user:update`

**请求参数:**
```json
{
  "roleIds": [1, 2, 3]
}
```

### 3.9 更新用户状态
- **路径**: `PATCH /users/{id}/status`
- **描述**: 更新用户状态（激活/禁用）
- **权限**: `user:update`

**请求参数:**
```json
{
  "status": "ACTIVE"
}
```

**状态枚举:**
- `ACTIVE`: 激活
- `INACTIVE`: 禁用
- `PENDING`: 待激活

### 3.10 获取用户权限
- **路径**: `GET /users/{id}/permissions`
- **描述**: 获取指定用户的所有权限
- **权限**: `user:read`

---

## 4. 权限管理 RBAC

### 4.1 权限管理 Permissions

#### 4.1.1 创建权限
- **路径**: `POST /permissions`
- **描述**: 创建新权限
- **权限**: `permission:create`

**请求参数:**
```json
{
  "name": "用户管理",
  "code": "user:read",
  "type": "OPERATION",
  "description": "查看用户信息",
  "parentId": 1,
  "resource": "/users",
  "isActive": true,
  "sort": 0
}
```

**权限类型:**
- `MENU`: 菜单权限
- `OPERATION`: 操作权限
- `API`: API权限

#### 4.1.2 获取权限列表
- **路径**: `GET /permissions?tree=true`
- **描述**: 获取权限列表，支持树形结构
- **权限**: `permission:read`

**查询参数:**
- `tree` (可选): 是否返回树形结构

#### 4.1.3 获取权限详情
- **路径**: `GET /permissions/{id}`
- **权限**: `permission:read`

#### 4.1.4 更新权限
- **路径**: `PATCH /permissions/{id}`
- **权限**: `permission:update`

#### 4.1.5 删除权限
- **路径**: `DELETE /permissions/{id}`
- **权限**: `permission:delete`

#### 4.1.6 根据父级ID获取权限
- **路径**: `GET /permissions/parent/{parentId}`
- **权限**: `permission:read`

### 4.2 角色管理 Roles

#### 4.2.1 创建角色
- **路径**: `POST /roles`
- **描述**: 创建新角色
- **权限**: `role:create`

**请求参数:**
```json
{
  "name": "管理员",
  "code": "admin",
  "description": "系统管理员角色",
  "isActive": true,
  "sort": 0,
  "permissionIds": [1, 2, 3]
}
```

#### 4.2.2 获取角色列表
- **路径**: `GET /roles`
- **权限**: `role:read`

#### 4.2.3 获取角色详情
- **路径**: `GET /roles/{id}`
- **权限**: `role:read`

#### 4.2.4 更新角色
- **路径**: `PATCH /roles/{id}`
- **权限**: `role:update`

#### 4.2.5 删除角色
- **路径**: `DELETE /roles/{id}`
- **权限**: `role:delete`

#### 4.2.6 为角色添加权限
- **路径**: `POST /roles/{id}/permissions`
- **权限**: `role:update`

**请求参数:**
```json
{
  "permissionIds": [1, 2, 3]
}
```

#### 4.2.7 移除角色权限
- **路径**: `DELETE /roles/{id}/permissions`
- **权限**: `role:update`

---

## 5. 充值同步 Recharge Sync

### 5.1 同步用户充值功能数据
- **路径**: `POST /recharge-sync/sync`
- **描述**: 从YAY平台同步用户充值功能数据
- **权限**: `recharge:create`

**请求参数:**
```json
{
  "userIds": "123456,789012,345678"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "同步成功",
  "data": {
    "syncedCount": 3,
    "failedCount": 0,
    "details": [
      {
        "uid": 123456,
        "status": "success",
        "message": "同步成功"
      }
    ]
  }
}
```

### 5.2 批量同步用户充值功能数据
- **路径**: `POST /recharge-sync/batch-sync`
- **描述**: 批量同步多个用户的充值功能数据
- **权限**: `recharge:create`

**请求参数:**
```json
{
  "userIds": [123456, 789012, 345678]
}
```

### 5.3 查询用户充值功能数据列表
- **路径**: `GET /recharge-sync/list?page=1&limit=10&uid=123456`
- **描述**: 分页查询用户充值功能数据
- **权限**: `recharge:read`

**查询参数:**
- `page` (可选): 页码
- `limit` (可选): 每页数量
- `uid` (可选): 用户ID筛选
- `isValuableUser` (可选): 是否为价值用户
- `isHundredUser` (可选): 是否为百元用户
- `syncStatus` (可选): 同步状态 (pending/success/failed)

### 5.4 根据用户ID查询充值功能数据
- **路径**: `GET /recharge-sync/user/{uid}`
- **描述**: 查询指定用户的充值功能数据
- **权限**: `recharge:read`

**响应示例:**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "uid": 123456,
    "totalRecharge": 1000.50,
    "day1Coin": 100,
    "day2Coin": 200,
    "day7Coin": 500,
    "day30Coin": 1000,
    "isValuableUser": true,
    "isHundredUser": true,
    "registerTime": 1700000000000,
    "syncStatus": "success",
    "syncAt": "2023-12-01T10:30:00.000Z",
    "createdAt": "2023-12-01T10:30:00.000Z"
  }
}
```

### 5.5 删除用户充值功能数据
- **路径**: `DELETE /recharge-sync/user/{uid}`
- **权限**: `recharge:delete`

### 5.6 获取同步统计信息
- **路径**: `GET /recharge-sync/stats`
- **描述**: 获取充值数据同步的统计信息
- **权限**: `recharge:read`

**响应示例:**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalUsers": 1000,
    "syncedUsers": 950,
    "failedUsers": 20,
    "pendingUsers": 30,
    "lastSyncAt": "2023-12-01T10:30:00.000Z",
    "valuableUsers": 100,
    "hundredUsers": 50
  }
}
```

### 5.7 重新同步指定用户数据
- **路径**: `POST /recharge-sync/resync/{uid}`
- **权限**: `recharge:update`

### 5.8 调试和测试接口

#### 5.8.1 测试YAY API连接
- **路径**: `GET /recharge-sync/test/connection`
- **权限**: `system:monitor`

#### 5.8.2 测试获取用户充值功能数据接口
- **路径**: `GET /recharge-sync/test/recharge-feature?userIds=123456`
- **权限**: `system:monitor`

#### 5.8.3 使用指定token直接测试YAY API
- **路径**: `POST /recharge-sync/test/direct-api`
- **权限**: `system:monitor`

**请求参数:**
```json
{
  "userIds": "123456,789012",
  "token": "your_yay_api_token"
}
```

#### 5.8.4 使用指定token直接同步并保存数据
- **路径**: `POST /recharge-sync/sync-direct`
- **权限**: `recharge:create`

#### 5.8.5 调试YAY登录过程
- **路径**: `GET /recharge-sync/debug/login`
- **权限**: `system:monitor`

---

## 📝 使用示例

### 前端集成示例 (JavaScript)

```javascript
// 1. 登录获取Token
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);
    return result.data.user;
  }
  throw new Error(result.message);
}

// 2. 带认证的API请求
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token过期，尝试刷新
    await refreshToken();
    return apiRequest(url, options);
  }
  
  return response.json();
}

// 3. 刷新Token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const result = await response.json();
  if (result.code === 200) {
    localStorage.setItem('accessToken', result.data.accessToken);
    localStorage.setItem('refreshToken', result.data.refreshToken);
  }
}

// 4. 获取用户列表
async function getUsers(page = 1, limit = 10) {
  return apiRequest(`/users?page=${page}&limit=${limit}`);
}

// 5. 同步充值数据
async function syncRechargeData(userIds) {
  return apiRequest('/recharge-sync/sync', {
    method: 'POST',
    body: JSON.stringify({ userIds })
  });
}
```

### React Hook 示例

```typescript
// useAuth Hook
import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  roles: Array<{
    id: number;
    name: string;
    code: string;
    permissions: string[];
  }>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.code === 200) {
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      setUser(result.data.user);
      return result.data.user;
    }
    throw new Error(result.message);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
}
```

---

## 📚 相关文档

- [项目 README](./README.md)
- [充值同步指南](./RECHARGE_SYNC_GUIDE.md)
- [项目总结](./PROJECT_SUMMARY.md)
- [Swagger 在线文档](http://localhost:3000/docs)

---

## 🔧 开发环境

### 启动服务
```bash
# 开发环境
pnpm run start:dev

# 生产环境
pnpm run start:prod
```

### 数据库迁移
```bash
# 生成迁移文件
pnpm run migration:generate

# 执行迁移
pnpm run migration:run

# 回滚迁移
pnpm run migration:revert
```

---

## ⚠️ 注意事项

1. **权限控制**: 大部分接口需要相应权限，请确保用户具有对应权限
2. **Token 有效期**: Access Token 有效期为2小时，请及时刷新
3. **Rate Limiting**: 部分接口可能有频率限制，请注意调用频率
4. **数据同步**: 充值同步功能依赖外部YAY平台API，请确保网络连通性
5. **错误处理**: 请正确处理各种HTTP状态码和业务错误码

---

*更新时间: 2023-12-01*
*版本: v1.0.0*