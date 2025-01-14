import { Repository } from 'typeorm'
import { UserRecord } from '../entities'
import { InjectRepository } from '@nestjs/typeorm'

export class UserRecordRepository {
  constructor(
    @InjectRepository(UserRecord)
    private readonly repository: Repository<UserRecord>,
  ) {}

  async getUserRecordById(id: string): Promise<UserRecord> {
    return this.repository.findOne({ where: { id } })
  }

  async createUserRecord(record: Partial<UserRecord>): Promise<UserRecord> {
    return this.repository.save(record)
  }

  async updateUserRecord(id: string, record: Partial<UserRecord>): Promise<void> {
    this.repository.update(id, record)
  }

  async deleteUserRecord(id: string, userId: string): Promise<void> {
    this.repository.delete({ id, userId })
  }

  async getAllUserRecords(userId: string): Promise<UserRecord[]> {
    return this.repository.find({ where: { userId } })
  }
}
