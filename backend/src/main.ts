import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with support for credentials/cookies
  app.enableCors({
    origin: true, // Echoes the request origin, robust for local dev
    credentials: true,
  });

  // Load cookie parser middleware
  app.use(cookieParser());

  // Use global NestJS validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 4000; // Run backend on 4000 to keep 3000 free for Next.js
  await app.listen(port);
  console.log(`🚀 CareerPilot AI Backend running on: http://localhost:${port}`);
}
bootstrap();
