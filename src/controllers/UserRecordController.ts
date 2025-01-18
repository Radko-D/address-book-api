import { BadRequestException, Body, Controller, Delete, Get, Header, Param, Post, Query, Req, Res, UploadedFiles } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordService } from '../services/UserRecordService'
import { UserFromRequest } from '../decorators/UserDecorator'
import { CreateUserRecord, ExportFormat, UpdateUserRecord } from '../models'
import { Response } from 'express'

@Controller('api/user-record')
export class UserRecordController {
  constructor(private readonly userRecordService: UserRecordService) {}

  @Get()
  async getAllRecords(
    @UserFromRequest('id') userId: string,
    @Query('mostUsedTags') mostUsedTags?: boolean,
    @Query('sameFirstNameDiffLastName') sameFirstNameDiffLastName?: boolean,
    @Query('sameLastNameDiffFirstName') sameLastNameDiffFirstName?: boolean,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ records: UserRecord[]; total: number }> {
    return await this.userRecordService.getAllRecords(userId, {
      mostUsedTags,
      sameFirstNameDiffLastName,
      sameLastNameDiffFirstName,
      firstName,
      lastName,
      page,
      limit,
    })
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

  @Get('export-records')
  async exportRecords(
    @UserFromRequest('id') userId: string,
    @Query('format') format: ExportFormat = 'csv',
    @Res() response: Response,
  ): Promise<void> {
    const supportedFormats: ExportFormat[] = ['csv', 'json', 'xlsx']

    if (!supportedFormats.includes(format)) {
      throw new BadRequestException(`Unsupported format. Supported formats are: ${supportedFormats.join(', ')}`)
    }

    const filename = `user-records.${format}`

    // Set content type based on format
    const contentTypes = {
      csv: 'text/csv',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }

    response.setHeader('Content-Type', contentTypes[format])
    response.setHeader('Content-Disposition', `attachment; filename=${filename}`)

    return this.userRecordService.exportRecords(userId, format, response)
  }

  @Get(':recordId')
  async getRecordById(@Param('recordId') recordId: string, @UserFromRequest('id') userId: string): Promise<UserRecord> {
    return await this.userRecordService.getRecordById(recordId, userId)
  }
}
