import { CustomField } from '../entities'

export class UpdateUserRecord {
  updatedRecord: {
    firstName?: string
    lastName?: string
    companyName?: string
    address?: string
    phoneNumber?: string
    email?: string
    faxNumber?: string
    mobilePhoneNumber?: string
    comment?: string
  }
  tagId?: string
}
