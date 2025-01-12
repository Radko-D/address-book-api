import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'email', unique: true, type: 'text' })
  email: string

  @Column({ name: 'first_name', type: 'text' })
  firstName: string

  @Column({ name: 'last_name', type: 'text' })
  lastName: string

  @Column({ name: 'password', type: 'text' })
  password: string

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
