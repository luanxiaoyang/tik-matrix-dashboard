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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';

@ApiTags('RBAC')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Permissions('permission:create')
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionService.create(createPermissionDto);
    return {
      code: 200,
      message: '创建成功',
      data: permission,
    };
  }

  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'tree', description: '是否返回树形结构', required: false })
  @Permissions('permission:read')
  @Get()
  async findAll(@Query('tree') tree?: string) {
    const permissions = tree === 'true' 
      ? await this.permissionService.findTree()
      : await this.permissionService.findAll();
    
    return {
      code: 200,
      message: '获取成功',
      data: permissions,
    };
  }

  @ApiOperation({ summary: '获取权限详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @Permissions('permission:read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionService.findOne(id);
    return {
      code: 200,
      message: '获取成功',
      data: permission,
    };
  }

  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @Permissions('permission:update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionService.update(id, updatePermissionDto);
    return {
      code: 200,
      message: '更新成功',
      data: permission,
    };
  }

  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @Permissions('permission:delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.permissionService.remove(id);
    return {
      code: 200,
      message: '删除成功',
    };
  }

  @ApiOperation({ summary: '根据父级ID获取权限列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'parentId', description: '父级权限ID', required: false })
  @Permissions('permission:read')
  @Get('parent/:parentId')
  async findByParentId(@Param('parentId', ParseIntPipe) parentId: number) {
    const permissions = await this.permissionService.findByParentId(parentId);
    return {
      code: 200,
      message: '获取成功',
      data: permissions,
    };
  }
}
