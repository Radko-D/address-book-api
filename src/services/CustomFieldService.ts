import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomField } from '../entities';
import { CustomFieldRepository } from '../repositories/CustomFieldRepository';
import { UserRecordRepository } from '../repositories/UserRecordRepository';
import { 
  CustomFieldNotFoundException,
  UnauthorizedCustomFieldAccessException,
  CustomFieldOperationException
} from '../exceptions/CustomFieldException';
import { CreateCustomField } from '../models';

@Injectable()
export class CustomFieldService {
  constructor(
    private readonly customFieldRepository: CustomFieldRepository,
    private readonly userRecordRepository: UserRecordRepository,
  ) {}

  private async validateRecordOwnership(recordId: string, userId: string): Promise<void> {
    const record = await this.userRecordRepository.getUserRecordById(recordId, userId);
    if (!record) {
      throw new NotFoundException(`Record with ID ${recordId} not found`);
    }
    if (record.userId !== userId) {
      throw new UnauthorizedCustomFieldAccessException();
    }
  }

  async createCustomField(
    customField: CreateCustomField,
    recordId: string,
    userId: string,
  ): Promise<CustomField> {
    try {
      await this.validateRecordOwnership(recordId, userId);

      const newCustomField = {
        ...customField,
        recordId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await this.customFieldRepository.createCustomField(newCustomField);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedCustomFieldAccessException) {
        throw error;
      }
      throw new CustomFieldOperationException(`Failed to create custom field: ${error.message}`);
    }
  }

  async updateCustomField(
    fieldId: string,
    userId: string,
    customField: Partial<CustomField>,
  ): Promise<void> {
    const existingField = await this.customFieldRepository.getCustomFieldById(fieldId);
    if (!existingField) {
      throw new CustomFieldNotFoundException(fieldId);
    }

    try {
      await this.validateRecordOwnership(existingField.record.id, userId);
      
      const updatedField = {
        ...customField,
        updatedAt: new Date(),
      };

      await this.customFieldRepository.updateCustomField(fieldId, updatedField);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedCustomFieldAccessException) {
        throw error;
      }
      throw new CustomFieldOperationException(`Failed to update custom field: ${error.message}`);
    }
  }

  async deleteCustomField(fieldId: string, userId: string): Promise<void> {
    const existingField = await this.customFieldRepository.getCustomFieldById(fieldId);
    if (!existingField) {
      throw new CustomFieldNotFoundException(fieldId);
    }

    try {
      await this.validateRecordOwnership(existingField.record.id, userId);
      await this.customFieldRepository.deleteCustomField(fieldId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedCustomFieldAccessException) {
        throw error;
      }
      throw new CustomFieldOperationException(`Failed to delete custom field: ${error.message}`);
    }
  }
}