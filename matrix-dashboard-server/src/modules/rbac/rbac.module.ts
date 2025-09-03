import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RoleService, PermissionService],
  controllers: [RoleController, PermissionController],
  exports: [RoleService, PermissionService],
})
export class RbacModule {}
