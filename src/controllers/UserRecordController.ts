import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFiles } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordService } from '../services/UserRecordService'
import { User } from '../decorators/UserDecorator'

@Controller('api/user-record')
export class UserRecordController {
  constructor(private readonly userRecordService: UserRecordService) {}

  @Get()
  async getAllRecords(@User('id') userId: string): Promise<UserRecord[]> {
    return await this.userRecordService.getAllRecords(userId)
  }

  @Post()
  async createRecord(@Body() record: Partial<UserRecord>, @User('id') userId: string): Promise<void> {
    record.userId = userId
    this.userRecordService.createRecord(record)
  }

  @Delete('delete/:recordId')
  async deleteRecord(@Param('recordId') recordId: string, @User("id") userId: string): Promise<void> {
    this.userRecordService.deleteRecord(recordId, userId)
  }
}
