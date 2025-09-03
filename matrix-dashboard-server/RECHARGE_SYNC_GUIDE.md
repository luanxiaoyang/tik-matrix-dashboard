# 充值功能同步模块使用指南

## 📋 模块概述

充值功能同步模块用于从YAY平台同步用户充值功能数据，包括总充值金额、各天数金币数量、用户类型等信息。

## 🔧 配置要求

### 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# YAY平台配置
YAY_USERNAME=your-yay-username
YAY_PASSWORD=your-yay-password
```

## 📊 数据表结构

### user_recharge_features 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键ID |
| uid | bigint | 用户ID |
| totalRecharge | bigint | 总充值金额(分) |
| day1Coin | decimal(10,2) | 第1天金币数 |
| day2Coin | decimal(10,2) | 第2天金币数 |
| day7Coin | decimal(10,2) | 第7天金币数 |
| day30Coin | decimal(10,2) | 第30天金币数 |
| isValuableUser | boolean | 是否为价值用户 |
| isHundredUser | boolean | 是否为百元用户 |
| registerTime | bigint | 注册时间戳 |
| lastSyncAt | timestamp | 最后同步时间 |
| syncStatus | enum | 同步状态(pending/success/failed) |
| syncError | text | 同步错误信息 |

## 🚀 API 接口

### 1. 同步用户充值功能数据

**接口**: `POST /api/recharge-sync/sync`  
**权限**: `recharge:create`

```bash
curl -X POST http://localhost:1106/api/recharge-sync/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userIds": "123456,789012,345678"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "同步完成",
  "data": {
    "syncedCount": 3,
    "failedCount": 0,
    "details": [
      {
        "uid": 123456,
        "status": "success",
        "message": "保存成功"
      }
    ]
  }
}
```

### 2. 批量同步用户充值功能数据

**接口**: `POST /api/recharge-sync/batch-sync`  
**权限**: `recharge:create`

```bash
curl -X POST http://localhost:1106/api/recharge-sync/batch-sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userIds": [123456, 789012, 345678]}'
```

### 3. 查询充值功能数据列表

**接口**: `GET /api/recharge-sync/list`  
**权限**: `recharge:read`

```bash
curl -X GET "http://localhost:1106/api/recharge-sync/list?page=1&limit=10&isValuableUser=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `uid`: 用户ID
- `isValuableUser`: 是否为价值用户
- `isHundredUser`: 是否为百元用户
- `syncStatus`: 同步状态

### 4. 查询单个用户充值功能数据

**接口**: `GET /api/recharge-sync/user/:uid`  
**权限**: `recharge:read`

```bash
curl -X GET http://localhost:1106/api/recharge-sync/user/123456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. 删除用户充值功能数据

**接口**: `DELETE /api/recharge-sync/user/:uid`  
**权限**: `recharge:delete`

```bash
curl -X DELETE http://localhost:1106/api/recharge-sync/user/123456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. 获取同步统计信息

**接口**: `GET /api/recharge-sync/stats`  
**权限**: `recharge:read`

```bash
curl -X GET http://localhost:1106/api/recharge-sync/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 1000,
    "successCount": 950,
    "failedCount": 50,
    "pendingCount": 0,
    "lastSyncAt": "2025-09-03T08:00:00.000Z"
  }
}
```

### 7. 重新同步指定用户数据

**接口**: `POST /api/recharge-sync/resync/:uid`  
**权限**: `recharge:update`

```bash
curl -X POST http://localhost:1106/api/recharge-sync/resync/123456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 测试接口

### 1. 测试YAY API连接

**接口**: `GET /api/recharge-sync/test/connection`  
**权限**: `system:monitor`

```bash
curl -X GET http://localhost:1106/api/recharge-sync/test/connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. 测试充值功能数据获取

**接口**: `GET /api/recharge-sync/test/recharge-feature`  
**权限**: `system:monitor`

```bash
curl -X GET "http://localhost:1106/api/recharge-sync/test/recharge-feature?userIds=123456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 认证机制

### YAY Token 自动管理

模块实现了完整的YAY平台认证机制：

1. **自动登录**: 使用配置的用户名密码自动登录YAY平台
2. **Token缓存**: 缓存有效的token，避免频繁登录
3. **自动刷新**: 当token过期或无效时自动刷新
4. **重试机制**: 登录失败时自动重试，最多3次
5. **错误处理**: 完善的错误处理和日志记录

### 请求头模拟

完全模拟浏览器请求头，包括：
- User-Agent: Chrome 浏览器标识
- Accept: 接受的内容类型
- Accept-Language: 语言偏好
- Origin/Referer: 来源信息
- sec-ch-ua: 浏览器安全标识
- sec-fetch-*: 安全获取标识

## 🚨 错误处理

### 常见错误及解决方案

1. **YAY登录失败**
   - 检查 `YAY_USERNAME` 和 `YAY_PASSWORD` 是否正确
   - 检查网络连接是否正常

2. **Token过期**
   - 系统会自动刷新token，无需手动处理

3. **外部API调用失败**
   - 检查YAY平台服务状态
   - 查看日志了解具体错误信息

4. **数据保存失败**
   - 检查数据库连接
   - 检查数据格式是否正确

## 📈 使用示例

### 1. 完整的同步流程

```bash
# 1. 先登录获取JWT token
TOKEN=$(curl -X POST http://localhost:1106/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.data.accessToken')

# 2. 测试YAY API连接
curl -X GET http://localhost:1106/api/recharge-sync/test/connection \
  -H "Authorization: Bearer $TOKEN"

# 3. 同步用户充值功能数据
curl -X POST http://localhost:1106/api/recharge-sync/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userIds": "123456,789012"}'

# 4. 查询同步结果
curl -X GET http://localhost:1106/api/recharge-sync/list \
  -H "Authorization: Bearer $TOKEN"

# 5. 查看统计信息
curl -X GET http://localhost:1106/api/recharge-sync/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 2. 批量同步大量用户

```bash
# 批量同步（自动分批处理）
curl -X POST http://localhost:1106/api/recharge-sync/batch-sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [123456, 789012, 345678, 456789, 567890]
  }'
```

## 🔍 监控和维护

### 日志监控

系统提供详细的日志记录：
- YAY登录状态
- API调用详情
- 数据同步结果
- 错误信息和堆栈

### 定期维护建议

1. **定期检查同步状态**: 使用统计接口监控同步成功率
2. **处理失败数据**: 查询失败的记录并重新同步
3. **清理过期数据**: 根据业务需求清理历史数据
4. **监控API性能**: 关注外部API调用耗时和成功率

## 🎯 最佳实践

1. **分批同步**: 大量用户建议使用批量同步接口
2. **错误重试**: 对失败的记录使用重新同步接口
3. **监控告警**: 设置同步失败率告警
4. **数据验证**: 定期验证同步数据的准确性
