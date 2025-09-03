import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { PermissionType } from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称', example: '用户管理' })
  @IsString()
  @IsNotEmpty({ message: '权限名称不能为空' })
  name: string;

  @ApiProperty({ description: '权限代码', example: 'user:read' })
  @IsString()
  @IsNotEmpty({ message: '权限代码不能为空' })
  code: string;

  @ApiProperty({ description: '权限类型', enum: PermissionType })
  @IsEnum(PermissionType)
  type: PermissionType;

  @ApiProperty({ description: '权限描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '父级权限ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '资源路径', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number;
}

export class UpdatePermissionDto {
  @ApiProperty({ description: '权限名称', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '权限名称不能为空' })
  name?: string;

  @ApiProperty({ description: '权限代码', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '权限代码不能为空' })
  code?: string;

  @ApiProperty({ description: '权限类型', enum: PermissionType, required: false })
  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType;

  @ApiProperty({ description: '权限描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '父级权限ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '资源路径', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sort?: number;
}
