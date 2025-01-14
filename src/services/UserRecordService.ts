import { Injectable } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordRepository } from '../repositories'
import { CustomFieldRepository } from '../repositories/CustomFieldRepository'

@Injectable()
export class UserRecordService {
  constructor(
    private readonly userRecordRepository: UserRecordRepository,
    private readonly customFieldRepository: CustomFieldRepository,
  ) {}

  async getAllRecords(userId: string): Promise<UserRecord[]> {
    return await this.userRecordRepository.getAllUserRecords(userId)
  }

  async createRecord(record: Partial<UserRecord>): Promise<void> {
    const fullRecord = await this.userRecordRepository.createUserRecord(record)
    if (record.customFields) {
      record.customFields.forEach(async (field) => {
        await this.customFieldRepository.createCustomField({ ...field, record: fullRecord })
      })
    }
  }

  async updateRecord(recordId: string, record: Partial<UserRecord>): Promise<void> {
    this.userRecordRepository.updateUserRecord(recordId, record)
  }

  async deleteRecord(recordId: string): Promise<void> {
    await this.userRecordRepository.deleteUserRecord(recordId)
  }
}
