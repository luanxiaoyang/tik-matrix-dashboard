import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../user/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';

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
  private readonly yaychatAppId: string;
  private readonly yaychatAppSecret: string;
  private readonly yaychatRedirectUri: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    // 原有Lark配置
    this.appId = this.configService.get('LARK_APP_ID');
    this.appSecret = this.configService.get('LARK_APP_SECRET');
    this.redirectUri = this.configService.get('LARK_REDIRECT_URI');
    
    // YAYChat Lark配置
    this.yaychatAppId = this.configService.get('YAYCHAT_LARK_APP_ID');
    this.yaychatAppSecret = this.configService.get('YAYCHAT_LARK_APP_SECRET');
    this.yaychatRedirectUri = this.configService.get('YAYCHAT_LARK_REDIRECT_URI');
  }

  getAuthUrl(provider: 'lark' | 'yaychat' = 'lark'): string {
    const config = this.getLarkConfig(provider);
    
    const params = new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: provider, // 添加state参数标识使用的Lark主体
    });

    return `https://passport.larksuite.com/suite/passport/oauth/authorize?${params}`;
  }

  getYayChatAuthUrl(): string {
    return this.getAuthUrl('yaychat');
  }

  private getLarkConfig(provider: 'lark' | 'yaychat') {
    if (provider === 'yaychat') {
      return {
        appId: this.yaychatAppId,
        appSecret: this.yaychatAppSecret,
        redirectUri: this.yaychatRedirectUri,
      };
    } else {
      return {
        appId: this.appId,
        appSecret: this.appSecret,
        redirectUri: this.redirectUri,
      };
    }
  }

  async exchangeCodeForToken(code: string, provider: 'lark' | 'yaychat' = 'lark'): Promise<LarkTokenResponse> {
    const config = this.getLarkConfig(provider);
    
    const response = await fetch(
      'https://passport.larksuite.com/suite/passport/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.appId,
          client_secret: config.appSecret,
          code,
          redirect_uri: config.redirectUri,
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

    // 注释掉邮箱查找逻辑，确保每个Lark用户都创建独立账号
    // 如果需要邮箱绑定功能，应该通过专门的绑定接口来实现
    /*
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
    */

    // 创建新用户
    // 为了避免邮箱冲突，如果邮箱已存在，则使用larkUserId生成唯一邮箱
    let uniqueEmail = larkUserInfo.email;
    const existingEmailUser = await this.userRepository.findOne({
      where: { email: larkUserInfo.email },
    });
    
    if (existingEmailUser) {
      uniqueEmail = `lark_${larkUserInfo.sub}@lark.matrix.com`;
    }

    const newUser = this.userRepository.create({
      username: `lark_${larkUserInfo.sub}`,
      email: uniqueEmail,
      password: '', // Lark用户不需要密码
      nickname: larkUserInfo.name,
      avatar: larkUserInfo.picture,
      larkUserId: larkUserInfo.sub,
      larkUserInfo,
      status: UserStatus.ACTIVE, // 确保用户状态为激活
    });

    const savedUser = await this.userRepository.save(newUser);
    
    // 为新用户分配默认角色（viewer角色）
    const defaultRole = await this.roleRepository.findOne({
      where: { code: 'viewer' },
    });
    
    if (defaultRole) {
      savedUser.roles = [defaultRole];
      await this.userRepository.save(savedUser);
    }
    
    // 重新查询用户以包含关联的角色信息
    const userWithRoles = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'roles.permissions'],
    });
    
    // 确保角色权限被正确加载
    if (userWithRoles && userWithRoles.roles) {
      // 显式加载每个角色的权限
      for (const role of userWithRoles.roles) {
        if (role.permissions) {
          // 确保权限数据被加载
          await Promise.all(role.permissions.map(p => p.id));
        }
      }
    }
    
    return userWithRoles;
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
