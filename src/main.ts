import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/utils/swagger';
import configuration from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 // Specify CORS options
 const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

  // Enable CORS with options
  app.enableCors(corsOptions)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const dbConfig = await configuration.loadYamlConfig();

  await app.listen(dbConfig.http.port);
}
bootstrap();
