// src/data-source.ts
import { DataSource } from 'typeorm'
import { User, UserRecord, CustomField, Tag } from './entities'
import * as dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, UserRecord, CustomField, Tag],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
})
