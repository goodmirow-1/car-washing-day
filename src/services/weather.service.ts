import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {

  //base_time은 0500, 1700
  async getWeatherData(base_date,base_time,nx,ny) {
    const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${process.env.API_SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&numOfRows=1008&pageNo=1&dataType=JSON`;

    try {
      const response = await axios.get(url, {});
      return response.data;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return null;
    }
  }

  async getMiddleWeatherData(tmFc,regId) {
    const url = `http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?serviceKey=${process.env.MIDDLE_API_SERVICE_KEY}&tmFc=${tmFc}&regId=${regId}&numOfRows=10&pageNo=1&dataType=JSON`;

    try {
      const response = await axios.get(url, {});
      return response.data;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return null;
    }
  }
}
