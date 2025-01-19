import { Repository } from 'typeorm'
import { UserRecord } from '../entities'
import { InjectRepository } from '@nestjs/typeorm'
import { FilterQueryResponse } from '../models'

export class UserRecordRepository {
  constructor(
    @InjectRepository(UserRecord)
    private readonly repository: Repository<UserRecord>,
  ) {}

  async getAllUserRecords(userId: string, skip: number = 0, limit: number = 10): Promise<FilterQueryResponse> {
    const [records, total] = await this.repository.findAndCount({
      where: { userId },
      relations: ['tags', 'customFields'],
      skip,
      take: limit,
    })
    return { records, total }
  }

  async getRecordsWithMostUsedTags(userId: string, skip: number = 0, limit: number = 10): Promise<FilterQueryResponse> {
    // Get the top 3 most used tags
    const topTagsQuery = await this.repository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.tags', 'tag')
      .select(['tag.id', 'tag.name', 'COUNT(record.id) as usage_count'])
      .where('record.userId = :userId', { userId })
      .groupBy('tag.id')
      .addGroupBy('tag.name')
      .orderBy('usage_count', 'DESC')
      .take(3)
      .getRawMany()

    const tagIds = topTagsQuery.map((tag) => tag.tag_id)

    // If no tags found, return empty result
    if (!tagIds.length) {
      return { records: [], total: 0 }
    }

    // Get records that have any of these tags, including custom fields
    const [records, total] = await this.repository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tags', 'tag')
      .leftJoinAndSelect('record.customFields', 'customFields') // Added custom fields join
      .where('record.userId = :userId', { userId })
      .andWhere('tag.id IN (:...tagIds)', { tagIds })
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return { records, total }
  }

  async getRecordsWithSameFirstNameDiffLastName(userId: string, skip: number = 0, limit: number = 10): Promise<FilterQueryResponse> {
    const [records, total] = await this.repository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tags', 'tags')
      .leftJoinAndSelect('record.customFields', 'customFields')
      .where('record.userId = :userId', { userId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('r.firstName')
          .from(UserRecord, 'r')
          .where('r.userId = :userId')
          .groupBy('r.firstName')
          .having('COUNT(DISTINCT r.lastName) > 1')
          .getQuery()
        return 'record.firstName IN ' + subQuery
      })
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return { records, total }
  }

  async getRecordsWithSameLastNameDiffFirstName(userId: string, skip: number = 0, limit: number = 10): Promise<FilterQueryResponse> {
    const [records, total] = await this.repository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tags', 'tags')
      .leftJoinAndSelect('record.customFields', 'customFields')
      .where('record.userId = :userId', { userId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('r.lastName')
          .from(UserRecord, 'r')
          .where('r.userId = :userId')
          .groupBy('r.lastName')
          .having('COUNT(DISTINCT r.firstName) > 1')
          .getQuery()
        return 'record.lastName IN ' + subQuery
      })
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return { records, total }
  }

  async getRecordsByFullName(userId: string, firstName: string, lastName: string): Promise<FilterQueryResponse> {
    const [records, total] = await this.repository.findAndCount({
      where: {
        userId,
        firstName,
        lastName,
      },
      relations: ['tags', 'customFields'],
    })
    return { records, total }
  }

  async getUserRecordById(id: string, userId: string): Promise<UserRecord> {
    return this.repository.findOne({ where: { id, userId }, relations: ['tags', 'customFields'] })
  }

  async createUserRecord(record: Partial<UserRecord>): Promise<UserRecord> {
    return this.repository.save(record)
  }

  async updateUserRecord(id: string, userId: string, record: Partial<UserRecord>): Promise<UserRecord> {
    const result = await this.repository.update({ id, userId }, record)
    return result.raw
  }

  async deleteUserRecord(id: string, userId: string): Promise<void> {
    await this.repository.createQueryBuilder().delete().where('id = :id AND userId = :userId', { id, userId }).execute()
  }

  async getAllRecordsForExport(userId: string): Promise<UserRecord[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['tags', 'customFields'],
      order: {
        createdAt: 'DESC',
      },
    })
  }
}
