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
import { CustomField, Tag, User, UserRecord } from './entities'
import { JwtStrategy } from './decorators/PublicDecorator'
import { AuthController } from './controllers/AuthController'
import { CustomFieldRepository } from './repositories/CustomFieldRepository'
import { TagController } from './controllers/TagController'
import { CustomFieldService, TagService } from './services'
import { TagRepository } from './repositories/TagRepository'
import { CustomFieldController } from './controllers/CustomFieldController'

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
        entities: [User, UserRecord, CustomField, Tag],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserRecord, CustomField, Tag]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserRecordController, AuthController, TagController, CustomFieldController],
  providers: [
    UserRecordService,
    UserRecordRepository,
    UserService,
    UserRepository,
    JwtStrategy,
    CustomFieldRepository,
    TagService,
    TagRepository,
    CustomFieldService,
  ],
})
export class AppModule {}
