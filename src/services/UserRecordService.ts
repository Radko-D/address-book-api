import { Injectable } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordRepository } from '../repositories'
import { TagService } from './TagService'
import { ExportFormat, QueryParams } from '../models'
import { stringify } from 'csv-stringify'
import * as XLSX from 'xlsx'
import { Response } from 'express'

@Injectable()
export class UserRecordService {
  constructor(
    private readonly userRecordRepository: UserRecordRepository,
    private readonly tagService: TagService,
  ) {}

  async getAllRecords(userId: string, params: QueryParams): Promise<{ records: UserRecord[]; total: number }> {
    const skip = (params.page - 1) * params.limit

    if (params.mostUsedTags) {
      return await this.userRecordRepository.getRecordsWithMostUsedTags(userId, skip, params.limit)
    }

    if (params.sameFirstNameDiffLastName) {
      return await this.userRecordRepository.getRecordsWithSameFirstNameDiffLastName(userId, skip, params.limit)
    }

    if (params.sameLastNameDiffFirstName) {
      return await this.userRecordRepository.getRecordsWithSameLastNameDiffFirstName(userId, skip, params.limit)
    }

    if (params.firstName && params.lastName) {
      return await this.userRecordRepository.getRecordsByFullName(userId, params.firstName, params.lastName)
    }

    return await this.userRecordRepository.getAllUserRecords(userId, skip, params.limit)
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

  async exportRecords(userId: string, format: ExportFormat, response: Response): Promise<void> {
    const records = await this.userRecordRepository.getAllRecordsForExport(userId)
    const processedRecords = records.map((record) => this.processRecordForExport(record))

    switch (format) {
      case 'csv':
        await this.exportToCsv(processedRecords, response)
        break
      case 'json':
        await this.exportToJson(processedRecords, response)
        break
      case 'xlsx':
        await this.exportToExcel(processedRecords, response)
        break
    }
  }

  private processRecordForExport(record: UserRecord) {
    return {
      'First Name': record.firstName,
      'Last Name': record.lastName || '',
      Company: record.companyName || '',
      Address: record.address || '',
      Phone: record.phoneNumber,
      Email: record.email || '',
      Fax: record.faxNumber || '',
      Mobile: record.mobilePhoneNumber || '',
      Comment: record.comment || '',
      Tags: record.tags?.map((tag) => tag.name).join(', ') || '',
      'Custom Fields': record.customFields?.map((field) => `${field.name}: ${field.value}`).join('; ') || '',
      'Created At': record.createdAt.toISOString(),
      'Updated At': record.updatedAt.toISOString(),
    }
  }

  private async exportToCsv(records: any[], response: Response): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const stringifier = stringify(records, {
        header: true,
        columns: Object.keys(records[0]),
      })

      stringifier
        .pipe(response)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error))
    })
  }

  private async exportToJson(records: any[], response: Response): Promise<void> {
    response.write(JSON.stringify(records))
    response.end()
  }

  private async exportToExcel(records: any[], response: Response): Promise<void> {
    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(records, {
      header: Object.keys(records[0]),
    })

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Records')

    // Write the workbook to a buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      bookSST: false,
    })

    // Send the buffer as the response
    response.send(buffer)
  }
}
