import { Injectable, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRepository } from '../repositories/UserRepository'
import { User } from '../entities'
import * as bcrypt from 'bcrypt'
import { UserResponse } from '../models/UserResponse'
import { AccessTokenResponse, TokensResponse } from '../models/TokenResponse'
import { ConfigService } from '@nestjs/config'
import { UpdateUser } from '../models'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(user: User): Promise<void> {
    if (!user.email || !user.password || !user.firstName || !user.lastName) {
      throw new BadRequestException('Missing required user fields')
    }

    try {
      const existingUser = await this.userRepository.getUserByEmail(user.email).catch(() => null)
      if (existingUser) {
        throw new BadRequestException('Email already exists')
      }

      const hashedPassword = await bcrypt.hash(user.password, 10)
      await this.userRepository.createUser({
        ...user,
        password: hashedPassword,
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to create user')
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException('Email is required')
    }

    try {
      return await this.userRepository.getUserByEmail(email)
    } catch (error) {
      if (error.status === 404) {
        throw new UnauthorizedException('Invalid credentials')
      }
      throw new InternalServerErrorException('Failed to fetch user')
    }
  }

  async getUserById(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required')
    }

    try {
      return await this.userRepository.getUserById(id)
    } catch (error) {
      if (error.status === 404) {
        throw new UnauthorizedException('User not found')
      }
      throw new InternalServerErrorException('Failed to fetch user')
    }
  }

  async updateUser(userId: string, user: UpdateUser): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required')
    }

    try {
      // Check if user exists
      const existingUser = await this.getUserById(userId)
      if (!existingUser) {
        throw new UnauthorizedException('User not found')
      }

      // If updating email, check if new email is already taken
      if (user.email && user.email !== existingUser.email) {
        const userWithNewEmail = await this.userRepository.getUserByEmail(user.email).catch(() => null)
        if (userWithNewEmail) {
          throw new BadRequestException('Email already exists')
        }
      }

      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
      }

      await this.userRepository.updateUser(userId, user)
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to update user')
    }
  }

  async validateUser(email: string, password: string): Promise<UserResponse> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required')
    }

    try {
      const user = await this.getUserByEmail(email)
      const passwordValid = await bcrypt.compare(password, user.password)

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const { password: _, createdAt, updatedAt, ...result } = user
      return result
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to validate user')
    }
  }

  async login(user: any): Promise<TokensResponse> {
    if (!user || !user.id || !user.email) {
      throw new BadRequestException('Invalid user data')
    }

    try {
      const tokens = await this.generateTokens(user)
      await this.updateRefreshToken(user.id, tokens.refresh_token)

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to login user')
    }
  }

  private async generateTokens(user: any) {
    if (!user.id || !user.email) {
      throw new BadRequestException('Invalid user data for token generation')
    }

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            email: user.email,
            sub: user.id,
          },
          {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '30m',
          },
        ),
        this.jwtService.signAsync(
          {
            email: user.email,
            sub: user.id,
          },
          {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
          },
        ),
      ])

      if (!accessToken || !refreshToken) {
        throw new Error('Failed to generate tokens')
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate authentication tokens')
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    if (!userId || !refreshToken) {
      throw new BadRequestException('User ID and refresh token are required')
    }

    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
      await this.userRepository.updateUser(userId, {
        refreshToken: hashedRefreshToken,
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to update refresh token')
    }
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensResponse> {
    if (!userId || !refreshToken) {
      throw new BadRequestException('User ID and refresh token are required')
    }

    try {
      const user = await this.getUserById(userId)
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied - Invalid user or missing refresh token')
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken)
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied - Invalid refresh token')
      }

      const tokens = await this.generateTokens(user)
      await this.updateRefreshToken(user.id, tokens.refresh_token)
      return tokens
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to refresh tokens')
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required')
    }

    try {
      await this.userRepository.updateUser(userId, {
        refreshToken: null,
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove refresh token')
    }
  }
}
