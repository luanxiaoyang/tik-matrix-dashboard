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
import { TiktokAccountService } from './tiktok-account.service';
import {
  CreateTiktokAccountDto,
  UpdateTiktokAccountDto,
  AssignUserDto,
  TiktokAccountQueryDto,
  BatchAssignDto,
  UpdateStatsDto,
} from './dto/tiktok-account.dto';
import { AccountStatus } from './entities/tiktok-account.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('TikTok Account')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tiktok-accounts')
export class TiktokAccountController {
  constructor(private readonly tiktokAccountService: TiktokAccountService) {}

  @ApiOperation({ summary: '创建TikTok账号' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '账号链接已存在' })
  @Permissions('account:create')
  @Post()
  async create(@Body() createDto: CreateTiktokAccountDto) {
    const account = await this.tiktokAccountService.create(createDto);
    return {
      code: 200,
      message: '创建成功',
      data: account,
    };
  }

  @ApiOperation({ summary: '获取TikTok账号列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('account:read')
  @Get()
  async findAll(@Query() queryDto: TiktokAccountQueryDto) {
    const result = await this.tiktokAccountService.findAll(queryDto);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  @ApiOperation({ summary: '获取TikTok账号详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '账号不存在' })
  @ApiParam({ name: 'id', description: 'TikTok账号ID' })
  @Permissions('account:read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const account = await this.tiktokAccountService.findOne(id);
    return {
      code: 200,
      message: '获取成功',
      data: account,
    };
  }

  @ApiOperation({ summary: '更新TikTok账号' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '账号不存在' })
  @ApiParam({ name: 'id', description: 'TikTok账号ID' })
  @Permissions('account:update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTiktokAccountDto,
  ) {
    const account = await this.tiktokAccountService.update(id, updateDto);
    return {
      code: 200,
      message: '更新成功',
      data: account,
    };
  }

  @ApiOperation({ summary: '删除TikTok账号' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '账号不存在' })
  @ApiParam({ name: 'id', description: 'TikTok账号ID' })
  @Permissions('account:delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tiktokAccountService.remove(id);
    return {
      code: 200,
      message: '删除成功',
    };
  }

  @ApiOperation({ summary: '分配用户到TikTok账号' })
  @ApiResponse({ status: 200, description: '分配成功' })
  @ApiParam({ name: 'id', description: 'TikTok账号ID' })
  @Permissions('account:update')
  @Post(':id/assign')
  async assignUsers(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignUserDto,
  ) {
    const account = await this.tiktokAccountService.assignUsers(id, assignDto);
    return {
      code: 200,
      message: '分配成功',
      data: account,
    };
  }

  @ApiOperation({ summary: '批量分配用户' })
  @ApiResponse({ status: 200, description: '批量分配成功' })
  @Permissions('account:update')
  @Post('batch-assign')
  async batchAssign(@Body() batchAssignDto: BatchAssignDto) {
    await this.tiktokAccountService.batchAssign(batchAssignDto);
    return {
      code: 200,
      message: '批量分配成功',
    };
  }

  @ApiOperation({ summary: '更新TikTok账号统计数据' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: 'TikTok账号ID' })
  @Permissions('account:update')
  @Post(':id/stats')
  async updateStats(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatsDto: UpdateStatsDto,
  ) {
    const account = await this.tiktokAccountService.updateStats(id, updateStatsDto);
    return {
      code: 200,
      message: '统计数据更新成功',
      data: account,
    };
  }

  @ApiOperation({ summary: '更新TikTok账号状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiParam({ name: 'id', description: 'TikTok账号ID' })
  @Permissions('account:update')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: AccountStatus },
  ) {
    const account = await this.tiktokAccountService.updateStatus(id, body.status);
    return {
      code: 200,
      message: '状态更新成功',
      data: account,
    };
  }

  @ApiOperation({ summary: '获取用户分配的TikTok账号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'type', description: '用户类型', enum: ['operations', 'conversion'] })
  @Permissions('account:read')
  @Get('my-accounts')
  async getMyAccounts(
    @Request() req,
    @Query('type') type: 'operations' | 'conversion' = 'operations',
  ) {
    const accounts = await this.tiktokAccountService.getAccountsByUser(req.user.id, type);
    return {
      code: 200,
      message: '获取成功',
      data: accounts,
    };
  }

  @ApiOperation({ summary: '根据用户ID获取分配的TikTok账号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ name: 'type', description: '用户类型', enum: ['operations', 'conversion'] })
  @Permissions('account:read')
  @Get('user/:userId')
  async getAccountsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('type') type: 'operations' | 'conversion' = 'operations',
  ) {
    const accounts = await this.tiktokAccountService.getAccountsByUser(userId, type);
    return {
      code: 200,
      message: '获取成功',
      data: accounts,
    };
  }

  @ApiOperation({ summary: '获取TikTok账号统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('account:read')
  @Get('statistics/overview')
  async getStats() {
    const stats = await this.tiktokAccountService.getAccountStats();
    return {
      code: 200,
      message: '获取成功',
      data: stats,
    };
  }

  @ApiOperation({ summary: '根据链接查找TikTok账号' })
  @ApiResponse({ status: 200, description: '查找成功' })
  @ApiQuery({ name: 'url', description: 'TikTok账号链接' })
  @Permissions('account:read')
  @Get('search/by-url')
  async findByUrl(@Query('url') accountUrl: string) {
    const account = await this.tiktokAccountService.findByUrl(accountUrl);
    return {
      code: 200,
      message: account ? '找到账号' : '账号不存在',
      data: account,
    };
  }

  @ApiOperation({ summary: '根据手机号查找TikTok账号' })
  @ApiResponse({ status: 200, description: '查找成功' })
  @ApiParam({ name: 'phone', description: '手机号码' })
  @Permissions('account:read')
  @Get('search/by-phone/:phone')
  async findByPhone(@Param('phone') phoneNumber: string) {
    const accounts = await this.tiktokAccountService.findByPhone(phoneNumber);
    return {
      code: 200,
      message: '查找成功',
      data: accounts,
    };
  }
}
