import { UserRecord } from '../entities'

export interface FilterQueryResponse {
  records: UserRecord[]
  total: number
}
