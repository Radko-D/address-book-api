import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserRecord } from './UserRecord.entity'

@Entity()
export class CustomField {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'value', type: 'text' })
  value: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date

  @ManyToOne(() => UserRecord, (record) => record.customFields)
  @JoinColumn({ name: 'record_id', referencedColumnName: 'id' })
  record: UserRecord
}
