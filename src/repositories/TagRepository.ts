import { Repository } from 'typeorm'
import { Tag } from '../entities'
import { InjectRepository } from '@nestjs/typeorm'
import { TagOperationException } from '../exceptions/TagException'


export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
  ) {}

  async getTagById(id: string): Promise<Tag | null> {
    try {
      return await this.repository.findOne({ where: { id } })
    } catch (error) {
      throw new TagOperationException('Failed to fetch tag')
    }
  }

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    try {
      return await this.repository.save(tag)
    } catch (error) {
      throw new TagOperationException('Failed to create tag')
    }
  }

  async updateTag(id: string, userId: string, tag: Partial<Tag>): Promise<void> {
    try {
      const result = await this.repository.update({ id, userId }, tag)
      if (result.affected === 0) {
        throw new TagOperationException('Tag not found or unauthorized')
      }
    } catch (error) {
      if (error instanceof TagOperationException) {
        throw error
      }
      throw new TagOperationException('Failed to update tag')
    }
  }

  async deleteTag(id: string, userId: string): Promise<void> {
    try {
      const result = await this.repository.createQueryBuilder()
        .delete()
        .where('id = :id AND userId = :userId', { id, userId })
        .execute()

      if (result.affected === 0) {
        throw new TagOperationException('Tag not found or unauthorized')
      }
    } catch (error) {
      if (error instanceof TagOperationException) {
        throw error
      }
      throw new TagOperationException('Failed to delete tag')
    }
  }

  async getAllTags(userId: string): Promise<Tag[]> {
    try {
      return await this.repository.find({ 
        where: { userId },
        order: { 
          createdAt: 'DESC'
        }
      })
    } catch (error) {
      throw new TagOperationException('Failed to fetch tags')
    }
  }

  async addTagToRecord(tagId: string, recordId: string): Promise<void> {
    try {
      await this.repository
        .createQueryBuilder()
        .relation(Tag, 'records')
        .of(tagId)
        .add(recordId)
    } catch (error) {
      throw new TagOperationException('Failed to add tag to record')
    }
  }

  async removeTagFromRecord(tagId: string, recordId: string): Promise<void> {
    try {
      await this.repository
        .createQueryBuilder()
        .relation(Tag, 'records')
        .of(tagId)
        .remove(recordId)
    } catch (error) {
      throw new TagOperationException('Failed to remove tag from record')
    }
  }
}