import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { InitializationService } from './initialization/initialization.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Scenor API')
    .setDescription('API Документация проекта')
    .setVersion('1.0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT полученный после регистрации',
      },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Initialize admin user and node types
  const initializationService = app.get(InitializationService);
  await initializationService.initialize();
  
  await app.listen(process.env.PORT ?? 3000, process.env.HOSTNAME ?? '127.0.0.1');
}
bootstrap();
