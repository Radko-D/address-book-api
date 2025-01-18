import { Injectable } from '@nestjs/common'
import { UserRecord } from '../entities'
import { TagRepository, UserRecordRepository } from '../repositories'
import { CustomFieldRepository } from '../repositories/CustomFieldRepository'
import { TagService } from './TagService'

@Injectable()
export class UserRecordService {
  constructor(
    private readonly userRecordRepository: UserRecordRepository,
    private readonly customFieldRepository: CustomFieldRepository,
    private readonly tagService: TagService,
  ) {}

  async getAllRecords(userId: string): Promise<UserRecord[]> {
    return await this.userRecordRepository.getAllUserRecords(userId)
  }

  async getRecordById(recordId: string, userId: string): Promise<UserRecord> {
    return await this.userRecordRepository.getUserRecordById(recordId, userId)
  }

  async createRecord(record: Partial<UserRecord>, tagId?: string): Promise<UserRecord> {
    const fullRecord = await this.userRecordRepository.createUserRecord(record)
    if (tagId) {
      await this.tagService.addTagToRecord(tagId, fullRecord.id, record.userId)
    }
    return fullRecord
  }

  async updateRecord(recordId: string, userId: string, record: Partial<UserRecord>): Promise<void> {
    await this.userRecordRepository.updateUserRecord(recordId, userId, record)
  }

  async deleteRecord(recordId: string, userId: string): Promise<void> {
    await this.userRecordRepository.deleteUserRecord(recordId, userId)
  }
}
