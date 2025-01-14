import { Repository } from 'typeorm'
import { CustomField, UserRecord } from '../entities'
import { InjectRepository } from '@nestjs/typeorm'

export class CustomFieldRepository {
  constructor(
    @InjectRepository(CustomField)
    private readonly repository: Repository<CustomField>,
  ) {}

   async createCustomField(customField: Partial<CustomField>): Promise<void> {
     await this.repository.save(customField)
    }
}
