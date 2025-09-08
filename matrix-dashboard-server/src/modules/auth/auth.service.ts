import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserStatus } from '../user/entities/user.entity';
import { RefreshTokenService } from './refresh-token.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }],
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto, ip?: string): Promise<LoginResult> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新登录信息
    await this.updateLoginInfo(user.id, ip);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles ? user.roles.map((role) => role.code) : [],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
      ip,
    );

    return {
      user,
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async larkLogin(user: User, ip?: string): Promise<LoginResult> {
    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('用户状态异常');
    }

    // 更新登录信息
    await this.updateLoginInfo(user.id, ip);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles ? user.roles.map((role) => role.code) : [],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
      ip,
    );

    return {
      user,
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async refreshToken(refreshTokenValue: string): Promise<LoginResult> {
    const refreshToken = await this.refreshTokenService.validateRefreshToken(
      refreshTokenValue,
    );

    const user = await this.userRepository.findOne({
      where: { id: refreshToken.userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('用户状态异常');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles ? user.roles.map((role) => role.code) : [],
    };

    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    // 撤销旧的刷新令牌
    await this.refreshTokenService.revokeRefreshToken(refreshTokenValue);

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  async logout(refreshTokenValue: string): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(refreshTokenValue);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async updateLoginInfo(userId: number, ip?: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      loginCount: () => 'loginCount + 1',
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }
}
