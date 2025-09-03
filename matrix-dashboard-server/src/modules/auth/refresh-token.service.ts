import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService,
  ) {}

  async createRefreshToken(
    userId: number,
    ip?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    const token = uuidv4();
    const expiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN');
    const expiresAt = new Date();
    
    // 解析过期时间
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1));
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1));
      expiresAt.setHours(expiresAt.getHours() + hours);
    }

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      createdIp: ip,
      userAgent,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('刷新令牌无效');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('刷新令牌已被撤销');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('刷新令牌已过期');
    }

    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true },
    );
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
