// src/data-source.ts
import { DataSource } from 'typeorm';
import { User, UserRecord, CustomField } from './entities';
import { AddRefreshTokenToUser1704914234842 } from './migrations/1704914234842-AddRefreshTokenToUser';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, UserRecord, CustomField],
    migrations: [AddRefreshTokenToUser1704914234842],
    synchronize: false,
});