# 简化填报功能使用指南

## 📋 功能概述

简化的填报功能专注于记录TikTok账号与YAYChat用户ID的关联关系，去除了复杂的审核流程，提交即记录。

## 🗄️ 数据表结构

### report_submissions 表（简化版）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键ID |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |
| deletedAt | timestamp | 删除时间（软删除） |
| submitterId | int | 提交人ID（当前登录用户） |
| tiktokAccountId | int | 关联的TikTok账号ID |
| yaychatUserId | bigint | YAYChat平台的用户ID |

## 🚀 API 接口

### 1. 创建填报记录

**接口**: `POST /api/report-submissions`  
**权限**: `conversion:create`

```bash
curl -X POST http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokAccountId": 1,
    "yaychatUserId": 1780153
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "填报记录创建成功",
  "data": {
    "id": 1,
    "submitterId": 1,
    "tiktokAccountId": 1,
    "yaychatUserId": 1780153,
    "createdAt": "2025-09-09T10:06:24.864Z",
    "updatedAt": "2025-09-09T10:06:24.864Z",
    "deletedAt": null
  }
}
```

### 2. 查询填报记录列表

**接口**: `GET /api/report-submissions`  
**权限**: `conversion:read`

```bash
# 基本查询
curl -X GET http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 分页查询
curl -X GET "http://localhost:1106/api/report-submissions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 按提交人查询
curl -X GET "http://localhost:1106/api/report-submissions?submitterId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 按TikTok账号查询
curl -X GET "http://localhost:1106/api/report-submissions?tiktokAccountId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 按YAYChat用户查询
curl -X GET "http://localhost:1106/api/report-submissions?yaychatUserId=1780153" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 获取填报记录详情

**接口**: `GET /api/report-submissions/:id`  
**权限**: `conversion:read`

```bash
curl -X GET http://localhost:1106/api/report-submissions/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 删除填报记录

**接口**: `DELETE /api/report-submissions/:id`  
**权限**: `conversion:delete`

```bash
curl -X DELETE http://localhost:1106/api/report-submissions/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. 根据YAYChat用户ID查找

**接口**: `GET /api/report-submissions/yaychat-user/:yaychatUserId`  
**权限**: `conversion:read`

```bash
curl -X GET http://localhost:1106/api/report-submissions/yaychat-user/1780153 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. 根据TikTok账号ID查找

**接口**: `GET /api/report-submissions/tiktok-account/:tiktokAccountId`  
**权限**: `conversion:read`

```bash
curl -X GET http://localhost:1106/api/report-submissions/tiktok-account/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. 获取统计信息

**接口**: `GET /api/report-submissions/statistics/overview`  
**权限**: `conversion:read`

```bash
curl -X GET http://localhost:1106/api/report-submissions/statistics/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 10,
    "todayCount": 5
  }
}
```

## 📊 使用示例

### 完整的填报流程

```bash
# 1. 登录获取token
TOKEN=$(curl -X POST http://localhost:1106/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.data.accessToken')

# 2. 查看可用的TikTok账号
curl -X GET http://localhost:1106/api/tiktok-accounts \
  -H "Authorization: Bearer $TOKEN"

# 3. 创建填报记录（简单记录）
curl -X POST http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokAccountId": 1,
    "yaychatUserId": 1780153
  }'

# 4. 查看填报记录
curl -X GET http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer $TOKEN"

# 5. 查看统计信息
curl -X GET http://localhost:1106/api/report-submissions/statistics/overview \
  -H "Authorization: Bearer $TOKEN"
```

### 批量记录示例

```bash
# 批量创建多个关联记录
for yaychat_id in 1780153 1791650 1365401; do
  curl -X POST http://localhost:1106/api/report-submissions \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"tiktokAccountId\": 1,
      \"yaychatUserId\": $yaychat_id
    }"
done
```

### 数据查询示例

```bash
# 查询指定YAYChat用户的所有关联记录
curl -X GET http://localhost:1106/api/report-submissions/yaychat-user/1780153 \
  -H "Authorization: Bearer $TOKEN"

# 查询指定TikTok账号的所有关联记录
curl -X GET http://localhost:1106/api/report-submissions/tiktok-account/1 \
  -H "Authorization: Bearer $TOKEN"

# 查看今天的填报统计
curl -X GET http://localhost:1106/api/report-submissions/statistics/overview \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 业务场景

### 1. 账号关联记录

当需要建立TikTok账号与YAYChat用户的关联关系时：

```bash
curl -X POST http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokAccountId": 1,
    "yaychatUserId": 1780153
  }'
```

### 2. 数据追踪记录

为了追踪转化效果，记录账号与用户的对应关系：

```bash
# 记录A级账号与高价值用户的关联
curl -X POST http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tiktokAccountId": 1,
    "yaychatUserId": 1780153
  }'
```

### 3. 关联关系查询

查询特定用户或账号的所有关联记录：

```bash
# 查询用户1780153的所有关联账号
curl -X GET http://localhost:1106/api/report-submissions/yaychat-user/1780153 \
  -H "Authorization: Bearer $TOKEN"

# 查询TikTok账号1的所有关联用户
curl -X GET http://localhost:1106/api/report-submissions/tiktok-account/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 📈 数据分析

### 关联关系统计

```bash
# 获取基本统计
curl -X GET http://localhost:1106/api/report-submissions/statistics/overview \
  -H "Authorization: Bearer $TOKEN"

# 分析关联分布
curl -X GET http://localhost:1106/api/report-submissions \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.reports | group_by(.tiktokAccountId) | map({accountId: .[0].tiktokAccountId, userCount: length})'
```

## ✅ 测试验证

### 当前测试数据

从测试结果可以看到：

**3个填报记录**:
1. **记录1**: TikTok账号1 (测试账号1) ↔ YAYChat用户 1780153
2. **记录2**: TikTok账号2 (美妆达人小美) ↔ YAYChat用户 1791650  
3. **记录3**: TikTok账号3 (美食家小厨) ↔ YAYChat用户 1365401

**统计信息**:
- 总记录数: 3
- 今日提交: 3

### 核心功能验证

1. ✅ **简单创建**: 只需提供tiktokAccountId和yaychatUserId
2. ✅ **自动记录**: 提交即保存，无需审核流程
3. ✅ **关联查询**: 支持双向关联查询
4. ✅ **数据完整**: 包含提交人和关联账号信息
5. ✅ **统计功能**: 基本的数量统计

## 🔧 简化优势

相比复杂版本，简化后的填报功能具有：

1. ✅ **使用简单**: 只需2个必填参数
2. ✅ **响应快速**: 无复杂的审核流程
3. ✅ **数据纯净**: 专注于核心关联关系
4. ✅ **维护容易**: 简单的表结构和逻辑
5. ✅ **性能优秀**: 查询效率高

填报功能已简化完成，专注于记录TikTok账号与YAYChat用户的关联关系！🎊
