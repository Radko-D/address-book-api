import { UserRecord } from '../entities'

export interface CreateUserRecord {
  userId: string
  record: Partial<UserRecord>
}
