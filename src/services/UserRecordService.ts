import { Injectable } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordRepository } from '../repositories'

@Injectable()
export class UserRecordService {
  constructor(private readonly userRecordRepository: UserRecordRepository) {}

  async getAllRecords(userId: string): Promise<UserRecord[]> {
    return await this.userRecordRepository.getAllUserRecords(userId)
  }

  async createRecord(record: Partial<UserRecord>): Promise<void> {
    this.userRecordRepository.createUserRecord(record)
  }

  async updateRecord(recordId: string, record: Partial<UserRecord>): Promise<void> {
    this.userRecordRepository.updateUserRecord(recordId, record)
  }

  async deleteRecord(recordId: string): Promise<void> {
    await this.userRecordRepository.deleteUserRecord(recordId)
  }
}
