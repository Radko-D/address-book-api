// src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRecordController } from './controllers/UserRecordController'
import { UserRecordService } from './services/UserRecordService'
import { UserService } from './services/UserService'
import { UserRecordRepository, UserRepository } from './repositories'
import { CustomField, User, UserRecord } from './entities'
import { JwtStrategy } from './decorators/PublicDecorator'
import { AuthController } from './controllers/AuthController'
import { CustomFieldRepository } from './repositories/CustomFieldRepository'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, UserRecord, CustomField],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserRecord, CustomField]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserRecordController, AuthController],
  providers: [UserRecordService, UserRecordRepository, UserService, UserRepository, JwtStrategy, CustomFieldRepository],
})
export class AppModule {}
