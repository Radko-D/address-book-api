import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, JoinColumn } from 'typeorm'
import { CustomField } from './CustomField.entity'
import { Tag } from './Tag.entity'

@Entity()
export class UserRecord {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'first_name', type: 'text' })
  firstName: string

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName: string

  @Column({ name: 'company_name', type: 'text', nullable: true })
  companyName: string

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string

  @Column({ name: 'phone_number', type: 'text' })
  phoneNumber: string

  @Column({ name: 'email', type: 'text', nullable: true })
  email: string

  @Column({ name: 'fax_number', type: 'text', nullable: true })
  faxNumber: string

  @Column({ name: 'mobile_phone_number', type: 'text', nullable: true })
  mobilePhoneNumber: string

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @OneToMany(() => CustomField, (customField) => customField.record, { cascade: true })
  @JoinColumn({ name: 'record_id' })
  customFields: CustomField[]

  @ManyToMany(() => Tag, (tag) => tag.records)
  @JoinTable({
    name: 'user_record_tags',
    joinColumn: {
      name: 'user_record_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[]
}
