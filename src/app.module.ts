import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions  } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleService } from './services/schedule.service';
import { RedisService } from './services/redis.service';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { WeatherController } from './controller/weather.controller';
import { WashingcardayModule } from './washingcarday/washingcarday.module';
import { configSchema } from './config/schema';
import configuration from './config/configuration';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      cache: true,
      isGlobal: true,
      validationSchema: configSchema,
      load: [configuration.loadYamlConfig],
    }),

    RedisModule.forRootAsync({
      useFactory: async () => {
        const dbConfig = await configuration.loadYamlConfig();

        return {
          readyLog: true,
          config: {
            url: dbConfig.redis.host,
            port: dbConfig.redis.port
          },
        } as RedisModuleOptions;
      }
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dbConfig = await configuration.loadYamlConfig();
        return {
          type: dbConfig.database.type,
          host: dbConfig.database.host,
          port: dbConfig.database.port,
          username: dbConfig.database.username,
          password: dbConfig.database.password,
          database: dbConfig.database.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: true,
        } as TypeOrmModuleOptions;
      }
    }),
  UserModule, WashingcardayModule],
  controllers: [WeatherController],
  providers: [RedisService,ScheduleService],
})
export class AppModule {}
