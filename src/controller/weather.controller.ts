import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Weather } from '../services/weather';

@Controller('weather')
export class WeatherController {
  constructor(  @InjectRedis() private readonly client: Redis) {}

  @Get('short/:nx/:ny')
  async getShortForm(@Param('nx') nx: string, @Param('ny') ny:string) {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0].replaceAll('-', ''); // 'YYYY-MM-DD' 형식
    const timeString = now.toTimeString().split(' ')[0].replaceAll(':', '').substring(0,4); // 'HH:MM:SS' 형식

    return await this.generateWeatherData(nx+'/'+ny, Number(dateString), Number(timeString));
  }

  @Get('middle/:regId')
  async getMiddleForm(@Param('regId') regId: string) {
    var dataString = await this.client.get(regId);
    var weather = JSON.parse(dataString);
    return weather;
  }

  async generateWeatherData(key, today, now){
    var dataString = await this.client.get(key);
    var data = '[' + dataString + ']';
    var weatherList = JSON.parse(data);
    
    var todayAmList: Weather[] = [];
    var todayPmList: Weather[] = [];
    var tomorrowAmList: Weather[] = [];
    var tomorrowPmList: Weather[] = [];
    var afterTomorrowAmList:Weather[] = [];
    var afterTomorrowPmList:Weather[] = [];

    var todayAmRes;
    var todayPmRes;
    var tomorrowAmRes;
    var tomorrowPmRes;
    var afterTommorowAmRes;
    var afterTommorowPmRes;

    var nowWeather;
    var tommorowCheck = now >= 2300 ? true : false;

    for(var i = 0 ; i < weatherList.length; ++i){
      var weather = weatherList[i] as Weather;

      var fcstDate: number = Number(weather.fcstDate);
      var fcstTime: number = Number(weather.fcstTime);

      if(fcstDate == today){  //오늘
        if(now <= fcstTime){
          if(tommorowCheck == false && (fcstTime - now) <= 100){
            nowWeather = weather;
          }

          if(fcstTime < 12){
            todayAmList.push(weather);
          }else{
            todayPmList.push(weather);
          }
        }
      }else if(fcstDate == (today + 1)){  //내일
        if(tommorowCheck && fcstTime == 0){
          nowWeather = weather;
        }

        if(fcstTime < 12){
          tomorrowAmList.push(weather);
        }else{
          tomorrowPmList.push(weather);
        }
      }else if(fcstDate == (today + 2)){  //모레
        if(fcstTime < 12){
          afterTomorrowAmList.push(weather);
        }else{
          afterTomorrowPmList.push(weather);
        }
      }
    }

    todayAmRes = this.calculateWeatherData(todayAmList);
    todayPmRes = this.calculateWeatherData(todayPmList);
    tomorrowAmRes = this.calculateWeatherData(tomorrowAmList);
    tomorrowPmRes = this.calculateWeatherData(tomorrowPmList);
    afterTommorowAmRes = this.calculateWeatherData(afterTomorrowAmList);
    afterTommorowPmRes = this.calculateWeatherData(afterTomorrowPmList);

    var res = {
      now : nowWeather,
      rnSt0Am : todayAmRes[0],
      rnSt0Pm : todayPmRes[0],
      rnSt1Am : tomorrowAmRes[0],
      rnSt1Pm : tomorrowPmRes[0],
      rnSt2Am : afterTommorowAmRes[0],
      rnSt2Pm : afterTommorowAmRes[0],
      wf0Am : todayAmRes[1],
      wf0Pm : todayPmRes[1],
      wf1Am : tomorrowAmRes[1],
      wf1Pm : tomorrowPmRes[1],
      wf2Am : afterTommorowAmRes[1],
      wf2Pm : afterTommorowAmRes[1],
    }

    return res;
  }

  calculateWeatherData(list){
    if(list.length == 0) return [0, ''];

    var rnSt: number = 0;
    var wf: string;

    //강수확률
    for(var i = 0 ; i < list.length ; ++i){
      var pop = (list[i].pop * 1);

      if(rnSt < pop){
        rnSt = pop;
      }
    }

    //강수형태
    var ptyList: number[] = [];
    var check = false;
    for(var i = 0 ; i < list.length ; ++i){
      ptyList.push((list[i].pty * 1));

      if(list[i].pty != '0'){
        check = true;
      }
    }

    if(check){
      const counts = this.countOccurrences(ptyList);
      const mostFrequent = this.findMostFrequent(counts);
      wf = this.getWeatherString(mostFrequent[0], true);
    }else{
      //하늘상태
      var skyList: number[] = [];
      for(var i = 0 ; i < list.length ; ++i){
        skyList.push((list[i].sky * 1));
      }

      const counts = this.countOccurrences(skyList);
      const mostFrequent = this.findMostFrequent(counts);
      wf = this.getWeatherString(mostFrequent[0], false);
    }

    return [rnSt, wf];
  }

  countOccurrences(list) {
    // 출현 횟수 계산
    const counts = list.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});

    return counts;
  }

  findMostFrequent(counts) {
    // 가장 많이 출현한 값 찾기
    return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  }

  getWeatherString(type,isPty){
    var res:string = '';

    if(isPty){
      switch(type){
        case '0': res = '없음'; break;
        case '1': res = '비' ; break;
        case '2': res = '비/눈'; break;
        case '3': res = '소나기'; break;
      }
    }else{
      switch(type){
        case '1': res = '맑음'; break;
        case '3': res = '구름많음' ; break;
        case '4': res = '흐림'; break;
      }
    }
    
    return res;
  }
}
