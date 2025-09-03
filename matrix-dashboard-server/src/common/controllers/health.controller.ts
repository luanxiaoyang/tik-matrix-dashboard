import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务正常' })
  @Get()
  async check() {
    try {
      // 检查数据库连接
      await this.userRepository.count();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
