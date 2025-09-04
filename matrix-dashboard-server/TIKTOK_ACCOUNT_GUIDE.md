# TikTok账号管理模块使用指南

## 📋 模块概述

TikTok账号管理模块用于管理TikTok账号信息，包括账号链接、手机号、等级分类、用户分配等功能，支持运营和转化人员的账号分配管理。

## 🗄️ 数据表结构

### tiktok_accounts 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键ID |
| accountUrl | varchar(500) | TikTok账号链接 |
| accountName | varchar(100) | TikTok账号名称 |
| username | varchar(100) | TikTok用户名(@username) |
| phoneNumber | varchar(20) | 绑定的手机号码 |
| accountLevel | enum('A','B','C','D') | 账号等级 |
| status | enum | 账号状态(active/inactive/banned/pending) |
| followersCount | int | 粉丝数量 |
| followingCount | int | 关注数量 |
| videoCount | int | 视频数量 |
| likesCount | int | 获得的点赞数 |
| operationsUserId | int | 分配的运营人员ID |
| conversionUserId | int | 分配的转化人员ID |
| notes | text | 备注信息 |
| lastStatsUpdateAt | timestamp | 最后更新统计数据时间 |
| isVerified | boolean | 是否已验证账号有效性 |
| tags | json | 账号标签 |
| region | varchar(100) | 账号地区 |
| language | varchar(50) | 主要使用语言 |

## 🚀 API 接口

### 1. 创建TikTok账号

**接口**: `POST /api/tiktok-accounts`  
**权限**: `account:create`

```bash
curl -X POST http://localhost:1106/api/tiktok-accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountUrl": "https://www.tiktok.com/@example_user",
    "accountName": "示例账号",
    "username": "example_user",
    "phoneNumber": "13800138000",
    "accountLevel": "A",
    "status": "active",
    "followersCount": 10000,
    "followingCount": 500,
    "videoCount": 50,
    "likesCount": 100000,
    "operationsUserId": 2,
    "conversionUserId": 3,
    "notes": "这是一个示例账号",
    "isVerified": true,
    "tags": ["热门", "生活", "娱乐"],
    "region": "中国",
    "language": "中文"
  }'
```

### 2. 查询TikTok账号列表

**接口**: `GET /api/tiktok-accounts`  
**权限**: `account:read`

```bash
# 基本查询
curl -X GET http://localhost:1106/api/tiktok-accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 按等级查询
curl -X GET "http://localhost:1106/api/tiktok-accounts?accountLevel=A&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 按分配用户查询
curl -X GET "http://localhost:1106/api/tiktok-accounts?operationsUserId=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 关键词搜索
curl -X GET "http://localhost:1106/api/tiktok-accounts?keyword=美妆" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `accountLevel`: 账号等级 (A/B/C/D)
- `status`: 账号状态
- `operationsUserId`: 运营人员ID
- `conversionUserId`: 转化人员ID
- `isVerified`: 是否已验证
- `keyword`: 搜索关键词
- `region`: 地区

### 3. 获取TikTok账号详情

**接口**: `GET /api/tiktok-accounts/:id`  
**权限**: `account:read`

```bash
curl -X GET http://localhost:1106/api/tiktok-accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 更新TikTok账号

**接口**: `PATCH /api/tiktok-accounts/:id`  
**权限**: `account:update`

```bash
curl -X PATCH http://localhost:1106/api/tiktok-accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "更新后的账号名称",
    "accountLevel": "B",
    "notes": "更新备注信息"
  }'
```

### 5. 删除TikTok账号

**接口**: `DELETE /api/tiktok-accounts/:id`  
**权限**: `account:delete`

```bash
curl -X DELETE http://localhost:1106/api/tiktok-accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. 分配用户到TikTok账号

**接口**: `POST /api/tiktok-accounts/:id/assign`  
**权限**: `account:update`

```bash
curl -X POST http://localhost:1106/api/tiktok-accounts/1/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operationsUserId": 2,
    "conversionUserId": 3
  }'
```

### 7. 批量分配用户

**接口**: `POST /api/tiktok-accounts/batch-assign`  
**权限**: `account:update`

```bash
curl -X POST http://localhost:1106/api/tiktok-accounts/batch-assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountIds": [1, 2, 3],
    "operationsUserId": 2,
    "conversionUserId": 3
  }'
```

### 8. 更新账号统计数据

**接口**: `POST /api/tiktok-accounts/:id/stats`  
**权限**: `account:update`

```bash
curl -X POST http://localhost:1106/api/tiktok-accounts/1/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followersCount": 15000,
    "followingCount": 600,
    "videoCount": 55,
    "likesCount": 120000
  }'
```

### 9. 更新账号状态

**接口**: `PATCH /api/tiktok-accounts/:id/status`  
**权限**: `account:update`

```bash
curl -X PATCH http://localhost:1106/api/tiktok-accounts/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

### 10. 获取当前用户分配的账号

**接口**: `GET /api/tiktok-accounts/my-accounts`  
**权限**: `account:read`

```bash
# 获取我负责运营的账号
curl -X GET "http://localhost:1106/api/tiktok-accounts/my-accounts?type=operations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 获取我负责转化的账号
curl -X GET "http://localhost:1106/api/tiktok-accounts/my-accounts?type=conversion" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. 获取指定用户分配的账号

**接口**: `GET /api/tiktok-accounts/user/:userId`  
**权限**: `account:read`

```bash
curl -X GET "http://localhost:1106/api/tiktok-accounts/user/2?type=operations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. 获取统计概览

**接口**: `GET /api/tiktok-accounts/statistics/overview`  
**权限**: `account:read`

```bash
curl -X GET http://localhost:1106/api/tiktok-accounts/statistics/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "levelStats": {
      "A": 25,
      "B": 35,
      "C": 30,
      "D": 10
    },
    "statusStats": {
      "active": 85,
      "inactive": 10,
      "banned": 3,
      "pending": 2
    },
    "assignedOperations": 75,
    "assignedConversions": 68,
    "unassignedOperations": 25,
    "unassignedConversions": 32,
    "verifiedCount": 90
  }
}
```

### 13. 根据链接查找账号

**接口**: `GET /api/tiktok-accounts/search/by-url`  
**权限**: `account:read`

```bash
curl -X GET "http://localhost:1106/api/tiktok-accounts/search/by-url?url=https://www.tiktok.com/@example_user" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 14. 根据手机号查找账号

**接口**: `GET /api/tiktok-accounts/search/by-phone/:phone`  
**权限**: `account:read`

```bash
curl -X GET http://localhost:1106/api/tiktok-accounts/search/by-phone/13800138000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏷️ 账号等级说明

| 等级 | 说明 | 特点 |
|------|------|------|
| **A级** | 顶级账号 | 粉丝多、互动高、转化效果好 |
| **B级** | 优质账号 | 有一定粉丝基础，转化潜力大 |
| **C级** | 普通账号 | 粉丝适中，需要持续运营 |
| **D级** | 新账号/低质量 | 粉丝较少，需要重点培养 |

## 👥 用户分配机制

### 运营人员 (Operations User)
- 负责账号的日常运营
- 内容策划和发布
- 粉丝互动管理
- 账号数据维护

### 转化人员 (Conversion User)
- 负责流量转化
- 引流策略制定
- 转化效果跟踪
- ROI分析优化

## 📊 使用示例

### 完整的账号管理流程

```bash
# 1. 登录获取JWT token
TOKEN=$(curl -X POST http://localhost:1106/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.data.accessToken')

# 2. 创建TikTok账号
curl -X POST http://localhost:1106/api/tiktok-accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountUrl": "https://www.tiktok.com/@new_account",
    "accountName": "新账号",
    "username": "new_account",
    "phoneNumber": "13800138999",
    "accountLevel": "B",
    "tags": ["生活", "娱乐"]
  }'

# 3. 分配运营和转化人员
curl -X POST http://localhost:1106/api/tiktok-accounts/1/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operationsUserId": 2,
    "conversionUserId": 3
  }'

# 4. 更新账号统计数据
curl -X POST http://localhost:1106/api/tiktok-accounts/1/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followersCount": 15000,
    "followingCount": 600,
    "videoCount": 55,
    "likesCount": 120000
  }'

# 5. 查看统计概览
curl -X GET http://localhost:1106/api/tiktok-accounts/statistics/overview \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 查询和筛选

### 多条件查询示例

```bash
# 查询A级已验证的账号
curl -X GET "http://localhost:1106/api/tiktok-accounts?accountLevel=A&isVerified=true" \
  -H "Authorization: Bearer $TOKEN"

# 查询指定运营人员负责的账号
curl -X GET "http://localhost:1106/api/tiktok-accounts?operationsUserId=2" \
  -H "Authorization: Bearer $TOKEN"

# 搜索美妆相关账号
curl -X GET "http://localhost:1106/api/tiktok-accounts?keyword=美妆" \
  -H "Authorization: Bearer $TOKEN"

# 查询未分配运营人员的账号
curl -X GET "http://localhost:1106/api/tiktok-accounts" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.accounts[] | select(.operationsUserId == null)'
```

## 🎯 业务场景

### 1. 新账号入库
```bash
# 批量导入新账号
for account in account1 account2 account3; do
  curl -X POST http://localhost:1106/api/tiktok-accounts \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"accountUrl\": \"https://www.tiktok.com/@${account}\",
      \"username\": \"${account}\",
      \"accountLevel\": \"D\",
      \"status\": \"pending\"
    }"
done
```

### 2. 账号分配管理
```bash
# 将多个账号分配给运营团队
curl -X POST http://localhost:1106/api/tiktok-accounts/batch-assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountIds": [1, 2, 3, 4, 5],
    "operationsUserId": 2,
    "conversionUserId": 3
  }'
```

### 3. 账号数据更新
```bash
# 定期更新账号统计数据
curl -X POST http://localhost:1106/api/tiktok-accounts/1/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followersCount": 20000,
    "followingCount": 800,
    "videoCount": 75,
    "likesCount": 250000
  }'
```

### 4. 账号状态管理
```bash
# 暂停问题账号
curl -X PATCH http://localhost:1106/api/tiktok-accounts/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'

# 封禁违规账号
curl -X PATCH http://localhost:1106/api/tiktok-accounts/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "banned"}'
```

## 📈 数据分析

### 获取各维度统计
```bash
# 获取整体统计
curl -X GET http://localhost:1106/api/tiktok-accounts/statistics/overview \
  -H "Authorization: Bearer $TOKEN"

# 按等级分组统计
curl -X GET http://localhost:1106/api/tiktok-accounts \
  -H "Authorization: Bearer $TOKEN" \
  | jq 'group_by(.accountLevel) | map({level: .[0].accountLevel, count: length})'

# 统计各用户负责的账号数量
curl -X GET http://localhost:1106/api/tiktok-accounts \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.accounts | group_by(.operationsUserId) | map({userId: .[0].operationsUserId, count: length})'
```

## 🔐 权限控制

### 角色权限映射

| 操作 | 权限代码 | 说明 |
|------|----------|------|
| 查看账号 | `account:read` | 查看TikTok账号列表和详情 |
| 创建账号 | `account:create` | 创建新的TikTok账号 |
| 更新账号 | `account:update` | 更新账号信息、分配用户 |
| 删除账号 | `account:delete` | 删除TikTok账号 |

### 角色建议
- **admin**: 所有权限
- **ops**: `account:read`, `account:create`, `account:update`
- **analyst**: `account:read`, `account:update`
- **viewer**: `account:read`

## 🛠️ 最佳实践

### 1. 账号等级分配原则
- **A级**: 粉丝>10万，月活跃度高
- **B级**: 粉丝1万-10万，有增长潜力
- **C级**: 粉丝1千-1万，需要运营
- **D级**: 粉丝<1千，新账号或待培养

### 2. 用户分配策略
- 运营人员按专业领域分配（美妆、美食、生活等）
- 转化人员按地区或用户群体分配
- 高等级账号优先分配给经验丰富的人员

### 3. 数据维护
- 定期更新账号统计数据
- 及时标记无效或问题账号
- 保持账号信息的准确性

### 4. 监控和告警
- 监控账号状态变化
- 关注粉丝数量异常波动
- 跟踪账号验证状态

## 🔄 与其他模块集成

### 与用户管理集成
- 分配的运营/转化人员必须是系统中的有效用户
- 支持查询用户负责的所有账号
- 用户删除时自动解除账号分配

### 与充值同步集成
- TikTok账号可以关联充值用户数据
- 支持账号维度的转化效果分析
- 提供账号ROI计算基础

### 与权限系统集成
- 基于RBAC的细粒度权限控制
- 支持不同角色的不同操作权限
- 数据访问权限隔离
