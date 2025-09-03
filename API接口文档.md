# Matrix Dashboard Server API 接口文档

## 📋 基本信息

- **项目名称**: Matrix Dashboard Server
- **版本**: 1.0.0
- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **在线文档**: `http://localhost:3000/docs` (Swagger)

## 🔐 认证说明

### JWT Token 使用
大部分接口需要在请求头中携带 JWT Token：
```
Authorization: Bearer <access_token>
```

### 权限系统
系统采用 RBAC 权限模型，不同接口需要不同权限：
- **超级管理员 (admin)**: 拥有所有权限
- **运营人员 (ops)**: 账号管理、转化数据、充值管理等
- **数据分析师 (analyst)**: 数据查看和分析权限
- **只读用户 (viewer)**: 仅查看权限

## 📚 接口列表

### 1. 健康检查模块

#### 1.1 健康检查
- **接口**: `GET /health`
- **描述**: 检查服务状态和数据库连接
- **权限**: 无需认证
- **响应**:
```json
{
  "status": "ok",
  "timestamp": "2025-09-03T09:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "environment": "development"
}
```

### 2. 认证模块 (Auth)

#### 2.1 账号密码登录
- **接口**: `POST /auth/login`
- **描述**: 用户名/邮箱 + 密码登录
- **权限**: 无需认证
- **请求参数**:
```json
{
  "username": "admin",     // 用户名或邮箱
  "password": "admin123"   // 密码 (最少6位)
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@matrix.com",
      "nickname": "系统管理员",
      "avatar": null,
      "roles": [
        {
          "id": 1,
          "name": "超级管理员",
          "code": "admin",
          "permissions": ["user:manage", "user:read", ...]
        }
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "d4a3af51-0d0a-409b-b279-44b2a3ddff67"
  }
}
```

#### 2.2 刷新访问令牌
- **接口**: `POST /auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **权限**: 无需认证
- **请求参数**:
```json
{
  "refreshToken": "d4a3af51-0d0a-409b-b279-44b2a3ddff67"
}
```
- **响应**: 同登录接口

#### 2.3 登出
- **接口**: `POST /auth/logout`
- **描述**: 用户登出，撤销刷新令牌
- **权限**: 需要认证
- **请求参数**:
```json
{
  "refreshToken": "d4a3af51-0d0a-409b-b279-44b2a3ddff67"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "登出成功"
}
```

#### 2.4 获取当前用户信息
- **接口**: `GET /auth/profile`
- **描述**: 获取当前登录用户的详细信息
- **权限**: 需要认证
- **响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@matrix.com",
    "nickname": "系统管理员",
    "avatar": null,
    "status": "active",
    "lastLoginAt": "2025-09-03T09:09:20.000Z",
    "roles": [...]
  }
}
```

#### 2.5 Lark 相关接口

##### 2.5.1 获取 Lark 登录授权 URL
- **接口**: `GET /auth/lark/url`
- **描述**: 获取飞书 OAuth 登录链接
- **权限**: 无需认证
- **响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "authUrl": "https://passport.larksuite.com/suite/passport/oauth/authorize?..."
  }
}
```

##### 2.5.2 Lark OAuth 回调
- **接口**: `GET /auth/lark/callback`
- **描述**: 飞书 OAuth 回调处理
- **权限**: 无需认证
- **查询参数**: `code`, `state`

##### 2.5.3 Lark 扫码登录
- **接口**: `POST /auth/lark/login`
- **描述**: 使用飞书授权码登录
- **权限**: 无需认证
- **请求参数**:
```json
{
  "code": "lark_authorization_code"
}
```

##### 2.5.4 绑定 Lark 账号
- **接口**: `POST /auth/lark/bind`
- **描述**: 将当前用户绑定到飞书账号
- **权限**: 需要认证
- **请求参数**:
```json
{
  "code": "lark_authorization_code"
}
```

##### 2.5.5 解绑 Lark 账号
- **接口**: `POST /auth/lark/unbind`
- **描述**: 解绑当前用户的飞书账号
- **权限**: 需要认证

### 3. 用户管理模块 (User)

#### 3.1 创建用户
- **接口**: `POST /users`
- **描述**: 创建新用户
- **权限**: `user:create`
- **请求参数**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "nickname": "新用户",
  "avatar": "http://example.com/avatar.jpg"
}
```

#### 3.2 获取用户列表
- **接口**: `GET /users`
- **描述**: 分页获取用户列表
- **权限**: `user:read`
- **查询参数**:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)
- **响应**:
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

#### 3.3 获取用户详情
- **接口**: `GET /users/:id`
- **描述**: 根据用户ID获取详细信息
- **权限**: `user:read`
- **路径参数**: `id` - 用户ID

#### 3.4 更新用户
- **接口**: `PATCH /users/:id`
- **描述**: 更新用户信息
- **权限**: `user:update`
- **路径参数**: `id` - 用户ID
- **请求参数**:
```json
{
  "nickname": "更新的昵称",
  "avatar": "http://example.com/new-avatar.jpg"
}
```

#### 3.5 删除用户
- **接口**: `DELETE /users/:id`
- **描述**: 软删除用户
- **权限**: `user:delete`
- **路径参数**: `id` - 用户ID

#### 3.6 修改密码
- **接口**: `POST /users/change-password`
- **描述**: 当前用户修改自己的密码
- **权限**: 需要认证
- **请求参数**:
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

#### 3.7 重置用户密码
- **接口**: `POST /users/:id/reset-password`
- **描述**: 管理员重置指定用户密码
- **权限**: `user:update`
- **路径参数**: `id` - 用户ID
- **请求参数**:
```json
{
  "newPassword": "newpass123"
}
```

#### 3.8 分配角色
- **接口**: `POST /users/:id/roles`
- **描述**: 为用户分配角色
- **权限**: `user:update`
- **路径参数**: `id` - 用户ID
- **请求参数**:
```json
{
  "roleIds": [1, 2, 3]
}
```

#### 3.9 更新用户状态
- **接口**: `PATCH /users/:id/status`
- **描述**: 更新用户状态 (active/inactive/banned)
- **权限**: `user:update`
- **路径参数**: `id` - 用户ID
- **请求参数**:
```json
{
  "status": "inactive"
}
```

#### 3.10 获取用户权限
- **接口**: `GET /users/:id/permissions`
- **描述**: 获取用户的所有权限列表
- **权限**: `user:read`
- **路径参数**: `id` - 用户ID

### 4. 角色管理模块 (RBAC - Role)

#### 4.1 创建角色
- **接口**: `POST /roles`
- **描述**: 创建新角色
- **权限**: `role:create`
- **请求参数**:
```json
{
  "name": "新角色",
  "code": "new_role",
  "description": "角色描述",
  "sort": 10
}
```

#### 4.2 获取角色列表
- **接口**: `GET /roles`
- **描述**: 获取所有角色列表
- **权限**: `role:read`

#### 4.3 获取角色详情
- **接口**: `GET /roles/:id`
- **描述**: 根据角色ID获取详细信息
- **权限**: `role:read`
- **路径参数**: `id` - 角色ID

#### 4.4 更新角色
- **接口**: `PATCH /roles/:id`
- **描述**: 更新角色信息
- **权限**: `role:update`
- **路径参数**: `id` - 角色ID

#### 4.5 删除角色
- **接口**: `DELETE /roles/:id`
- **描述**: 删除角色
- **权限**: `role:delete`
- **路径参数**: `id` - 角色ID

#### 4.6 为角色添加权限
- **接口**: `POST /roles/:id/permissions`
- **描述**: 为角色分配权限
- **权限**: `role:update`
- **路径参数**: `id` - 角色ID
- **请求参数**:
```json
{
  "permissionIds": [1, 2, 3, 4, 5]
}
```

#### 4.7 移除角色权限
- **接口**: `DELETE /roles/:id/permissions`
- **描述**: 移除角色的指定权限
- **权限**: `role:update`
- **路径参数**: `id` - 角色ID
- **请求参数**:
```json
{
  "permissionIds": [1, 2, 3]
}
```

### 5. 权限管理模块 (RBAC - Permission)

#### 5.1 创建权限
- **接口**: `POST /permissions`
- **描述**: 创建新权限
- **权限**: `permission:create`
- **请求参数**:
```json
{
  "name": "权限名称",
  "code": "permission:code",
  "type": "api",
  "description": "权限描述",
  "parentId": null,
  "resource": "GET:/api/example",
  "sort": 1
}
```

#### 5.2 获取权限列表
- **接口**: `GET /permissions`
- **描述**: 获取权限列表，支持树形结构
- **权限**: `permission:read`
- **查询参数**:
  - `tree`: 是否返回树形结构 (true/false)

#### 5.3 获取权限详情
- **接口**: `GET /permissions/:id`
- **描述**: 根据权限ID获取详细信息
- **权限**: `permission:read`
- **路径参数**: `id` - 权限ID

#### 5.4 更新权限
- **接口**: `PATCH /permissions/:id`
- **描述**: 更新权限信息
- **权限**: `permission:update`
- **路径参数**: `id` - 权限ID

#### 5.5 删除权限
- **接口**: `DELETE /permissions/:id`
- **描述**: 删除权限
- **权限**: `permission:delete`
- **路径参数**: `id` - 权限ID

#### 5.6 根据父级ID获取权限列表
- **接口**: `GET /permissions/parent/:parentId`
- **描述**: 获取指定父级权限下的子权限列表
- **权限**: `permission:read`
- **路径参数**: `parentId` - 父级权限ID

## 🔧 错误码说明

### HTTP 状态码
- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突 (如用户名已存在)
- `500`: 服务器内部错误

### 业务错误码
所有接口返回格式统一为：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

错误响应格式：
```json
{
  "message": "错误描述",
  "error": "错误类型",
  "statusCode": 400
}
```

## 🚀 快速开始

### 1. 获取访问令牌
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 2. 使用令牌访问受保护接口
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your_access_token>"
```

### 3. 获取用户列表
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <your_access_token>"
```

## 📝 注意事项

1. **Token 过期**: Access Token 默认有效期为 1 小时，Refresh Token 有效期为 7 天
2. **权限验证**: 大部分接口都需要相应的权限，请确保用户具有足够的权限
3. **参数验证**: 所有请求参数都会进行严格验证，请按照文档格式传递参数
4. **分页查询**: 支持分页的接口都有默认的 page 和 limit 参数
5. **软删除**: 用户删除采用软删除方式，数据不会真正删除

## 🔗 相关链接

- **Swagger 文档**: http://localhost:3000/docs
- **健康检查**: http://localhost:3000/api/health
- **项目仓库**: [GitHub Repository]

---

**更新时间**: 2025-09-03  
**文档版本**: v1.0.0  
**联系方式**: Matrix Team