import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from 'typeorm'
import { User } from './User.entity'
import { UserRecord } from './UserRecord.entity'

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'color', type: 'text' })
  color: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.tags)
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToMany(() => UserRecord, (userRecord) => userRecord.tags)
  records: UserRecord[]
}
