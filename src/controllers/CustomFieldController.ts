import { Body, Controller, Delete, Param, Post, Patch, ForbiddenException } from '@nestjs/common';
import { CustomField } from '../entities';
import { CustomFieldService } from '../services';
import { UserFromRequest } from '../decorators/UserDecorator';
import { CustomFieldOperationException } from '../exceptions/CustomFieldException';
import { CreateCustomField, UpdateCustomField } from '../models';

@Controller('api/custom-field')
export class CustomFieldController {
  constructor(private readonly customFieldService: CustomFieldService) {}

  @Post(':recordId')
  async createCustomField(
    @Body() customField: CreateCustomField,
    @Param('recordId') recordId: string,
    @UserFromRequest('id') userId: string,
  ): Promise<CustomField> {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }
    if (!customField.name || customField.name.trim() === '') {
      throw new CustomFieldOperationException('Custom field name is required');
    }
    if (!customField.value || customField.value.trim() === '') {
      throw new CustomFieldOperationException('Custom field value is required');
    }

    return await this.customFieldService.createCustomField(customField, recordId, userId);
  }

  @Patch(':fieldId')
  async updateCustomField(
    @Body() customField: UpdateCustomField,
    @Param('fieldId') fieldId: string,
    @UserFromRequest('id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }
    if (!fieldId) {
      throw new CustomFieldOperationException('Custom field ID is required');
    }

    await this.customFieldService.updateCustomField(fieldId, userId, customField);
  }

  @Delete(':fieldId')
  async deleteCustomField(
    @Param('fieldId') fieldId: string,
    @UserFromRequest('id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }
    if (!fieldId) {
      throw new CustomFieldOperationException('Custom field ID is required');
    }

    await this.customFieldService.deleteCustomField(fieldId, userId);
  }
}