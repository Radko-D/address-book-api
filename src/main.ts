import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from './guards/JwtAuthGuard'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalGuards(new JwtAuthGuard(new Reflector()))
  app.use(cookieParser(process.env.JWT_REFRESH_SECRET))
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
