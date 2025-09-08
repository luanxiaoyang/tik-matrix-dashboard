import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({ description: '刷新令牌（可选）', required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class LarkAuthDto {
  @ApiProperty({ description: 'Lark授权码' })
  @IsString()
  @IsNotEmpty({ message: '授权码不能为空' })
  code: string;
}
