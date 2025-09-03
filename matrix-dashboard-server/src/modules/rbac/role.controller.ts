import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';

@ApiTags('RBAC')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Permissions('role:create')
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    return {
      code: 200,
      message: '创建成功',
      data: role,
    };
  }

  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('role:read')
  @Get()
  async findAll() {
    const roles = await this.roleService.findAll();
    return {
      code: 200,
      message: '获取成功',
      data: roles,
    };
  }

  @ApiOperation({ summary: '获取角色详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.roleService.findOne(id);
    return {
      code: 200,
      message: '获取成功',
      data: role,
    };
  }

  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.roleService.update(id, updateRoleDto);
    return {
      code: 200,
      message: '更新成功',
      data: role,
    };
  }

  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.remove(id);
    return {
      code: 200,
      message: '删除成功',
    };
  }

  @ApiOperation({ summary: '为角色添加权限' })
  @ApiResponse({ status: 200, description: '添加成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:update')
  @Post(':id/permissions')
  async addPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionIds: number[] },
  ) {
    const role = await this.roleService.addPermissions(id, body.permissionIds);
    return {
      code: 200,
      message: '添加成功',
      data: role,
    };
  }

  @ApiOperation({ summary: '移除角色权限' })
  @ApiResponse({ status: 200, description: '移除成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:update')
  @Delete(':id/permissions')
  async removePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionIds: number[] },
  ) {
    const role = await this.roleService.removePermissions(id, body.permissionIds);
    return {
      code: 200,
      message: '移除成功',
      data: role,
    };
  }
}
