import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { CreateWashingcardayDto } from './dto/create-washingcarday.dto';
import { UpdateWashingcardayDto } from './dto/update-washingcarday.dto';
import { WashingcardayInfoResponseDto } from './dto/washingcarday-info.dto';
import { Washingcarday } from './entities/washingcarday.entity';
import { BasicMessageDto } from '../utils/basic-message.dto';
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
    @InjectRedis() private client: Redis
  ) {}

  private check: boolean = false;

  async closeRedis() {
    await this.client.quit();
  }

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

  async checkWashingDay(offsetDays = 0) {
    const now = this.setDateWithOffset(offsetDays);
    const days = await this.getWashingCarDays(now);
    
    const { tokensToUpdate, tokensToKeep } = await this.processWashingDays(days);

    if (offsetDays === 0) {
      this.sendNotification(tokensToUpdate, '오늘 날짜로 등록하신 세차일의 지속일이 기상변화로 인해 변경되었어요😰 어플을 통해 변경된 지속일을 확인해봐요!✅');
      this.sendNotification(tokensToKeep, '성공적인 세차가 되길 바랄께요!🙏');
    } else {
      this.sendNotification(tokensToUpdate, '내일 날짜로 등록하신 세차일의 지속일이 기상변화로 인해 변경되었어요😰 어플을 통해 변경된 지속일을 확인해봐요!✅');
    }
  }

  setDateWithOffset(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    date.setHours(9, 0, 0, 0);
    return date;
  }

  async getWashingCarDays(date) {
    // DB 조회 로직
    return await this.washingCarDayRepository
    .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
    .leftJoinAndSelect('washingcarday.user', 'user') // Assuming 'users' is the name of the relationship in WashingCarDay entity
    .select()
    .where('washingcarday.started_at = :date', { date }) // Using parameters to avoid SQL injection
    .getMany();
  }

  async processWashingDays(days) {
    let tokensToUpdate = [];
    let tokensToKeep = [];

    for (const day of days) {
        const weatherList = await this.fetchWeatherData(day.nx, day.ny);
        const middleWeatherData = await this.fetchMiddleTermWeatherData(day.regId);

        let shouldUpdate = this.checkWeatherCondition(weatherList, this.formatDate(day.started_at), this.formatDate(day.finished_at), day.custom_pop);

        if (!shouldUpdate) {
            shouldUpdate = this.isRainPossibleDay(middleWeatherData, day.custom_pop);
        }

        const token = day.user.fcmToken;
        if (shouldUpdate) {
            await this.updateWashingCarDay(day.id);
            if (token) tokensToUpdate.push(token);
        } else {
            if (token) tokensToKeep.push(token);
        }
    }

    return { tokensToUpdate, tokensToKeep };
  }

  async fetchWeatherData(nx, ny) {
      // Fetch short-term weather data and parse it
      const dataString = await this.client.get(`${nx}/${ny}`);
      return JSON.parse(`[${dataString}]`);
  }

  async fetchMiddleTermWeatherData(regId) {
      // Fetch middle-term weather data and parse it
      const dataString = await this.client.get(regId);
      return JSON.parse(dataString);
  }

  checkWeatherCondition(weatherList, startDate, endDate, customPop) {
      // Check weather conditions within the given date range
      for (const weather of weatherList) {
          if (weather.fcstDate >= startDate && weather.fcstDate <= endDate) {
              if (customPop < (weather.pop * 1)) {
                  return true;
              }
          }
      }
      return false;
  }

  async updateWashingCarDay(id) {
      // Update the WashingCarDay entity
      await this.washingCarDayRepository
          .createQueryBuilder()
          .update('washingcarday')
          .set({ check_update: true })
          .where('id = :id', { id })
          .execute();
  }

  async deleteWashingCarDay(id){
    return await this.washingCarDayRepository
    .createQueryBuilder('washingcarday')
    .delete()
    .where('id = :id', { id })
    .execute();
  }

  formatDate(date) {
      // Format the date to 'YYYYMMDD'
      return date.toISOString().split('T')[0].replaceAll('-', '');
  }

  sendNotification(tokens, bodyMessage,) {
    if(tokens.length == 0) return;
    // Push 메시지 발송 로직
    const message = {
      tokens: tokens,
      notification: {
        title: '세차언제',
        body: bodyMessage,
      },
    };

    admin.messaging().sendMulticast(message).then((response) => {
      console.log('push send success', response.successCount);
    }).catch(function (error) {
      console.log('push send failed' + error);
    });
  }

  @Cron('00 07 * * *') //오전 7시 - 오늘 세차일 변경 확인
  async checkTodayWashingDay() {
    await this.checkWashingDay();
  }

  @Cron('03 07 * * *') //오전 7시 - 내일 알림 세차일 변경 체크 확인
  async checkTommorowWashingDay() {
    await this.checkWashingDay(1);
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
        .andWhere('user.userId = :userId', {userId})
        .getOne();

        if(!!day){
          const dayId = day.id;

          await this.deleteWashingCarDay(dayId);
        }
  

      const obj = await this.objCreateDtoToEntity(userId, dto);

      if(!!obj){
        const newDay = await this.washingCarDayRepository.save(obj);
        return new WashingcardayInfoResponseDto(newDay);
      }else throw new NotImplementedException("can't create washingcardaydto");
  }

  async delete(
    userId: number,
    washingdayId: number,
    token: string,
  ): Promise<BasicMessageDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to udpate this user info.');
    }

    const result = await this.deleteWashingCarDay(washingdayId);

    if (result.affected !== 0) {
      return new BasicMessageDto('deleted Successfully.');
    } else throw new NotImplementedException('Not Implemented update user');
  }

  async test() : Promise<BasicMessageDto> {

    await this.checkWashingDay(1);

    return new BasicMessageDto('fcm send Successfully.');
  }
}
