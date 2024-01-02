import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './services/weather.service';
import { ScheduleService } from './services/schedule.service';
import { RedisService } from './services/redis.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { WeatherController } from './controller/weather.controller';
import { WashingcardayModule } from './washingcarday/washingcarday.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule.forRoot({
      readyLog: true,
      config: {
        url: process.env.REDIS_HOST,
        port: 6379
      },
    }),
    ConfigModule.forRoot({
      /** env 파일 등록 */
      envFilePath: '.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
    type: 'mariadb',
    port: 3306,
    host: process.env.DATASOURCE_URL,
    username: process.env.DATASOURCE_USERNAME,
    password: process.env.DATASOURCE_PASSWORD,
    database: process.env.DATASOURCE_NAME,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
  }),UserModule, WashingcardayModule ],
  controllers: [WeatherController],
  providers: [RedisService,WeatherService,ScheduleService],
})
export class AppModule {}
