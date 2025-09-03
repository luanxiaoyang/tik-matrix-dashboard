/**
 * 服务层统一导出
 * @description 所有API服务的统一入口
 */

// 健康检查服务
export { HealthService, getHealthCheck, type HealthCheckResponse } from './health'

// TODO: 添加其他服务模块
// export { AuthService } from './auth'
// export { UserService } from './user'
// export { RoleService } from './role'
// export { PermissionService } from './permission'