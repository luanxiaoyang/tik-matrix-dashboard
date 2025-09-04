import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../user/entities/user.entity';

interface LarkTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface LarkUserInfo {
  sub: string;
  name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

@Injectable()
export class LarkOAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.appId = this.configService.get('LARK_APP_ID');
    this.appSecret = this.configService.get('LARK_APP_SECRET');
    this.redirectUri = this.configService.get('LARK_REDIRECT_URI');
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
    });

    return `https://passport.larksuite.com/suite/passport/oauth/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<LarkTokenResponse> {
    const response = await fetch(
      'https://passport.larksuite.com/suite/passport/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.appId,
          client_secret: this.appSecret,
          code,
          redirect_uri: this.redirectUri,
        }),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('获取Lark访问令牌失败');
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<LarkUserInfo> {
    const response = await fetch(
      'https://passport.larksuite.com/suite/passport/oauth/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('获取Lark用户信息失败');
    }

    return response.json();
  }

  async findOrCreateUser(larkUserInfo: LarkUserInfo): Promise<User> {
    // 首先尝试通过larkUserId查找用户
    let user = await this.userRepository.findOne({
      where: { larkUserId: larkUserInfo.sub },
      relations: ['roles'],
    });

    if (user) {
      // 更新用户信息
      user.larkUserInfo = larkUserInfo;
      user.nickname = larkUserInfo.name;
      user.avatar = larkUserInfo.picture;
      return this.userRepository.save(user);
    }

    // 尝试通过邮箱查找现有用户
    user = await this.userRepository.findOne({
      where: { email: larkUserInfo.email },
      relations: ['roles'],
    });

    if (user) {
      // 绑定Lark账号到现有用户
      user.larkUserId = larkUserInfo.sub;
      user.larkUserInfo = larkUserInfo;
      user.nickname = larkUserInfo.name;
      user.avatar = larkUserInfo.picture;
      return this.userRepository.save(user);
    }

    // 创建新用户
    const newUser = this.userRepository.create({
      username: `lark_${larkUserInfo.sub}`,
      email: larkUserInfo.email,
      password: '', // Lark用户不需要密码
      nickname: larkUserInfo.name,
      avatar: larkUserInfo.picture,
      larkUserId: larkUserInfo.sub,
      larkUserInfo,
      status: UserStatus.ACTIVE, // 确保用户状态为激活
    });

    const savedUser = await this.userRepository.save(newUser);
    
    // 重新查询用户以包含关联的角色信息
    return this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async bindLarkAccount(userId: number, larkUserInfo: LarkUserInfo): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 检查Lark账号是否已被其他用户绑定
    const existingUser = await this.userRepository.findOne({
      where: { larkUserId: larkUserInfo.sub },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('该Lark账号已被其他用户绑定');
    }

    user.larkUserId = larkUserInfo.sub;
    user.larkUserInfo = larkUserInfo;
    user.nickname = user.nickname || larkUserInfo.name;
    user.avatar = user.avatar || larkUserInfo.picture;

    return this.userRepository.save(user);
  }

  async unbindLarkAccount(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    user.larkUserId = null;
    user.larkUserInfo = null;

    return this.userRepository.save(user);
  }
}
