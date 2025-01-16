import { Body, Controller, Delete, Get, Param, Post, Put, HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common'
import { Tag } from '../entities'

import { User } from '../decorators/UserDecorator'
import { TagOperationException } from '../exceptions/TagException'
import { TagService } from '../services'

@Controller('api/tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAllTags(@User('id') userId: string): Promise<Tag[]> {
    if (!userId) {
      throw new ForbiddenException('User ID is required')
    }
    return await this.tagService.getAllTags(userId)
  }

  @Post()
  async createTag(
    @Body() tag: Partial<Tag>,
    @User('id') userId: string
  ): Promise<Tag> {
    if (!userId) {
      throw new ForbiddenException('User ID is required')
    }
    if (!tag.name || tag.name.trim() === '') {
      throw new TagOperationException('Tag name is required')
    }

    tag.userId = userId
    return await this.tagService.createTag(tag)
  }

  @Delete('delete')
  async deleteTag(
    @Body() { tagId }: { tagId: string },
    @User('id') userId: string
  ): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User ID is required')
    }
    if (!tagId) {
      throw new TagOperationException('Tag ID is required')
    }

    await this.tagService.deleteTag(tagId, userId)
  }

  @Put(':tagId')
  async updateTag(
    @Body() tag: Partial<Tag>,
    @User('id') userId: string,
    @Param('tagId') tagId: string
  ): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User ID is required')
    }
    if (!tagId) {
      throw new TagOperationException('Tag ID is required')
    }
    if (!tag.name || tag.name.trim() === '') {
      throw new TagOperationException('Tag name is required')
    }

    await this.tagService.updateTag(tagId, userId, tag)
  }

  @Post(':tagId/records/:recordId')
  async addTagToRecord(
    @Param('tagId') tagId: string,
    @Param('recordId') recordId: string,
    @User('id') userId: string
  ): Promise<void> {
    if (!userId || !tagId || !recordId) {
      throw new TagOperationException('All IDs are required')
    }

    await this.tagService.addTagToRecord(tagId, recordId, userId)
  }

  @Delete(':tagId/records/:recordId')
  async removeTagFromRecord(
    @Param('tagId') tagId: string,
    @Param('recordId') recordId: string,
    @User('id') userId: string
  ): Promise<void> {
    if (!userId || !tagId || !recordId) {
      throw new TagOperationException('All IDs are required')
    }

    await this.tagService.removeTagFromRecord(tagId, recordId, userId)
  }
}
