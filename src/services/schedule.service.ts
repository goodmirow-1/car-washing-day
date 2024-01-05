import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WeatherService } from './weather.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';
import { Weather } from './weather';
import { MiddleWeather } from './middle-weather';


@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private check: boolean = false;

  constructor(
    private weatherService: WeatherService,
    @InjectRedis() private readonly client: Redis
    ) {}

  private retryXList: number[] = [];
  private retryYList: number[] = [];

  private retryRegIdList: string[] = [];

  // @Cron(CronExpression.EVERY_SECOND)
  @Cron('20 05 * * *') //오전 5시 20분
  async shortAmWeatherHandleCron() {
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

    const now = new Date();
    const dateString = now.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식

    await this.setShortWeatherData(xList,yList,dateString, '0500');

    //실패한 리스트 재시도
    while(this.retryXList.length != 0){
      await this.setShortWeatherData(this.retryXList, this.retryYList,dateString, '0500');
    }
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

    const now = new Date();
    const dateString = now.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식

    await this.setShortWeatherData(xList,yList,dateString, '1700');

    //실패한 리스트 재시도
    while(this.retryXList.length != 0){
      await this.setShortWeatherData(this.retryXList, this.retryYList,dateString, '1700');
    }
  }

  @Cron('00 08 * * *') //오전 8시 00분
  async middleAmWeatherHandleCron() {
    const regIdList: string[] = [];

    const filePath = path.join(process.cwd(), 'middle-grid.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
  
    const lines = fileContents.split('\n');
  
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      regIdList.push(parts[0]); 
    });

    const now = new Date();
    const dateString = now.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식

    console.log(dateString);

    await this.setMiddleWeatherData(regIdList, dateString+'0600');

    //실패한 리스트 재시도
    while(this.retryRegIdList.length != 0){
      await this.setMiddleWeatherData(regIdList, dateString+'0600');
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

    const now = new Date();
    const dateString = now.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식

    console.log(dateString);

    await this.setMiddleWeatherData(regIdList, dateString+'1800');

    //실패한 리스트 재시도
    while(this.retryRegIdList.length != 0){
      await this.setMiddleWeatherData(regIdList, dateString+'1800');
    }
  }

  //중기예보 계산
  async setMiddleWeatherData(list,tmFc){
    var errorCheck = false;

    for(var i = 0 ; i < list.length; ++i){
      this.logger.debug('Running scheduled task to fetch weather data');
      const weatherData = await this.weatherService.getMiddleWeatherData(tmFc,list[i]);
      if(weatherData == null){
        this.retryRegIdList.push(list[i]);
        errorCheck = true;
        continue;
      }

      if (weatherData.response && weatherData.response.body && weatherData.response.body.items) {
        const items = weatherData.response.body.items;

        var temp: MiddleWeather = new MiddleWeather();

        for (let j = 0; j < items.item.length; j++) {
          
          let item = items.item[j];

          temp.rnSt3Am = item.rnSt3Am;
          temp.rnSt3Pm = item.rnSt3Pm;
          temp.rnSt4Am = item.rnSt4Am;
          temp.rnSt4Pm = item.rnSt4Pm;
          temp.rnSt5Am = item.rnSt5Am;
          temp.rnSt5Pm = item.rnSt5Pm;
          temp.rnSt6Am = item.rnSt6Am;
          temp.rnSt6Pm = item.rnSt6Pm;
          temp.rnSt7Am = item.rnSt7Am;
          temp.rnSt7Pm = item.rnSt7Pm;
          temp.rnSt8 = item.rnSt8;
          temp.rnSt9 = item.rnSt9;
          temp.rnSt10 = item.rnSt10;
          temp.wf3Am = item.wf3Am;
          temp.wf3Pm = item.wf3Pm;
          temp.wf4Am = item.wf4Am;
          temp.wf4Pm = item.wf4Pm;
          temp.wf5Am = item.wf5Am;
          temp.wf5Pm = item.wf5Pm;
          temp.wf6Am = item.wf6Am;
          temp.wf6Pm = item.wf6Pm;
          temp.wf7Am = item.wf7Am;
          temp.wf7Pm = item.wf7Pm;
          temp.wf8 = item.wf8;
          temp.wf9 = item.wf9;
          temp.wf10 = item.wf10;
        }
      }else {
        console.log('Items not found in the data');
        continue;
      }

      await this.client.set(list[i], JSON.stringify(temp), 'EX', 60 * 60 * 2400);
    }

    if(errorCheck == false){
      this.retryRegIdList = [];
    }
  }

  //단기예보 계산
  async setShortWeatherData(xList,yList,day,time){
    var errorCheck = false;

    var tempXList: number[] = xList;
    var tempYList: number[] = yList;

    this.retryXList = [];
    this.retryYList = [];

    for(var i = 0 ; i < xList.length; ++i){
      this.logger.debug('Running scheduled task to fetch weather data');
      const weatherData = await this.weatherService.getWeatherData(day,time,xList[i].toString(),yList[i].toString());
      if(weatherData == null){
        this.retryXList.push(xList[i]);
        this.retryYList.push(yList[i]);
        errorCheck = true;
        continue;
      }

      if (weatherData.response && weatherData.response.body && weatherData.response.body.items) {
        const items = weatherData.response.body.items;

        var tempWeatherList: Weather[] = [];
        for (let j = 0; j < items.item.length; j++) {
          let item = items.item[j];
          let index = -1;

          let weather: Weather = null;
          for( let k = 0 ; k < tempWeatherList.length ; ++k){
            if(tempWeatherList[k].fcstDate == item.fcstDate && tempWeatherList[k].fcstTime == item.fcstTime){
              weather = tempWeatherList[k];
              index = k;
              break;
            }
          }

          if(weather == null) {
            weather = new Weather();
            weather.fcstDate = item.fcstDate;
            weather.fcstTime = item.fcstTime;
          }

          if(item.category == 'POP'){// 강수확률
            weather.pop = item.fcstValue;
          }else if(item.category == 'PTY'){ //강수형태
            weather.pty = item.fcstValue;
          }
          else if(item.category == 'SKY'){ //하늘 상태
            weather.sky = item.fcstValue;
          }

          if(index == -1){
            tempWeatherList.push(weather);
          }else{
            tempWeatherList[index] = weather;
          }
        }
      } else {
        console.log('Items not found in the data');
        continue;
      }

      var data: string = '';
      for(let j = 0 ; j < tempWeatherList.length ; ++j){
        data += JSON.stringify(tempWeatherList[j]);
        if(j != (tempWeatherList.length - 1)) data += ', ';
      }

      await this.client.set(xList[i].toString() + '/' + yList[i].toString(), data, 'EX', 60 * 60 * 2400);
    }

    if(errorCheck == false){
      this.retryXList = [];
      this.retryYList = [];
    }
  }
}
