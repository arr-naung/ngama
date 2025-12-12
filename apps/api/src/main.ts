import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  // TransformInterceptor temporarily disabled due to RxJS version conflicts
  // app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
