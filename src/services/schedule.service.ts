import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';
import { MiddleWeather } from '../models/middle-weather';
import { Weather,WeatherRowData } from '../models/weather';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private check: boolean = false;

  constructor(
    @InjectRedis() private readonly client: Redis
    ) {}

  private retryRegIdList: string[] = [];

  private getDate(){
    const now = new Date();
    now.setHours(now.getHours() + 9);
    return now.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식 
  }

  // @Cron(CronExpression.EVERY_SECOND)
  @Cron('20 05 * * *') //오전 5시 20분
  async shortAmWeatherHandleCron() {
    this.check = true;

    const xList: number[] = [];
    const yList: number[] = [];

    const filePath = path.join(process.cwd(), 'grid.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
  
    const lines = fileContents.split('\n');
  
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        xList.push(parseInt(parts[0], 10)); //두번째 인자는 진수
        yList.push(parseInt(parts[1], 10));
      }
    });

    let weather: Weather = new Weather(xList, yList, this.getDate(), '0500');

    await weather.setShortWeatherData(this.client);
    console.log('done am short form weather get');
  }

  @Cron('20 17 * * *') //오후 5시 20분
  async shortPmWeatherHandleCron() {
    const xList: number[] = [];
    const yList: number[] = [];

    const filePath = path.join(process.cwd(), 'grid.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
  
    const lines = fileContents.split('\n');
  
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        xList.push(parseInt(parts[0], 10)); //두번째 인자는 진수
        yList.push(parseInt(parts[1], 10));
      }
    });

    let weather: Weather = new Weather(xList, yList, this.getDate(), '1700');

    await weather.setShortWeatherData(this.client);
    console.log('done pm short form weather get');
  }

  @Cron(CronExpression.EVERY_SECOND)
  // @Cron('20 06 * * *') //오전 8시 00분
  async middleAmWeatherHandleCron() {
    if(this.check == false){
      this.check = true;
      const regIdList: string[] = [];

      const filePath = path.join(process.cwd(), 'middle-grid.txt');
      const fileContents = fs.readFileSync(filePath, 'utf8');
    
      const lines = fileContents.split('\n');
    
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        regIdList.push(parts[0]); 
      });
  
      let middleWeather: MiddleWeather = new MiddleWeather(regIdList, this.getDate() + '0600');
      await middleWeather.setMiddleWeatherData(this.client);
    }
  }

  @Cron('20 18 * * *') //오후 6시 10분
  async middlePmWeatherHandleCron() {
    const regIdList: string[] = [];

    const filePath = path.join(process.cwd(), 'middle-grid.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
  
    const lines = fileContents.split('\n');
  
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      regIdList.push(parts[0]); 
    });

    let middleWeather: MiddleWeather = new MiddleWeather(regIdList, this.getDate() + '1800');
    await middleWeather.setMiddleWeatherData(this.client);
  }
}
