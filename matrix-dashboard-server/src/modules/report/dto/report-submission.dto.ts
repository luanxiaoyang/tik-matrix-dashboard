import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateReportSubmissionDto {
  @ApiProperty({ description: '关联的TikTok账号ID' })
  @IsNumber()
  tiktokAccountId: number;

  @ApiProperty({ description: 'YAYChat用户ID' })
  @IsNumber()
  yaychatUserId: number;

  @ApiProperty({ description: '提交数据', type: 'object' })
  @IsOptional()
  @IsObject()
  submissionData?: Record<string, any>;
}

export class ReportQueryDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: '提交人ID', required: false })
  @IsOptional()
  @IsNumber()
  submitterId?: number;

  @ApiProperty({ description: 'TikTok账号ID', required: false })
  @IsOptional()
  @IsNumber()
  tiktokAccountId?: number;

  @ApiProperty({ description: 'YAYChat用户ID', required: false })
  @IsOptional()
  @IsNumber()
  yaychatUserId?: number;
}
