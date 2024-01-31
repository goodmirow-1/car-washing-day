import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthMiddleware } from '../utils/auth/user-auth.middleware';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './entities/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService,UserRepository],
  exports: [UserRepository]
  
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .exclude(
        {
          path: 'v1/user',
          method: RequestMethod.POST,
        },
        {
          path: 'v1/user/login',
          method: RequestMethod.POST,
        },
      )
      .forRoutes(UserController);
  }
}
