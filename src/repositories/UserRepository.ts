import { Repository } from 'typeorm'
import { User } from '../entities'
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async createUser(user: User): Promise<void> {
    try {
      await this.repository.save(user)
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation code
        throw new ConflictException('Email already exists')
      }
      throw new InternalServerErrorException('Failed to create user')
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.repository.findOneBy({ email })
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`)
      }
      return user
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to fetch user')
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.repository.findOneBy({ id })
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`)
      }
      return user
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to fetch user')
    }
  }

  async updateUser(userId: string, user: Partial<User>): Promise<void> {
    try {
      const result = await this.repository.update(userId, user)
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error.code === '23505') {
        throw new ConflictException('Email already exists')
      }
      throw new InternalServerErrorException('Failed to update user')
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const result = await this.repository.delete(userId)
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to delete user')
    }
  }
}
