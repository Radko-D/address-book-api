import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Req,
  Res,
  Patch,
  Get,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
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
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required')
      }

      const user = await this.userService.validateUser(loginDto.email, loginDto.password)
      const { access_token, refresh_token } = await this.userService.login(user)

      // Set refresh token as an HTTP-only cookie
      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh',
      })

      return { access_token }
    } catch (error) {
      this.logger.error(`Login failed for email: ${loginDto.email}`, error.stack)
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Login failed')
    }
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    try {
      const refreshToken = request.cookies['refresh_token']
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found')
      }

      let decodedToken
      try {
        decodedToken = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        })
      } catch (error) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const tokens = await this.userService.refreshTokens(decodedToken.sub, refreshToken)

      response.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return { access_token: tokens.access_token }
    } catch (error) {
      this.logger.error('Token refresh failed', error.stack)
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to refresh token')
    }
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    try {
      const refreshToken = request.cookies['refresh_token']
      if (refreshToken) {
        try {
          const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
          })
          await this.userService.removeRefreshToken(decodedToken.sub)
        } catch (error) {
          // Continue with logout even if token verification fails
          this.logger.warn('Failed to verify token during logout', error.stack)
        }
      }

      response.clearCookie('refresh_token', {
        path: '/api/auth/refresh',
      })

      return { message: 'Logged out successfully' }
    } catch (error) {
      this.logger.error('Logout failed', error.stack)
      throw new InternalServerErrorException('Logout failed')
    }
  }

  @Public()
  @Post('register')
  async register(@Body() user: User) {
    try {
      if (!user.email || !user.password || !user.firstName || !user.lastName) {
        throw new BadRequestException('All fields are required')
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(user.email)) {
        throw new BadRequestException('Invalid email format')
      }

      await this.userService.createUser(user)
      return { message: 'User registered successfully' }
    } catch (error) {
      this.logger.error('Registration failed', error.stack)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Registration failed')
    }
  }

  @Patch('update')
  async updateUser(@Body() user: UpdateUser, @UserFromRequest('id') userId: string) {
    try {
      if (!userId) {
        throw new UnauthorizedException('User not authenticated')
      }

      if (user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(user.email)) {
          throw new BadRequestException('Invalid email format')
        }
      }

      if (user.password && user.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long')
      }

      await this.userService.updateUser(userId, user)
      return { message: 'User updated successfully' }
    } catch (error) {
      this.logger.error(`Update failed for user: ${userId}`, error.stack)
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Update failed')
    }
  }

  @Get('current-user')
  async getCurrentUser(@UserFromRequest('id') userId: string): Promise<Omit<User, 'password' | 'refreshToken'>> {
    try {
      if (!userId) {
        throw new UnauthorizedException('User not authenticated')
      }

      const user = await this.userService.getUserById(userId)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      const { password, refreshToken, ...rest } = user
      return rest
    } catch (error) {
      this.logger.error(`Failed to get current user: ${userId}`, error.stack)
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to get user information')
    }
  }
}
