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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  AssignRolesDto,
} from './dto/user.dto';
import { UserStatus } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Permissions('user:create')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      code: 200,
      message: '创建成功',
      data: user,
    };
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @Permissions('user:read')
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const result = await this.userService.findAll(+page, +limit);
    return {
      code: 200,
      message: '获取成功',
      data: {
        users: result.users,
        total: result.total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(result.total / +limit),
      },
    };
  }

  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    return {
      code: 200,
      message: '获取成功',
      data: user,
    };
  }

  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      code: 200,
      message: '更新成功',
      data: user,
    };
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return {
      code: 200,
      message: '删除成功',
    };
  }

  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(req.user.id, changePasswordDto);
    return {
      code: 200,
      message: '修改成功',
    };
  }

  @ApiOperation({ summary: '重置用户密码' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:update')
  @Post(':id/reset-password')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.userService.resetPassword(id, resetPasswordDto);
    return {
      code: 200,
      message: '重置成功',
    };
  }

  @ApiOperation({ summary: '分配角色' })
  @ApiResponse({ status: 200, description: '分配成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:update')
  @Post(':id/roles')
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const user = await this.userService.assignRoles(id, assignRolesDto);
    return {
      code: 200,
      message: '分配成功',
      data: user,
    };
  }

  @ApiOperation({ summary: '更新用户状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:update')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: UserStatus },
  ) {
    const user = await this.userService.updateStatus(id, body.status);
    return {
      code: 200,
      message: '更新成功',
      data: user,
    };
  }

  @ApiOperation({ summary: '获取用户权限' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @Permissions('user:read')
  @Get(':id/permissions')
  async getUserPermissions(@Param('id', ParseIntPipe) id: number) {
    const permissions = await this.userService.getUserPermissions(id);
    return {
      code: 200,
      message: '获取成功',
      data: permissions,
    };
  }
}
