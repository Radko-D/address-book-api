import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRepository } from '../repositories/UserRepository'
import { User } from '../entities'
import * as bcrypt from 'bcrypt'
import { UserResponse } from '../models/UserResponse'
import { AccessTokenResponse, TokensResponse } from '../models/TokenResponse'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(user: User): Promise<void> {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await this.userRepository.createUser({
      ...user,
      password: hashedPassword,
    })
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.getUserByEmail(email)
  }

  async getUserById(id: string): Promise<User> {
    return await this.userRepository.getUserById(id)
  }

  async updateUser(userId: string, user: Partial<User>): Promise<void> {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10)
    }

    await this.userRepository.updateUser(userId, user)
  }

  async validateUser(email: string, password: string): Promise<UserResponse> {
    const user = await this.getUserByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, createdAt, updatedAt, ...result } = user
      return result
    }

    throw new UnauthorizedException()
  }
  async login(user: any): Promise<TokensResponse> {
    const tokens = await this.generateTokens(user)
    await this.updateRefreshToken(user.id, tokens.refresh_token)

    // Only return the access token in the response body
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    }
  }

  private async generateTokens(user: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          email: user.email,
          sub: user.id,
        },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '15m',
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

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userRepository.updateUser(userId, {
      refreshToken: hashedRefreshToken,
    })
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensResponse> {
    const user = await this.getUserById(userId)
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied')
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied')
    }

    const tokens = await this.generateTokens(user)
    await this.updateRefreshToken(user.id, tokens.refresh_token)
    return tokens
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userRepository.updateUser(userId, {
      refreshToken: null,
    })
  }
}
