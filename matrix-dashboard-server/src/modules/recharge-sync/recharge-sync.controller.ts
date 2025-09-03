import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
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
import { RechargeSyncService } from './services/recharge-sync.service';
import { TestApiService } from './services/test-api.service';
import { DirectApiService } from './services/direct-api.service';
import { DirectSyncService } from './services/direct-sync.service';
import { 
  SyncRechargeFeatureDto, 
  BatchSyncRechargeFeatureDto,
  RechargeFeatureQueryDto
} from './dto/recharge-sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('Recharge Sync')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('recharge-sync')
export class RechargeSyncController {
  constructor(
    private readonly rechargeSyncService: RechargeSyncService,
    private readonly testApiService: TestApiService,
    private readonly directApiService: DirectApiService,
    private readonly directSyncService: DirectSyncService,
  ) {}

  @ApiOperation({ summary: '同步用户充值功能数据' })
  @ApiResponse({ status: 200, description: '同步成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @Permissions('recharge:create')
  @Post('sync')
  async syncUserRechargeFeature(@Body() syncDto: SyncRechargeFeatureDto) {
    const result = await this.rechargeSyncService.syncUserRechargeFeature(syncDto);
    
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      data: {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        details: result.details,
      },
    };
  }

  @ApiOperation({ summary: '批量同步用户充值功能数据' })
  @ApiResponse({ status: 200, description: '批量同步成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @Permissions('recharge:create')
  @Post('batch-sync')
  async batchSyncUserRechargeFeature(@Body() batchSyncDto: BatchSyncRechargeFeatureDto) {
    const result = await this.rechargeSyncService.batchSyncUserRechargeFeature(batchSyncDto);
    
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      data: {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        details: result.details,
      },
    };
  }

  @ApiOperation({ summary: '查询用户充值功能数据列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('recharge:read')
  @Get('list')
  async findUserRechargeFeatures(@Query() queryDto: RechargeFeatureQueryDto) {
    const result = await this.rechargeSyncService.findUserRechargeFeatures(queryDto);
    
    return {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }

  @ApiOperation({ summary: '根据用户ID查询充值功能数据' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '用户数据不存在' })
  @ApiParam({ name: 'uid', description: '用户ID' })
  @Permissions('recharge:read')
  @Get('user/:uid')
  async findUserRechargeFeatureByUid(@Param('uid', ParseIntPipe) uid: number) {
    const result = await this.rechargeSyncService.findUserRechargeFeatureByUid(uid);
    
    if (!result) {
      return {
        code: 404,
        message: '用户充值功能数据不存在',
        data: null,
      };
    }

    return {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }

  @ApiOperation({ summary: '删除用户充值功能数据' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户数据不存在' })
  @ApiParam({ name: 'uid', description: '用户ID' })
  @Permissions('recharge:delete')
  @Delete('user/:uid')
  async deleteUserRechargeFeature(@Param('uid', ParseIntPipe) uid: number) {
    const result = await this.rechargeSyncService.deleteUserRechargeFeature(uid);
    
    if (!result) {
      return {
        code: 404,
        message: '用户充值功能数据不存在',
        data: null,
      };
    }

    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @ApiOperation({ summary: '获取同步统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('recharge:read')
  @Get('stats')
  async getSyncStats() {
    const stats = await this.rechargeSyncService.getSyncStats();
    
    return {
      code: 200,
      message: '获取成功',
      data: stats,
    };
  }

  @ApiOperation({ summary: '重新同步指定用户数据' })
  @ApiResponse({ status: 200, description: '重新同步成功' })
  @ApiParam({ name: 'uid', description: '用户ID' })
  @Permissions('recharge:update')
  @Post('resync/:uid')
  async resyncUserRechargeFeature(@Param('uid', ParseIntPipe) uid: number) {
    const syncDto: SyncRechargeFeatureDto = {
      userIds: uid.toString(),
    };
    
    const result = await this.rechargeSyncService.syncUserRechargeFeature(syncDto);
    
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      data: {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
      },
    };
  }

  @ApiOperation({ summary: '测试YAY API连接' })
  @ApiResponse({ status: 200, description: '测试成功' })
  @Permissions('system:monitor')
  @Get('test/connection')
  async testConnection() {
    const result = await this.testApiService.testConnection();
    
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      data: result,
    };
  }

  @ApiOperation({ summary: '测试获取用户充值功能数据接口' })
  @ApiResponse({ status: 200, description: '测试成功' })
  @Permissions('system:monitor')
  @Get('test/recharge-feature')
  async testGetUserRechargeFeature(@Query('userIds') userIds: string = '123456') {
    const result = await this.testApiService.testGetUserRechargeFeature(userIds);
    
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      data: result,
    };
  }

  @ApiOperation({ summary: '使用指定token直接测试YAY API' })
  @ApiResponse({ status: 200, description: '测试成功' })
  @Permissions('system:monitor')
  @Post('test/direct-api')
  async testDirectApi(@Body() body: { userIds: string; token: string }) {
    try {
      const result = await this.directApiService.getUserRechargeFeatureWithToken(
        body.userIds, 
        body.token
      );
      
      return {
        code: 200,
        message: '直接API调用成功',
        data: result,
      };
    } catch (error) {
      return {
        code: 500,
        message: `直接API调用失败: ${error.message}`,
        data: null,
      };
    }
  }

  @ApiOperation({ summary: '使用指定token直接同步并保存数据' })
  @ApiResponse({ status: 200, description: '同步成功' })
  @Permissions('recharge:create')
  @Post('sync-direct')
  async syncDirect(@Body() body: { userIds: string; token: string }) {
    const result = await this.directSyncService.syncWithToken(body.userIds, body.token);
    
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      data: {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        savedData: result.data,
        details: result.details,
      },
    };
  }

  @ApiOperation({ summary: '调试YAY登录过程' })
  @ApiResponse({ status: 200, description: '调试成功' })
  @Permissions('system:monitor')
  @Get('debug/login')
  async debugLogin() {
    try {
      // 直接测试YAY登录
      const username = 'd43a65ac';
      const password = 'yaychat520';
      
      const loginUrl = 'https://opadmin-api.yay.chat/login';
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

      const headers = {
        'User-Agent': userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://opadmin.yay.chat',
        'Referer': 'https://opadmin.yay.chat/',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'priority': 'u=1, i',
      };

      const loginData = { username, password };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(loginData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      return {
        code: 200,
        message: '调试完成',
        data: {
          requestUrl: loginUrl,
          requestHeaders: headers,
          requestBody: loginData,
          responseStatus: response.status,
          responseStatusText: response.statusText,
          responseData: result,
          success: response.ok && result.code === 200,
        },
      };

    } catch (error) {
      return {
        code: 500,
        message: `调试失败: ${error.message}`,
        data: {
          error: error.message,
          stack: error.stack,
        },
      };
    }
  }
}
