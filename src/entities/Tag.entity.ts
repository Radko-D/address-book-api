import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from "typeorm"
import { User } from "./User.entity"
import { UserRecord } from "./UserRecord.entity"

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.tags)
  user: User

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @ManyToMany(() => UserRecord, (userRecord) => userRecord.tags)
  records: UserRecord[]
}