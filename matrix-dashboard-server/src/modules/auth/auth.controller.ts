import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Redirect,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LarkOAuthService } from './lark-oauth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RefreshTokenDto, LarkAuthDto, LogoutDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private larkOAuthService: LarkOAuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: '账号密码登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.login(loginDto, ip);
    return {
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          roles: result.user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            code: role.code,
            permissions: role.permissions?.map((p) => p.code) || [],
          })),
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      code: 200,
      message: '刷新成功',
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          roles: result.user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            code: role.code,
            permissions: role.permissions?.map((p) => p.code) || [],
          })),
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @ApiOperation({ summary: '登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto, @Request() req) {
    if (logoutDto.refreshToken) {
      // 如果提供了refreshToken，则撤销指定token
      await this.authService.logout(logoutDto.refreshToken);
    } else {
      // 如果没有提供refreshToken，则撤销用户的所有token
      await this.authService.logoutAll(req.user.id);
    }
    return {
      code: 200,
      message: '登出成功',
    };
  }

  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const user = req.user;
    return {
      code: 200,
      message: '获取成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          permissions: role.permissions?.map((p) => p.code) || [],
        })),
      },
    };
  }

  @ApiOperation({ summary: '获取Lark登录授权URL' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('lark/url')
  getLarkAuthUrl(@Query('provider') provider: 'lark' | 'yaychat' = 'lark') {
    const authUrl = this.larkOAuthService.getAuthUrl(provider);
    return {
      code: 200,
      message: '获取成功',
      data: { authUrl, provider },
    };
  }

  @ApiOperation({ summary: '获取YAYChat Lark登录授权URL' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('lark/yaychat/url')
  getYayChatLarkAuthUrl() {
    const authUrl = this.larkOAuthService.getYayChatAuthUrl();
    return {
      code: 200,
      message: '获取成功',
      data: { authUrl, provider: 'yaychat' },
    };
  }

  @ApiOperation({ summary: 'Lark OAuth回调' })
  @ApiQuery({ name: 'code', description: '授权码' })
  @ApiQuery({ name: 'state', description: '状态参数', required: false })
  @Get('lark/callback')
  @Redirect()
  async larkCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
  ) {
    try {
      // 根据state参数确定使用的Lark主体
      const provider = (state === 'yaychat') ? 'yaychat' : 'lark';
      
      // 获取访问令牌
      const tokenResponse = await this.larkOAuthService.exchangeCodeForToken(code, provider);
      
      // 获取用户信息
      const userInfo = await this.larkOAuthService.getUserInfo(tokenResponse.access_token);
      
      // 查找或创建用户
      const user = await this.larkOAuthService.findOrCreateUser(userInfo);
      
      // 使用专门的Lark登录方法生成JWT令牌
      const result = await this.authService.larkLogin(user);

      // 重定向到前端回调页面，携带JWT令牌
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5818'}/login?token=${result.accessToken}&refreshToken=${result.refreshToken}&userId=${user.id}&username=${encodeURIComponent(user.username)}`;
      
      return { url: redirectUrl };
    } catch (error) {
      // 重定向到错误页面
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5818'}/login?error=${encodeURIComponent(error.message)}`;
      return { url: errorUrl };
    }
  }

  @ApiOperation({ summary: 'Lark扫码登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @Post('lark/login')
  async larkLogin(
    @Body() larkAuthDto: LarkAuthDto & { provider?: 'lark' | 'yaychat' },
    @Ip() ip: string,
  ) {
    const provider = larkAuthDto.provider || 'lark';
    
    // 获取访问令牌
    const tokenResponse = await this.larkOAuthService.exchangeCodeForToken(
      larkAuthDto.code,
      provider,
    );

    // 获取用户信息
    const userInfo = await this.larkOAuthService.getUserInfo(
      tokenResponse.access_token,
    );

    // 查找或创建用户
    const user = await this.larkOAuthService.findOrCreateUser(userInfo);

    // 使用专门的Lark登录方法生成JWT令牌
    const result = await this.authService.larkLogin(user, ip);

    return {
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          roles: result.user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            code: role.code,
            permissions: role.permissions?.map((p) => p.code) || [],
          })),
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @ApiOperation({ summary: '绑定Lark账号' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('lark/bind')
  async bindLark(
    @Request() req,
    @Body() larkAuthDto: LarkAuthDto & { provider?: 'lark' | 'yaychat' },
  ) {
    const provider = larkAuthDto.provider || 'lark';
    
    // 获取访问令牌
    const tokenResponse = await this.larkOAuthService.exchangeCodeForToken(
      larkAuthDto.code,
      provider,
    );

    // 获取用户信息
    const userInfo = await this.larkOAuthService.getUserInfo(
      tokenResponse.access_token,
    );

    // 绑定账号
    const user = await this.larkOAuthService.bindLarkAccount(
      req.user.id,
      userInfo,
    );

    return {
      code: 200,
      message: '绑定成功',
      data: {
        larkUserId: user.larkUserId,
        larkUserInfo: user.larkUserInfo,
      },
    };
  }

  @ApiOperation({ summary: '解绑Lark账号' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('lark/unbind')
  async unbindLark(@Request() req) {
    await this.larkOAuthService.unbindLarkAccount(req.user.id);

    return {
      code: 200,
      message: '解绑成功',
    };
  }

  @ApiOperation({ summary: '模拟Lark用户创建测试（仅开发环境）' })
  @ApiResponse({ status: 200, description: '测试成功' })
  @Post('test/lark-user-creation')
  async testLarkUserCreation(@Body() body: { larkUserId: string; name: string; email: string }) {
    if (this.configService.get('NODE_ENV') !== 'development') {
      return {
        code: 403,
        message: '此接口仅在开发环境可用',
      };
    }

    try {
      // 模拟Lark用户信息
      const mockLarkUserInfo = {
        sub: body.larkUserId,
        name: body.name,
        email: body.email,
        picture: `https://avatar.example.com/${body.larkUserId}.jpg`,
        email_verified: true,
      };

      // 创建或查找用户
      const user = await this.larkOAuthService.findOrCreateUser(mockLarkUserInfo);

      return {
        code: 200,
        message: '测试用户创建成功',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          larkUserId: user.larkUserId,
          roles: user.roles ? user.roles.map(r => ({ id: r.id, name: r.name, code: r.code })) : [],
          isNewUser: !user.larkUserId || user.createdAt === user.updatedAt,
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: `测试失败: ${error.message}`,
      };
    }
  }
}
