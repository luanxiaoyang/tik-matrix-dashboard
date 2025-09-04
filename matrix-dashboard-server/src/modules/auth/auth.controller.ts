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
import { AuthService } from './auth.service';
import { LarkOAuthService } from './lark-oauth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RefreshTokenDto, LarkAuthDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private larkOAuthService: LarkOAuthService,
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
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
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
  getLarkAuthUrl() {
    const authUrl = this.larkOAuthService.getAuthUrl();
    return {
      code: 200,
      message: '获取成功',
      data: { authUrl },
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
      // 获取访问令牌
      const tokenResponse = await this.larkOAuthService.exchangeCodeForToken(code);
      
      // 获取用户信息
      const userInfo = await this.larkOAuthService.getUserInfo(tokenResponse.access_token);
      
      // 查找或创建用户
      const user = await this.larkOAuthService.findOrCreateUser(userInfo);
      
      // 生成JWT令牌
      const result = await this.authService.login({
        username: user.username,
        password: '', // Lark用户不需要密码验证
      });

      // 重定向到前端，携带令牌信息
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`;
      // 修改重定向URL（第175行左右）
      const redirectUrl = `http://localhost:5818/auth/lark/callback?code=${code}`;
      
      return { url: redirectUrl };
    } catch (error) {
      // 重定向到错误页面
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login/error?message=${encodeURIComponent(error.message)}`;
      return { url: errorUrl };
    }
  }

  @ApiOperation({ summary: 'Lark扫码登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @Post('lark/login')
  async larkLogin(
    @Body() larkAuthDto: LarkAuthDto,
    @Ip() ip: string,
  ) {
    // 获取访问令牌
    const tokenResponse = await this.larkOAuthService.exchangeCodeForToken(
      larkAuthDto.code,
    );

    // 获取用户信息
    const userInfo = await this.larkOAuthService.getUserInfo(
      tokenResponse.access_token,
    );

    // 查找或创建用户
    const user = await this.larkOAuthService.findOrCreateUser(userInfo);

    // 生成JWT令牌
    const result = await this.authService.login(
      { username: user.username, password: '' },
      ip,
    );

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
    @Body() larkAuthDto: LarkAuthDto,
  ) {
    // 获取访问令牌
    const tokenResponse = await this.larkOAuthService.exchangeCodeForToken(
      larkAuthDto.code,
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
}
