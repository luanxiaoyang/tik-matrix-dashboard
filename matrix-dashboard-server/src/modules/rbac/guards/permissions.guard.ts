import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      return false;
    }

    // 获取用户所有权限
    const userPermissions = user.roles.reduce((permissions, role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          permissions.add(permission.code);
        });
      }
      return permissions;
    }, new Set<string>());

    // 检查是否拥有所需权限
    return requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }
}
