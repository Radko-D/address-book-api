import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { UserRecord } from '../entities'
import { UserRecordRepository } from '../repositories'
import { TagService } from './TagService'
import { ExportFormat, FilterQueryResponse, QueryParams } from '../models'
import { stringify } from 'csv-stringify'
import * as XLSX from 'xlsx'
import { Response } from 'express'

@Injectable()
export class UserRecordService {
  constructor(
    private readonly userRecordRepository: UserRecordRepository,
    private readonly tagService: TagService,
  ) {}

  async getAllRecords(userId: string, params: QueryParams): Promise<FilterQueryResponse> {
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

    if (params.firstName || params.lastName) {
      return await this.userRecordRepository.getRecordsByFullName(userId, params.firstName, params.lastName, skip, params.limit)
    }

    return await this.userRecordRepository.getAllUserRecords(userId, skip, params.limit)
  }

  async getRecordById(recordId: string, userId: string): Promise<UserRecord> {
    return await this.userRecordRepository.getUserRecordById(recordId, userId)
  }

  private trimStringFields(record: Partial<UserRecord>): Partial<UserRecord> {
    const trimmedRecord: Partial<UserRecord> = { ...record }

    // List of string field keys in UserRecord
    const stringFields = ['firstName', 'lastName', 'companyName', 'address', 'phoneNumber', 'email', 'faxNumber', 'mobilePhoneNumber', 'comment']

    // Trim each string field if it exists
    stringFields.forEach((field) => {
      if (trimmedRecord[field] !== undefined && trimmedRecord[field] !== null) {
        trimmedRecord[field] = trimmedRecord[field].toString().trim()
      }
    })

    return trimmedRecord
  }

  async createRecord(record: Partial<UserRecord>, tagId?: string): Promise<UserRecord> {
    const trimmedRecord = this.trimStringFields(record)
    const fullRecord = await this.userRecordRepository.createUserRecord(trimmedRecord)

    if (tagId?.trim()) {
      await this.tagService.addTagToRecord(tagId.trim(), fullRecord.id, record.userId)
    }

    return fullRecord
  }

  async updateRecord(recordId: string, userId: string, record: Partial<UserRecord>, tagId?: string): Promise<void> {
    const trimmedRecord = this.trimStringFields(record)
    await this.userRecordRepository.updateUserRecord(recordId, userId, trimmedRecord)

    if (tagId?.trim()) {
      await this.tagService.addTagToRecord(tagId.trim(), recordId, userId)
    }
  }

  async deleteRecord(recordId: string, userId: string): Promise<void> {
    await this.userRecordRepository.deleteUserRecord(recordId, userId)
  }

  async exportRecords(userId: string, format: ExportFormat, response: Response): Promise<void> {
    try {
      const records = await this.userRecordRepository.getAllRecordsForExport(userId)
      if (!records || records.length === 0) {
        throw new InternalServerErrorException('No records found to export')
      }

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
        default:
          throw new InternalServerErrorException('Unsupported export format')
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to export records: ${error.message}`)
    }
  }

  private async exportToCsv(records: any[], response: Response): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const stringifier = stringify(records, {
        header: true,
        columns: Object.keys(records[0]),
      })

      stringifier
        .on('error', (error) => {
          reject(new InternalServerErrorException(`Failed to generate CSV: ${error.message}`))
        })
        .pipe(response)
        .on('finish', () => resolve())
        .on('error', (error) => {
          reject(new InternalServerErrorException(`Failed to write CSV to response: ${error.message}`))
        })
    })
  }

  private async exportToJson(records: any[], response: Response): Promise<void> {
    try {
      response.write(JSON.stringify(records))
      response.end()
    } catch (error) {
      throw new InternalServerErrorException(`Failed to export JSON: ${error.message}`)
    }
  }

  private async exportToExcel(records: any[], response: Response): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(records, {
        header: Object.keys(records[0]),
      })

      XLSX.utils.book_append_sheet(workbook, worksheet, 'User Records')

      const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
        bookSST: false,
      })

      response.send(buffer)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to export Excel: ${error.message}`)
    }
  }

  private processRecordForExport(record: UserRecord) {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(`Failed to process record for export: ${error.message}`)
    }
  }
}
