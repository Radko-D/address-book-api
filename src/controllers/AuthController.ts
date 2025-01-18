import { Controller, Post, Body, UnauthorizedException, Req, Res, Patch, Get } from '@nestjs/common'
import { UserService } from '../services/UserService'
import { Public } from '../decorators/PublicDecorator'
import { User } from '../entities'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { UserFromRequest } from '../decorators/UserDecorator'
import { UpdateUser } from '../models/UpdateUser'

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
    const user = await this.userService.validateUser(loginDto.email, loginDto.password)

    const { access_token, refresh_token } = await this.userService.login(user)

    // Set refresh token as an HTTP-only cookie
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/api/auth/refresh', // Only sent to refresh endpoint
    })

    return { access_token }
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token']
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found')
    }

    try {
      const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })

      const tokens = await this.userService.refreshTokens(decodedToken.sub, refreshToken)

      // Set new refresh token as cookie
      response.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return { access_token: tokens.access_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token']
    if (refreshToken) {
      const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })
      await this.userService.removeRefreshToken(decodedToken.sub)
    }

    // Clear the refresh token cookie
    response.clearCookie('refresh_token', {
      path: '/api/auth/refresh',
    })

    return { message: 'Logged out successfully' }
  }

  @Public()
  @Post('register')
  async register(@Body() user: User) {
    this.userService.createUser(user)
  }

  @Patch('update')
  async updateUser(@Body() user: UpdateUser, @UserFromRequest('id') userId: string) {
    this.userService.updateUser(userId, user)
  }

  @Get('current-user')
  async getCurrentUser(@UserFromRequest('id') userId: string): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.userService.getUserById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const { password, refreshToken, ...rest } = user
    return rest
  }
}
