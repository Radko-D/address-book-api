import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFiles } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordService } from '../services/UserRecordService'
import { UserFromRequest } from '../decorators/UserDecorator'
import { CreateUserRecord, UpdateUserRecord } from '../models'

@Controller('api/user-record')
export class UserRecordController {
  constructor(private readonly userRecordService: UserRecordService) {}

  @Get()
  async getAllRecords(@UserFromRequest('id') userId: string): Promise<UserRecord[]> {
    return await this.userRecordService.getAllRecords(userId)
  }

  @Get(':recordId')
  async getRecordById(@Param('recordId') recordId: string, @UserFromRequest('id') userId: string): Promise<UserRecord> {
    return await this.userRecordService.getRecordById(recordId, userId)
  }

  @Post()
  async createRecord(@Body() { record, tagId }: CreateUserRecord, @UserFromRequest('id') userId: string): Promise<UserRecord> {
    record.userId = userId
    return await this.userRecordService.createRecord(record, tagId)
  }

  @Delete('delete')
  async deleteRecord(@Body() { recordId }: { recordId: string }, @UserFromRequest('id') userId: string): Promise<void> {
    await this.userRecordService.deleteRecord(recordId, userId)
  }

  @Post('update/:recordId')
  async updateRecord(@Body() record: UpdateUserRecord, @UserFromRequest('id') userId: string, @Param('recordId') recordId: string): Promise<void> {
    await this.userRecordService.updateRecord(recordId, userId, record)
  }
}
