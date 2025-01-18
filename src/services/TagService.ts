import { Injectable, NotFoundException } from '@nestjs/common'
import { Tag } from '../entities'
import { UserRecordRepository } from '../repositories/UserRecordRepository'
import { TagOperationException, TagNotFoundException, UnauthorizedTagAccessException } from '../exceptions/TagException'
import { TagRepository } from '../repositories/TagRepository'

@Injectable()
export class TagService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly userRecordRepository: UserRecordRepository,
  ) {}

  async getAllTags(userId: string): Promise<Tag[]> {
    try {
      return await this.tagRepository.getAllTags(userId)
    } catch (error) {
      throw new TagOperationException('Failed to fetch tags')
    }
  }

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    try {
      return await this.tagRepository.createTag(tag)
    } catch (error) {
      throw new TagOperationException(`Failed to create tag, ${error.message}`)
    }
  }

  async updateTag(tagId: string, userId: string, tag: Partial<Tag>): Promise<void> {
    const existingTag = await this.tagRepository.getTagById(tagId)
    if (!existingTag) {
      throw new TagNotFoundException(tagId)
    }
    if (existingTag.userId !== userId) {
      throw new UnauthorizedTagAccessException()
    }

    try {
      await this.tagRepository.updateTag(tagId, userId, tag)
    } catch (error) {
      throw new TagOperationException('Failed to update tag')
    }
  }

  async deleteTag(tagId: string, userId: string): Promise<void> {
    const existingTag = await this.tagRepository.getTagById(tagId)
    if (!existingTag) {
      throw new TagNotFoundException(tagId)
    }

    try {
      await this.tagRepository.deleteTag(tagId, userId)
    } catch (error) {
      throw new TagOperationException('Failed to delete tag')
    }
  }

  async addTagToRecord(tagId: string, recordId: string, userId: string): Promise<void> {
    const [tag, record] = await Promise.all([this.tagRepository.getTagById(tagId), this.userRecordRepository.getUserRecordById(recordId, userId)])

    if (!tag) {
      throw new TagNotFoundException(tagId)
    }
    if (!record) {
      throw new NotFoundException(`Record with ID ${recordId} not found`)
    }
    if (tag.userId !== userId || record.userId !== userId) {
      throw new UnauthorizedTagAccessException()
    }

    try {
      await this.tagRepository.addTagToRecord(tagId, recordId)
    } catch (error) {
      throw new TagOperationException('Failed to add tag to record')
    }
  }

  async removeTagFromRecord(tagId: string, recordId: string, userId: string): Promise<void> {
    const [tag, record] = await Promise.all([this.tagRepository.getTagById(tagId), this.userRecordRepository.getUserRecordById(recordId, userId)])

    if (!tag) {
      throw new TagNotFoundException(tagId)
    }
    if (!record) {
      throw new NotFoundException(`Record with ID ${recordId} not found`)
    }
    if (tag.userId !== userId || record.userId !== userId) {
      throw new UnauthorizedTagAccessException()
    }

    try {
      await this.tagRepository.removeTagFromRecord(tagId, recordId)
    } catch (error) {
      throw new TagOperationException('Failed to remove tag from record')
    }
  }
}
