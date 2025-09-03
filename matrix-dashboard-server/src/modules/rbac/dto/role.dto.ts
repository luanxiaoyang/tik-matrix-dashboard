import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiProperty({ description: '角色代码', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '角色代码不能为空' })
  code: string;

  @ApiProperty({ description: '角色描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '权限ID列表', type: [Number] })
  @IsOptional()
  @IsArray()
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiProperty({ description: '角色名称', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  name?: string;

  @ApiProperty({ description: '角色代码', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '角色代码不能为空' })
  code?: string;

  @ApiProperty({ description: '角色描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '权限ID列表', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  permissionIds?: number[];
}

export class AssignRoleDto {
  @ApiProperty({ description: '用户ID列表', type: [Number] })
  @IsArray()
  @ArrayNotEmpty({ message: '用户ID列表不能为空' })
  userIds: number[];
}
