import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from './guards/JwtAuthGuard'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors';


async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalGuards(new JwtAuthGuard(new Reflector()))
  app.use(cookieParser())
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  )

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
