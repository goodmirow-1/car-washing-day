import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthMiddleware } from '../middlewares/user-auth.middleware';
import { Washingcarday } from './entities/washingcarday.entity';
import { WashingcardayService } from './washingcarday.service';
import { WashingcardayController } from './washingcarday.controller';
import { User } from '../user/entities/user.entity';
import { WashingcardayRepository } from './entities/washingcarday.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Washingcarday,User])],
  controllers: [WashingcardayController],
  providers: [WashingcardayService,WashingcardayRepository],
  exports: [ WashingcardayRepository ]
})
export class WashingcardayModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .exclude(
        
      )
      .forRoutes(WashingcardayController);
  }
}
