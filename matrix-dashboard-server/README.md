# Matrix Dashboard Server

TikTok账号监控与引流归因统计服务端项目，基于 NestJS 10 构建。

## 🚀 功能特性

- ✅ **用户认证**: 支持账号密码登录 + Lark（飞书）扫码登录
- ✅ **权限管理**: 基于 RBAC 的完整权限体系
- ✅ **数据库**: MySQL 8 + TypeORM，提供完整的迁移脚本
- ✅ **API文档**: Swagger 自动生成，内置 Bearer 鉴权
- ✅ **容器化**: 提供 Docker 和 docker-compose 配置
- ✅ **安全性**: JWT 双令牌机制，密码 bcrypt 加密
- ✅ **外部集成**: YAY平台充值功能数据同步

## 📋 技术栈

- **框架**: NestJS 10 + TypeScript
- **数据库**: MySQL 8
- **ORM**: TypeORM (支持迁移)
- **认证**: JWT + Passport
- **文档**: Swagger UI
- **容器**: Docker + docker-compose
- **包管理**: pnpm (可降级 npm)

## 🏗️ 项目结构

```
src/
├── common/                 # 公共模块
│   ├── entities/          # 基础实体
│   └── controllers/       # 公共控制器
├── config/                # 配置文件
├── modules/               # 业务模块
│   ├── auth/             # 认证模块
│   ├── user/             # 用户模块
│   ├── rbac/             # 权限模块
│   └── recharge-sync/    # 充值功能同步模块
├── migrations/           # 数据库迁移
├── app.module.ts         # 应用主模块
└── main.ts              # 应用入口
```

## 🛠️ 快速开始

### 方式一：使用启动脚本（推荐）

```bash
# 1. 进入项目目录
cd matrix-dashboard-server

# 2. 运行启动脚本
./scripts/start.sh
```

### 方式二：手动启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息

# 3. 运行数据库迁移
pnpm run migration:run

# 4. 启动开发服务器
pnpm run start:dev
```

### 方式三：使用 Docker

```bash
# 1. 配置环境变量
cp .env.example .env

# 2. 启动所有服务（MySQL + Redis + App）
docker-compose up -d

# 3. 查看日志
docker-compose logs -f app
```

## 📝 环境配置

主要环境变量说明：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=matrix_dashboard

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Lark OAuth配置
LARK_APP_ID=your-lark-app-id
LARK_APP_SECRET=your-lark-app-secret
LARK_REDIRECT_URI=http://localhost:3000/auth/lark/callback

# 管理员默认账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@matrix.com

# YAY平台配置
YAY_USERNAME=your-yay-username
YAY_PASSWORD=your-yay-password
```

## 📖 API 文档

启动服务后，访问 Swagger 文档：

- 开发环境: http://localhost:3000/docs
- 生产环境: http://your-domain/docs

### 默认管理员账号

- 用户名: `admin` (可通过环境变量修改)
- 密码: `admin123` (可通过环境变量修改)

## 🔐 权限体系

### 预设角色

| 角色代码 | 角色名称 | 权限描述 |
|---------|----------|----------|
| `admin` | 超级管理员 | 拥有所有权限 |
| `ops` | 运营人员 | 账号管理、转化数据、充值管理 |
| `analyst` | 转化运营 | 查看和分析所有数据 |
| `viewer` | 只读用户 | 仅查看权限 |

### 权限模块

- **用户管理**: `user:read`, `user:create`, `user:update`, `user:delete`
- **角色管理**: `role:read`, `role:create`, `role:update`, `role:delete`
- **权限管理**: `permission:read`, `permission:create`, `permission:update`, `permission:delete`
- **账号管理**: `account:read`, `account:create`, `account:update`, `account:delete`
- **转化数据**: `conversion:read`, `conversion:create`, `conversion:update`, `conversion:delete`
- **充值管理**: `recharge:read`, `recharge:create`, `recharge:update`, `recharge:delete`

## 🗄️ 数据库管理

```bash
# 生成迁移文件
pnpm run migration:generate -- src/migrations/YourMigrationName

# 运行迁移
pnpm run migration:run

# 回滚迁移
pnpm run migration:revert

# 删除数据库架构
pnpm run schema:drop
```

## 🐳 Docker 部署

### 开发环境

```bash
# 启动开发环境（包含热重载）
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境

```bash
# 构建并启动生产环境
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

## 🔧 开发指南

### 添加新模块

```bash
# 使用 NestJS CLI 生成模块
nest g module modules/your-module
nest g controller modules/your-module
nest g service modules/your-module
```

### 权限装饰器使用

```typescript
import { Permissions } from '@/modules/rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/rbac/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('user:create')
@Post()
async create() {
  // 需要 user:create 权限才能访问
}
```

## 🧪 测试

```bash
# 单元测试
pnpm run test

# 端到端测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov
```

## 📋 NPM 脚本

```bash
pnpm run start          # 启动生产版本
pnpm run start:dev      # 启动开发版本（热重载）
pnpm run start:debug    # 启动调试版本
pnpm run build          # 构建项目
pnpm run lint           # 代码检查
pnpm run format         # 代码格式化
```

## ⚡ 性能优化

- 使用连接池优化数据库连接
- JWT 令牌黑名单机制
- API 响应缓存（可选 Redis）
- 分页查询避免大数据集
- 索引优化提升查询性能

## 🛡️ 安全特性

- 密码 bcrypt 加密存储
- JWT 双令牌机制（访问令牌 + 刷新令牌）
- 请求参数验证和转换
- CORS 跨域保护
- 权限细粒度控制
- SQL 注入防护（TypeORM）

## 📞 技术支持

如有问题，请联系开发团队或提交 Issue。

## 📄 许可证

MIT License
