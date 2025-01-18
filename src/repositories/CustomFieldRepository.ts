import { Repository } from 'typeorm'
import { CustomField } from '../entities'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CustomFieldRepository {
  constructor(
    @InjectRepository(CustomField)
    private readonly repository: Repository<CustomField>,
  ) {}

  async getCustomFieldById(id: string): Promise<CustomField | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['record'],
    })
  }

  async createCustomField(customField: Partial<CustomField>): Promise<CustomField> {
    const newField = this.repository.create(customField)
    return await this.repository.save(newField)
  }

  async updateCustomField(id: string, customField: Partial<CustomField>): Promise<void> {
    await this.repository.update(id, customField)
  }

  async deleteCustomField(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async createCustomFields(customFields: Partial<CustomField>[]): Promise<void> {
    await this.repository.save(customFields)
  }
}
