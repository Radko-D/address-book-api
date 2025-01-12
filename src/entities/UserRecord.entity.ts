import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { CustomField } from './CustomField.entity'

@Entity()
export class UserRecord {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'first_name', type: 'text' })
  firstName: string

  @Column({ name: 'last_name', type: 'text' })
  lastName: string

  @Column({ name: 'company_name', type: 'text' })
  companyName: string

  @Column({ name: 'address', type: 'text' })
  address: string

  @Column({ name: 'phone_number', type: 'text' })
  phoneNumber: string

  @Column({ name: 'email', unique: true, type: 'text' })
  email: string

  @Column({ name: 'fax_number', type: 'text' })
  faxNumber: string

  @Column({ name: 'mobile_phone_number', type: 'text' })
  mobilePhoneNumber: string

  @Column({ name: 'comment', type: 'text' })
  comment: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @OneToMany(() => CustomField, (customField) => customField.record)
  customFields: CustomField[]
}
