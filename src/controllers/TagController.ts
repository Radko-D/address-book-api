import { Body, Controller, Delete, Get, Param, Post, ForbiddenException, Patch } from '@nestjs/common'
import { Tag } from '../entities'
import { TagOperationException } from '../exceptions/TagException'
import { TagService } from '../services'
import { CreateTag } from '../models'
import { UserFromRequest } from '../decorators/UserDecorator'

@Controller('api/tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAllTags(@UserFromRequest('id') userId: string): Promise<Tag[]> {
    if (!userId) {
      throw new ForbiddenException('User ID is required')
    }
    return await this.tagService.getAllTags(userId)
  }

  @Post()
  async createTag(@Body() tag: Partial<Tag>, @UserFromRequest('id') userId: string): Promise<Tag> {
    if (!tag.name || tag.name.trim() === '') {
      throw new TagOperationException('Tag name is required')
    }

    tag.userId = userId
    return await this.tagService.createTag(tag)
  }

  @Delete('delete')
  async deleteTag(@Body() { tagId }: { tagId: string }, @UserFromRequest('id') userId: string): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User ID is required')
    }
    if (!tagId) {
      throw new TagOperationException('Tag ID is required')
    }

    await this.tagService.deleteTag(tagId, userId)
  }

  @Patch(':tagId')
  async updateTag(@Body() tag: CreateTag, @UserFromRequest('id') userId: string, @Param('tagId') tagId: string): Promise<void> {
    if (!tagId) {
      throw new TagOperationException('Tag ID is required')
    }
    if (!tag.name || tag.name.trim() === '') {
      throw new TagOperationException('Tag name is required')
    }

    await this.tagService.updateTag(tagId, userId, tag)
  }

  @Post(':tagId/records/:recordId')
  async addTagToRecord(@Param('tagId') tagId: string, @Param('recordId') recordId: string, @UserFromRequest('id') userId: string): Promise<void> {
    if (!tagId || !recordId) {
      throw new TagOperationException('All IDs are required')
    }

    await this.tagService.addTagToRecord(tagId, recordId, userId)
  }

  @Delete(':tagId/records/:recordId')
  async removeTagFromRecord(
    @Param('tagId') tagId: string,
    @Param('recordId') recordId: string,
    @UserFromRequest('id') userId: string,
  ): Promise<void> {
    if (!tagId || !recordId) {
      throw new TagOperationException('All IDs are required')
    }

    await this.tagService.removeTagFromRecord(tagId, recordId, userId)
  }
}
