import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordService } from '../services/UserRecordService'

@Controller('api/user-record')
export class UserRecordController {
  constructor(private readonly userRecordService: UserRecordService) {}

  @Get(':userId')
  async getAllRecords(@Param('userId') userId: string): Promise<UserRecord[]> {
    return await this.userRecordService.getAllRecords(userId)
  }

  @Post()
  async createRecord(@Body() record: Partial<UserRecord>): Promise<void> {
    this.userRecordService.createRecord(record)
  }

  @Delete('delete/:recordId')
  async deleteRecord(@Param('recordId') recordId: string): Promise<void> {
    this.userRecordService.deleteRecord(recordId)
  }
}
