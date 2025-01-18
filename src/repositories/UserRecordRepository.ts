import { Repository } from 'typeorm'
import { UserRecord } from '../entities'
import { InjectRepository } from '@nestjs/typeorm'

export class UserRecordRepository {
  constructor(
    @InjectRepository(UserRecord)
    private readonly repository: Repository<UserRecord>,
  ) {}

  async getUserRecordById(id: string, userId: string): Promise<UserRecord> {
    return this.repository.findOne({ where: { id, userId }, relations: ['tags', 'customFields'] })
  }

  async createUserRecord(record: Partial<UserRecord>): Promise<UserRecord> {
    return this.repository.save(record)
  }

  async updateUserRecord(id: string, userId: string, record: Partial<UserRecord>): Promise<UserRecord> {
    const result = await this.repository.update({ id, userId }, record)
    return result.raw
  }

  async deleteUserRecord(id: string, userId: string): Promise<void> {
    await this.repository.createQueryBuilder().delete().where('id = :id AND userId = :userId', { id, userId }).execute()
  }

  async getAllUserRecords(userId: string): Promise<UserRecord[]> {
    return this.repository.find({ where: { userId }, relations: ['tags', 'customFields'] })
  }
}
