// src/auth/auth.controller.ts
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth') // Swagger 태그
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google for authentication' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page.' })
  async googleAuth() {
    // Guard redirects
    console.info('AuthGuard Redirects to Google login page.');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully.' })
  async googleAuthRedirect(
    @Req() req,
    @Res() res,
    // @Query('code') code: string,
  ) {
    const user = req.user;
    console.info('User authenticated successfully. : ', user);
    if (user && user.accessToken) {
      // const tokens = await this.authService.handleGoogleCallback(code);
      // console.debug('Tokens: ', tokens);
      const accessToken = user.accessToken;
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?token=${accessToken}`,
      );
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'User Info' })
  @ApiResponse({ status: 200, description: 'User infomation.' })
  async getProfile(@Req() req) {
    return req.user;
  }
}
