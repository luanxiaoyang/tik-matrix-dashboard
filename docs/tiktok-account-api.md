# TikTok Account API 文档

## 概述

TikTok账号管理API提供了完整的TikTok账号生命周期管理功能，包括账号的创建、查询、更新、删除以及用户分配等操作。

## 基础信息

- **Base URL**: `/api/tiktok-accounts`
- **认证方式**: Bearer Token (JWT)
- **权限控制**: 基于RBAC权限系统

## 数据模型

### TikTok账号实体 (TiktokAccount)

```typescript
interface TiktokAccount {
  id: number;                    // 账号ID
  createdAt: Date;              // 创建时间
  updatedAt: Date;              // 更新时间
  deletedAt?: Date;             // 删除时间（软删除）
  accountUrl: string;           // TikTok账号链接
  accountName?: string;         // TikTok账号名称
  username?: string;            // TikTok用户名(@username)
  phoneNumber?: string;         // 绑定手机号码
  accountLevel: AccountLevel;   // 账号等级 (A/B/C/D)
  status: AccountStatus;        // 账号状态
  followersCount: number;       // 粉丝数量
  followingCount: number;       // 关注数量
  videoCount: number;           // 视频数量
  likesCount: number;           // 获得点赞数
  operationsUserId?: number;    // 分配的运营人员ID
  conversionUserId?: number;    // 分配的转化人员ID
  operationsUser?: User;        // 运营人员信息
  conversionUser?: User;        // 转化人员信息
  notes?: string;               // 备注信息
  lastStatsUpdateAt?: Date;     // 最后统计更新时间
  isVerified: boolean;          // 是否已验证
  tags?: string[];              // 标签列表
  region?: string;              // 地区信息
  language?: string;            // 主要使用语言
}
```

### 枚举类型

```typescript
// 账号等级
enum AccountLevel {
  A = 'A',  // A级账号
  B = 'B',  // B级账号
  C = 'C',  // C级账号
  D = 'D'   // D级账号
}

// 账号状态
enum AccountStatus {
  ACTIVE = 'active',      // 活跃
  INACTIVE = 'inactive',  // 非活跃
  BANNED = 'banned',      // 被封禁
  PENDING = 'pending'     // 待审核
}
```

## API 接口

### 1. 创建TikTok账号

**POST** `/api/tiktok-accounts`

创建新的TikTok账号记录。

**权限要求**: `account:create`

**请求体**:
```typescript
interface CreateTiktokAccountDto {
  accountUrl: string;           // 必填：TikTok账号链接
  accountName?: string;         // 可选：账号名称
  username?: string;            // 可选：用户名
  phoneNumber?: string;         // 可选：手机号码（格式：1[3-9]\d{9}）
  accountLevel: AccountLevel;   // 必填：账号等级
  status?: AccountStatus;       // 可选：账号状态（默认：active）
  followersCount?: number;      // 可选：粉丝数量（默认：0）
  followingCount?: number;      // 可选：关注数量（默认：0）
  videoCount?: number;          // 可选：视频数量（默认：0）
  likesCount?: number;          // 可选：点赞数量（默认：0）
  operationsUserId?: number;    // 可选：运营人员ID
  conversionUserId?: number;    // 可选：转化人员ID
  notes?: string;               // 可选：备注信息
  isVerified?: boolean;         // 可选：是否已验证（默认：false）
  tags?: string[];              // 可选：标签列表
  region?: string;              // 可选：地区信息
  language?: string;            // 可选：语言
}
```

**响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    // TiktokAccount 对象
  }
}
```

**错误响应**:
- `409 Conflict`: 账号链接已存在
- `400 Bad Request`: 请求参数验证失败

---

### 2. 获取TikTok账号列表

**GET** `/api/tiktok-accounts`

获取TikTok账号列表，支持分页和筛选。

**权限要求**: `account:read`

**查询参数**:
```typescript
interface TiktokAccountQueryDto {
  page?: number;                // 页码（默认：1）
  limit?: number;               // 每页数量（默认：10）
  accountLevel?: AccountLevel;  // 账号等级筛选
  status?: AccountStatus;       // 账号状态筛选
  operationsUserId?: number;    // 运营人员ID筛选
  conversionUserId?: number;    // 转化人员ID筛选
  isVerified?: boolean;         // 验证状态筛选
  keyword?: string;             // 关键词搜索（账号名称或用户名）
  region?: string;              // 地区筛选
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [/* TiktokAccount 对象数组 */],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### 3. 获取TikTok账号详情

**GET** `/api/tiktok-accounts/{id}`

根据ID获取特定TikTok账号的详细信息。

**权限要求**: `account:read`

**路径参数**:
- `id` (number): TikTok账号ID

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    // TiktokAccount 对象（包含关联的用户信息）
  }
}
```

**错误响应**:
- `404 Not Found`: 账号不存在

---

### 4. 更新TikTok账号

**PATCH** `/api/tiktok-accounts/{id}`

更新指定TikTok账号的信息。

**权限要求**: `account:update`

**路径参数**:
- `id` (number): TikTok账号ID

**请求体**:
```typescript
interface UpdateTiktokAccountDto {
  accountUrl?: string;          // 可选：TikTok账号链接
  accountName?: string;         // 可选：账号名称
  username?: string;            // 可选：用户名
  phoneNumber?: string;         // 可选：手机号码
  accountLevel?: AccountLevel;  // 可选：账号等级
  status?: AccountStatus;       // 可选：账号状态
  followersCount?: number;      // 可选：粉丝数量
  followingCount?: number;      // 可选：关注数量
  videoCount?: number;          // 可选：视频数量
  likesCount?: number;          // 可选：点赞数量
  operationsUserId?: number;    // 可选：运营人员ID
  conversionUserId?: number;    // 可选：转化人员ID
  notes?: string;               // 可选：备注信息
  isVerified?: boolean;         // 可选：是否已验证
  tags?: string[];              // 可选：标签列表
  region?: string;              // 可选：地区信息
  language?: string;            // 可选：语言
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    // 更新后的 TiktokAccount 对象
  }
}
```

**错误响应**:
- `404 Not Found`: 账号不存在
- `400 Bad Request`: 请求参数验证失败

---

### 5. 删除TikTok账号

**DELETE** `/api/tiktok-accounts/{id}`

删除指定的TikTok账号（软删除）。

**权限要求**: `account:delete`

**路径参数**:
- `id` (number): TikTok账号ID

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

**错误响应**:
- `404 Not Found`: 账号不存在

---

### 6. 分配用户到TikTok账号

**POST** `/api/tiktok-accounts/{id}/assign`

将运营人员或转化人员分配到指定的TikTok账号。

**权限要求**: `account:update`

**路径参数**:
- `id` (number): TikTok账号ID

**请求体**:
```typescript
interface AssignUserDto {
  operationsUserId?: number;    // 可选：运营人员ID
  conversionUserId?: number;    // 可选：转化人员ID
}
```

**响应**:
```json
{
  "code": 200,
  "message": "分配成功",
  "data": {
    // 更新后的 TiktokAccount 对象
  }
}
```

**错误响应**:
- `404 Not Found`: 账号或用户不存在
- `400 Bad Request`: 用户类型不匹配

---

### 7. 批量分配用户

**POST** `/api/tiktok-accounts/batch-assign`

批量将用户分配到多个TikTok账号。

**权限要求**: `account:update`

**请求体**:
```typescript
interface BatchAssignDto {
  accountIds: number[];         // 必填：TikTok账号ID列表
  operationsUserId?: number;    // 可选：运营人员ID
  conversionUserId?: number;    // 可选：转化人员ID
}
```

**响应**:
```json
{
  "code": 200,
  "message": "批量分配成功"
}
```

**错误响应**:
- `404 Not Found`: 部分账号或用户不存在
- `400 Bad Request`: 请求参数验证失败

---

### 8. 更新TikTok账号统计数据

**POST** `/api/tiktok-accounts/{id}/stats`

更新指定TikTok账号的统计数据（粉丝数、关注数等）。

**权限要求**: `account:update`

**路径参数**:
- `id` (number): TikTok账号ID

**请求体**:
```typescript
interface UpdateStatsDto {
  followersCount: number;       // 必填：粉丝数量
  followingCount: number;       // 必填：关注数量
  videoCount: number;           // 必填：视频数量
  likesCount: number;           // 必填：点赞数量
}
```

**响应**:
```json
{
  "code": 200,
  "message": "统计数据更新成功",
  "data": {
    // 更新后的 TiktokAccount 对象
  }
}
```

**错误响应**:
- `404 Not Found`: 账号不存在
- `400 Bad Request`: 统计数据格式错误

---

### 9. 更新TikTok账号状态

**PATCH** `/api/tiktok-accounts/{id}/status`

更新指定TikTok账号的状态。

**权限要求**: `account:update`

**路径参数**:
- `id` (number): TikTok账号ID

**请求体**:
```typescript
{
  status: AccountStatus         // 必填：新的账号状态
}
```

**响应**:
```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    // 更新后的 TiktokAccount 对象
  }
}
```

**错误响应**:
- `404 Not Found`: 账号不存在
- `400 Bad Request`: 状态值无效

---

### 10. 获取用户分配的TikTok账号

**GET** `/api/tiktok-accounts/my-accounts`

获取当前登录用户分配的TikTok账号列表。

**权限要求**: `account:read`

**查询参数**:
- `type` (string): 用户类型，可选值：`operations`（运营）、`conversion`（转化），默认：`operations`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    // TiktokAccount 对象数组
  ]
}
```

---

### 11. 根据用户ID获取分配的TikTok账号

**GET** `/api/tiktok-accounts/user/{userId}`

根据用户ID获取该用户分配的TikTok账号列表。

**权限要求**: `account:read`

**路径参数**:
- `userId` (number): 用户ID

**查询参数**:
- `type` (string): 用户类型，可选值：`operations`、`conversion`，默认：`operations`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    // TiktokAccount 对象数组
  ]
}
```

**错误响应**:
- `404 Not Found`: 用户不存在

---

### 12. 获取TikTok账号统计信息

**GET** `/api/tiktok-accounts/statistics/overview`

获取TikTok账号的整体统计信息。

**权限要求**: `account:read`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalAccounts": 1000,           // 总账号数
    "activeAccounts": 800,           // 活跃账号数
    "inactiveAccounts": 150,         // 非活跃账号数
    "bannedAccounts": 50,            // 被封禁账号数
    "verifiedAccounts": 600,         // 已验证账号数
    "accountsByLevel": {
      "A": 100,
      "B": 300,
      "C": 400,
      "D": 200
    },
    "totalFollowers": 5000000,       // 总粉丝数
    "totalVideos": 50000,            // 总视频数
    "totalLikes": 10000000           // 总点赞数
  }
}
```

---

### 13. 根据链接查找TikTok账号

**GET** `/api/tiktok-accounts/search/by-url`

根据TikTok账号链接查找对应的账号记录。

**权限要求**: `account:read`

**查询参数**:
- `url` (string): TikTok账号链接

**响应**:
```json
{
  "code": 200,
  "message": "找到账号" | "账号不存在",
  "data": {
    // TiktokAccount 对象或 null
  }
}
```

---

### 14. 根据手机号查找TikTok账号

**GET** `/api/tiktok-accounts/search/by-phone/{phone}`

根据手机号码查找绑定的TikTok账号。

**权限要求**: `account:read`

**路径参数**:
- `phone` (string): 手机号码

**响应**:
```json
{
  "code": 200,
  "message": "查找成功",
  "data": [
    // TiktokAccount 对象数组
  ]
}
```

## 错误处理

### 通用错误码

- `400 Bad Request`: 请求参数验证失败
- `401 Unauthorized`: 未认证或token无效
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `409 Conflict`: 资源冲突（如重复创建）
- `500 Internal Server Error`: 服务器内部错误

### 错误响应格式

```json
{
  "code": 400,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

## 权限说明

本API使用基于角色的访问控制（RBAC）系统，需要以下权限：

- `account:create`: 创建TikTok账号
- `account:read`: 查看TikTok账号信息
- `account:update`: 更新TikTok账号信息
- `account:delete`: 删除TikTok账号

## 数据库索引

为了提高查询性能，在以下字段上建立了索引：

- `phoneNumber`: 手机号码索引
- `accountLevel`: 账号等级索引
- `status`: 账号状态索引
- `operationsUserId`: 运营人员ID索引
- `conversionUserId`: 转化人员ID索引

## 注意事项

1. **账号链接唯一性**: 每个TikTok账号链接在系统中必须唯一
2. **软删除**: 删除操作采用软删除方式，不会物理删除数据
3. **用户分配验证**: 分配用户时会验证用户是否存在且类型匹配
4. **统计数据更新**: 统计数据更新会自动记录更新时间
5. **权限控制**: 所有接口都需要相应的权限才能访问
6. **数据验证**: 所有输入数据都会进行严格的格式验证

## 更新日志

- **v1.0.0**: 初始版本，包含基础的CRUD操作和用户分配功能
- **v1.1.0**: 新增批量分配、统计数据更新功能
- **v1.2.0**: 新增搜索功能和统计概览接口

---

*最后更新时间: 2024-12-19*
*文档版本: v1.2.0*