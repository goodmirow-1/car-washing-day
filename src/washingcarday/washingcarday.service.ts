import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { CreateWashingcardayDto } from './dto/create-washingcarday.dto';
import { UpdateWashingcardayDto } from './dto/update-washingcarday.dto';
import { WashingcardayInfoResponseDto } from './dto/washingcarday-info.dto';
import { Washingcarday } from './entities/washingcarday.entity';
import { BasicMessageDto } from '../common/basic-message.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { admin } from '../firebase/firebaseAdmin';

import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';

@Injectable()
export class WashingcardayService {
  constructor(
    @InjectRepository(Washingcarday) private washingCarDayRepository: Repository<Washingcarday>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRedis() private readonly client: Redis
  ) {}

  private check: boolean = false;

  isRainPossibleDay(middle, pop){
    var possible = false;

    if(middle.rnSt3Am > pop) possible = true;
    if(!possible && middle.rnSt3Pm > pop) possible = true;
    if(!possible && middle.rnSt4Am > pop) possible = true;
    if(!possible && middle.rnSt4Pm > pop) possible = true;
    if(!possible && middle.rnSt5Am > pop) possible = true;
    if(!possible && middle.rnSt5Pm > pop) possible = true;
    if(!possible && middle.rnSt6Am > pop) possible = true;
    if(!possible && middle.rnSt6Pm > pop) possible = true;
    if(!possible && middle.rnSt7Am > pop) possible = true;
    if(!possible && middle.rnSt8 > pop) possible = true;
    if(!possible && middle.rnSt9 > pop) possible = true;
    if(!possible && middle.rnSt10 > pop) possible = true;

    return possible;
  }

  @Cron('00 07 * * *') //오전 7시 - 오늘 알림
  async checkTodayWashingDay() {
    const now = new Date();
    now.setHours(9,0,0,0);

    const days = await this.washingCarDayRepository
      .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
      .leftJoinAndSelect('washingcarday.user', 'user') // Assuming 'users' is the name of the relationship in WashingCarDay entity
      .select()
      .where('washingcarday.started_at = :now', { now }) // Using parameters to avoid SQL injection
      .getMany();

      var tokens = [];
      for (const day of days) {
        
        //단기
        var dataString = await this.client.get(day.nx+ '/' + day.ny);
        var data = '[' + dataString + ']';
        var weatherList = JSON.parse(data);

        var start = day.started_at.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식
        var finish = day.finished_at.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식

        var go = true;
        for(const weather of weatherList){
          if(weather.fcstDate >= start && weather.fcstDate <= finish){
            if(day.custom_pop < (weather.pop * 1)){
              const id = day.id;

              await this.washingCarDayRepository
              .createQueryBuilder()
              .update('washingcarday')
              .set({ check_update: true})
              .where('id = :id', { id })
              .execute();

              const token = day.user.fcmToken;
              tokens.push(token);
              go = false;

              break;
            }
          }
        }

        //중기
        if(go){
          dataString = await this.client.get(day.regId);
          var middle = JSON.parse(dataString);

          console.log(middle);
          if(this.isRainPossibleDay(middle,day.custom_pop)){
            const id = day.id;

              await this.washingCarDayRepository
              .createQueryBuilder()
              .update('washingcarday')
              .set({ check_update: true})
              .where('id = :id', { id })
              .execute();

              const token = day.user.fcmToken;
              tokens.push(token);
          }
        }
      }

      const message = {
        tokens: tokens,
        notification: {
          title: '세차언제',
          body: '등록하신 세차일의 지속일이 기상변화로 인해 변경되었어요😰 어플을 통해 변경된 지속일을 확인해봐요!',
        },
      };

      admin.messaging().sendMulticast(message).then((response) => {
        console.log('push send success', response.successCount);
      }).catch(function (error) {
        console.log('push send failed' + error);
      });
  }

  // @Cron(CronExpression.EVERY_SECOND)
  @Cron('03 07 * * *') //오전 7시 - 내일 알림
  async checkTommorowWashingDay() {
    if(this.check == false){
      this.check = true;

    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(9,0,0,0);

    const days = await this.washingCarDayRepository
      .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
      .leftJoinAndSelect('washingcarday.user', 'user') // Assuming 'users' is the name of the relationship in WashingCarDay entity
      .select()
      .where('washingcarday.started_at = :now', { now }) // Using parameters to avoid SQL injection
      .getMany();

      var tokens = [];
      for (const day of days) {
        
        //단기
        var dataString = await this.client.get(day.nx+ '/' + day.ny);
        var data = '[' + dataString + ']';
        var weatherList = JSON.parse(data);

        var start = day.started_at.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식
        var finish = day.finished_at.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식

        var go = true;
        for(const weather of weatherList){
          if(weather.fcstDate >= start && weather.fcstDate <= finish){
            if(day.custom_pop < (weather.pop * 1)){
              const id = day.id;

              await this.washingCarDayRepository
              .createQueryBuilder()
              .update('washingcarday')
              .set({ check_update: true})
              .where('id = :id', { id })
              .execute();

              const token = day.user.fcmToken;
              tokens.push(token);
              go = false;

              break;
            }
          }
        }

        //중기
        if(go){
          dataString = await this.client.get(day.regId);
          var middle = JSON.parse(dataString);

          console.log(middle);
          if(this.isRainPossibleDay(middle,day.custom_pop)){
            const id = day.id;

              await this.washingCarDayRepository
              .createQueryBuilder()
              .update('washingcarday')
              .set({ check_update: true})
              .where('id = :id', { id })
              .execute();

              const token = day.user.fcmToken;
              tokens.push(token);
          }
        }
      }

      const message = {
        tokens: tokens,
        notification: {
          title: '세차언제',
          body: '등록하신 세차일의 지속일이 기상변화로 인해 변경되었어요😰 어플을 통해 변경된 지속일을 확인해봐요!',
        },
      };

      admin.messaging().sendMulticast(message).then((response) => {
        console.log('push send success', response.successCount);
      }).catch(function (error) {
        console.log('push send failed' + error);
      });
    }
  }

  private objCreateDtoToEntity = async (userId:number, dto: CreateWashingcardayDto): Promise<Washingcarday> => {
    const user = await this.userRepository
    .createQueryBuilder()
    .select()
    .where('userId = :userId', { userId })
    .getOne();

    if (!!user) {
      const obj = new Washingcarday();
      obj.setStartedAt = new Date(dto.started_at);
      obj.setFinishedAt = new Date(dto.finished_at);
      obj.setNx = dto.nx;
      obj.setNy = dto.ny;
      obj.setRegId = dto.regId;
      obj.setCustomPop = dto.custom_pop;
      obj.setCheckUpdate = false;
      obj.setUser = user;
      return obj;
    } else return null;
  };

  async create(
    userId: number,
    dto: CreateWashingcardayDto,
    token: string) {
      if (extractUserId(token) !== userId) {
        throw new ForbiddenException('Not authorized to create this user info.');
      }

      const now = new Date();
      now.setHours(9,0,0,0);
  
      const day = await this.washingCarDayRepository
        .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
        .leftJoinAndSelect('washingcarday.user', 'user') // Assuming 'users' is the name of the relationship in WashingCarDay entity
        .select()
        .where('washingcarday.started_at >= :now', { now }) // Using parameters to avoid SQL injection
        .getOne();

        if(!!day){
          const dayId = day.id;

          await this.washingCarDayRepository
          .createQueryBuilder('washingcarday')
          .delete()
          .where('id = :dayId', { dayId })
          .execute();
        }
  

      const obj = await this.objCreateDtoToEntity(userId, dto);

      if(!!obj){
        await this.washingCarDayRepository.save(obj);
        return new WashingcardayInfoResponseDto(day);
      }else throw new NotFoundException();
  }
}
