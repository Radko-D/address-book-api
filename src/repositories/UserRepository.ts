import { Repository } from 'typeorm'
import { User } from '../entities'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}
  async createUser(user: User): Promise<void> {
    await this.repository.save(user)
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.repository.findOneBy({ email })
  }

  async getUserById(id: string): Promise<User> {
    return await this.repository.findOneBy({ id })
  }

  async updateUser(userId: string, user: Partial<User>): Promise<void> {
    await this.repository.update(userId, user)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repository.delete(userId)
  }
}
