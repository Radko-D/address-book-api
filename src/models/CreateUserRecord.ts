import { UserRecord } from '../entities'

export interface CreateUserRecord {
  record: Partial<UserRecord>
  tagId: string
}
