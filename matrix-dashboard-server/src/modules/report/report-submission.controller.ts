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
} from '@nestjs/swagger';
import { ReportSubmissionService } from './report-submission.service';
import {
  CreateReportSubmissionDto,
  ReportQueryDto,
} from './dto/report-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('Report Submission')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('report-submissions')
export class ReportSubmissionController {
  constructor(private readonly reportSubmissionService: ReportSubmissionService) {}

  @ApiOperation({ summary: '创建填报记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误或记录已存在' })
  @Permissions('conversion:create')
  @Post()
  async create(
    @Body() createDto: CreateReportSubmissionDto,
    @Request() req,
  ) {
    const report = await this.reportSubmissionService.create(createDto, req.user.id);
    return {
      code: 200,
      message: '填报记录创建成功',
      data: report,
    };
  }

  @ApiOperation({ summary: '获取填报记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('conversion:read')
  @Get()
  async findAll(@Query() queryDto: ReportQueryDto) {
    const result = await this.reportSubmissionService.findAll(queryDto);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }


  @ApiOperation({ summary: '获取填报记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @ApiParam({ name: 'id', description: '填报记录ID' })
  @Permissions('conversion:read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const report = await this.reportSubmissionService.findOne(id);
    return {
      code: 200,
      message: '获取成功',
      data: report,
    };
  }


  @ApiOperation({ summary: '删除填报记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiParam({ name: 'id', description: '填报记录ID' })
  @Permissions('conversion:delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.reportSubmissionService.remove(id);
    return {
      code: 200,
      message: '删除成功',
    };
  }


  @ApiOperation({ summary: '根据YAYChat用户ID查找填报记录' })
  @ApiResponse({ status: 200, description: '查找成功' })
  @ApiParam({ name: 'yaychatUserId', description: 'YAYChat用户ID' })
  @Permissions('conversion:read')
  @Get('yaychat-user/:yaychatUserId')
  async findByYaychatUserId(@Param('yaychatUserId', ParseIntPipe) yaychatUserId: number) {
    const reports = await this.reportSubmissionService.findByYaychatUserId(yaychatUserId);
    return {
      code: 200,
      message: '查找成功',
      data: reports,
    };
  }

  @ApiOperation({ summary: '根据TikTok账号ID查找填报记录' })
  @ApiResponse({ status: 200, description: '查找成功' })
  @ApiParam({ name: 'tiktokAccountId', description: 'TikTok账号ID' })
  @Permissions('conversion:read')
  @Get('tiktok-account/:tiktokAccountId')
  async findByTiktokAccountId(@Param('tiktokAccountId', ParseIntPipe) tiktokAccountId: number) {
    const reports = await this.reportSubmissionService.findByTiktokAccountId(tiktokAccountId);
    return {
      code: 200,
      message: '查找成功',
      data: reports,
    };
  }

  @ApiOperation({ summary: '获取填报统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('conversion:read')
  @Get('statistics/overview')
  async getStats() {
    const stats = await this.reportSubmissionService.getReportStats();
    return {
      code: 200,
      message: '获取成功',
      data: stats,
    };
  }
}
