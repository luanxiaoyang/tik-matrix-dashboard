import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '用户状态', enum: UserStatus, default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: '角色ID列表', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  roleIds?: number[];
}

export class UpdateUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '用户状态', enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: '角色ID列表', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  roleIds?: number[];
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: '新密码' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  newPassword: string;
}

export class AssignRolesDto {
  @ApiProperty({ description: '角色ID列表', type: [Number] })
  @IsArray()
  roleIds: number[];
}
