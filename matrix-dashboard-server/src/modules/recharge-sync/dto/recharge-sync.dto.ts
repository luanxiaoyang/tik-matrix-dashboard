import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';

export class SyncRechargeFeatureDto {
  @ApiProperty({ 
    description: '用户ID列表，逗号分隔', 
    example: '123456,789012,345678'
  })
  @IsString()
  @IsNotEmpty({ message: '用户ID列表不能为空' })
  userIds: string;
}

export class BatchSyncRechargeFeatureDto {
  @ApiProperty({ 
    description: '用户ID数组', 
    example: [123456, 789012, 345678]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[];
}

// 外部API响应类型
export interface ExternalApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;  // YAY API使用 msg 字段
  data: T;
}

export interface UserRechargeFeatureItem {
  uid: number;
  totalRecharge: number;
  day1Coin: number;
  day2Coin: number;
  day7Coin: number;
  day30Coin: number;
  valuableUser: boolean;  // 注意：API返回的是 valuableUser
  hundredUser: boolean;   // 注意：API返回的是 hundredUser
  registerTime: number;
}

export interface UserRechargeFeatureResponse {
  items: UserRechargeFeatureItem[];
}

export class RechargeFeatureQueryDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @IsNumber()
  uid?: number;

  @ApiProperty({ description: '是否为价值用户', required: false })
  @IsOptional()
  isValuableUser?: boolean;

  @ApiProperty({ description: '是否为百元用户', required: false })
  @IsOptional()
  isHundredUser?: boolean;

  @ApiProperty({ description: '同步状态', enum: ['pending', 'success', 'failed'], required: false })
  @IsOptional()
  syncStatus?: 'pending' | 'success' | 'failed';
}
