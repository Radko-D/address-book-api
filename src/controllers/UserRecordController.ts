import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFiles } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordService } from '../services/UserRecordService'
import { User } from '../decorators/UserDecorator'
import { UpdateUserRecord } from '../models'

@Controller('api/user-record')
export class UserRecordController {
  constructor(private readonly userRecordService: UserRecordService) {}

  @Get()
  async getAllRecords(@User('id') userId: string): Promise<UserRecord[]> {
    return await this.userRecordService.getAllRecords(userId)
  }

  @Get(':recordId')
  async getRecordById(@Param('recordId') recordId: string, @User('id') userId: string): Promise<UserRecord> {
    return await this.userRecordService.getRecordById(recordId, userId)
  }

  @Post()
  async createRecord(@Body() record: Partial<UserRecord>, @User('id') userId: string): Promise<void> {
    record.userId = userId
    this.userRecordService.createRecord(record)
  }

  @Delete('delete')
  async deleteRecord(@Body() { recordId }: { recordId: string }, @User('id') userId: string): Promise<void> {
    this.userRecordService.deleteRecord(recordId, userId)
  }

  @Post('update/:recordId')
  async updateRecord(@Body() record: UpdateUserRecord, @User('id') userId: string, @Param('recordId') recordId: string): Promise<void> {
    this.userRecordService.updateRecord(recordId, userId, record)
  }
}
