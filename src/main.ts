// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일 로드

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService를 사용하여 환경 변수 로드
  // const configService = app.get(ConfigService);
  // const allowedOrigins =
  //   configService.get<string>('CORS_ALLOWED_ORIGINS')?.split(',') || [];

  app.enableCors({
    // origin: allowedOrigins,
    origin: true, // 모든 도메인 허용
    credentials: true, // 쿠키를 포함한 요청을 허용할 경우 true로 설정
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Cloud Album API')
    .setDescription('API documentation for the Cloud Album application')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
