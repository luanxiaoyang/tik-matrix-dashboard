import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountLevel, AccountStatus } from '../entities/tiktok-account.entity';

export class CreateTiktokAccountDto {
  @ApiProperty({ description: 'TikTok账号链接', example: 'https://www.tiktok.com/@username' })
  @IsString()
  @IsNotEmpty({ message: 'TikTok账号链接不能为空' })
  @IsUrl({}, { message: 'TikTok账号链接格式不正确' })
  accountUrl: string;

  @ApiProperty({ description: 'TikTok账号名称', required: false })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiProperty({ description: 'TikTok用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;




  @ApiProperty({ description: '账号等级', enum: AccountLevel })
  @IsEnum(AccountLevel, { message: '账号等级必须是 A、B、C、D 之一' })
  accountLevel: AccountLevel;

  @ApiProperty({ description: '账号状态', enum: AccountStatus, default: AccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiProperty({ description: '粉丝数量', default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  followersCount?: number;

  @ApiProperty({ description: '关注数量', default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  followingCount?: number;

  @ApiProperty({ description: '视频数量', default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoCount?: number;

  @ApiProperty({ description: '点赞数量', default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  likesCount?: number;

  @ApiProperty({ description: '分配的运营人员ID', required: false })
  @IsOptional()
  @IsNumber()
  operationsUserId?: number;

  @ApiProperty({ description: '分配的转化人员ID', required: false })
  @IsOptional()
  @IsNumber()
  conversionUserId?: number;

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '是否已验证', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ description: '标签列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '地区信息', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: '语言', required: false })
  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateTiktokAccountDto {
  @ApiProperty({ description: 'TikTok账号链接', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'TikTok账号链接不能为空' })
  @IsUrl({}, { message: 'TikTok账号链接格式不正确' })
  accountUrl?: string;

  @ApiProperty({ description: 'TikTok账号名称', required: false })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiProperty({ description: 'TikTok用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;



  @ApiProperty({ description: '账号等级', enum: AccountLevel, required: false })
  @IsOptional()
  @IsEnum(AccountLevel, { message: '账号等级必须是 A、B、C、D 之一' })
  accountLevel?: AccountLevel;

  @ApiProperty({ description: '账号状态', enum: AccountStatus, required: false })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiProperty({ description: '粉丝数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  followersCount?: number;

  @ApiProperty({ description: '关注数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  followingCount?: number;

  @ApiProperty({ description: '视频数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoCount?: number;

  @ApiProperty({ description: '点赞数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  likesCount?: number;

  @ApiProperty({ description: '分配的运营人员ID', required: false })
  @IsOptional()
  @IsNumber()
  operationsUserId?: number;

  @ApiProperty({ description: '分配的转化人员ID', required: false })
  @IsOptional()
  @IsNumber()
  conversionUserId?: number;

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '是否已验证', required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ description: '标签列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '地区信息', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: '语言', required: false })
  @IsOptional()
  @IsString()
  language?: string;
}

export class AssignUserDto {
  @ApiProperty({ description: '运营人员ID', required: false })
  @IsOptional()
  @IsNumber()
  operationsUserId?: number;

  @ApiProperty({ description: '转化人员ID', required: false })
  @IsOptional()
  @IsNumber()
  conversionUserId?: number;
}

export class TiktokAccountQueryDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: '账号等级', enum: AccountLevel, required: false })
  @IsOptional()
  @IsEnum(AccountLevel)
  accountLevel?: AccountLevel;

  @ApiProperty({ description: '账号状态', enum: AccountStatus, required: false })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiProperty({ description: '运营人员ID', required: false })
  @IsOptional()
  @IsNumber()
  operationsUserId?: number;

  @ApiProperty({ description: '转化人员ID', required: false })
  @IsOptional()
  @IsNumber()
  conversionUserId?: number;

  @ApiProperty({ description: '是否已验证', required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ description: '搜索关键词（账号名称或用户名）', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '地区', required: false })
  @IsOptional()
  @IsString()
  region?: string;
}

export class BatchAssignDto {
  @ApiProperty({ description: 'TikTok账号ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  accountIds: number[];

  @ApiProperty({ description: '运营人员ID', required: false })
  @IsOptional()
  @IsNumber()
  operationsUserId?: number;

  @ApiProperty({ description: '转化人员ID', required: false })
  @IsOptional()
  @IsNumber()
  conversionUserId?: number;
}

export class UpdateStatsDto {
  @ApiProperty({ description: '粉丝数量' })
  @IsNumber()
  @Min(0)
  followersCount: number;

  @ApiProperty({ description: '关注数量' })
  @IsNumber()
  @Min(0)
  followingCount: number;

  @ApiProperty({ description: '视频数量' })
  @IsNumber()
  @Min(0)
  videoCount: number;

  @ApiProperty({ description: '点赞数量' })
  @IsNumber()
  @Min(0)
  likesCount: number;
}
