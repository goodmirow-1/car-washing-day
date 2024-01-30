import Redis from 'ioredis';
import axios from 'axios';

export class WeatherRowData {
    fcstDate: string;
    fcstTime: string;
    pop: string;
    pty: string;
    sky: string;
  
    constructor(fcstDate: string, fcstTime:string) {
      this.fcstDate = fcstDate;
      this.fcstTime = fcstTime;
      this.pop = '';
      this.pty = '';
      this.sky = '';
    }
}  

export class Weather {
    xList: number[];
    yList: number[];
    retryXList: number[];
    retryYList: number[];
    date: string;
    time: string;
    needRetry: boolean;
  
    constructor(xList: number[],yList: number[], date: string, time: string) {
      this.xList = xList;
      this.yList = yList;
      this.retryXList = xList;
      this.retryYList = yList;
      this.date = date;
      this.time = time;
      this.needRetry = false;
    }

    async setShortWeatherData(client) {
        while (this.xList.length > 0) {
            await this.processCoordinates(client, this.xList, this.yList);
            this.updateRetryLists();
            this.xList = this.retryXList;
            this.yList = this.retryYList;
        }
    }

    async processCoordinates(client, xList, yList) {
        for (let i = 0; i < xList.length; ++i) {
            console.log('Running scheduled task to fetch weather data');
            await this.fetchAndProcessWeatherData(client, xList[i], yList[i]);
            if (this.needRetry) {
                this.addToRetryList(xList[i], yList[i]);
            }
        }
    }

    async fetchAndProcessWeatherData(client, x, y) {
        const weatherData = await this.getWeatherData(x.toString(), y.toString());

        if (!this.isValidWeatherData(weatherData)) {
            this.needRetry = true;
            return;
        }

        const processedData = this.processWeatherData(weatherData);
        await this.storeWeatherData(client, x, y, processedData);
    }

    isValidWeatherData(weatherData) {
        return weatherData && weatherData.response && weatherData.response.body && weatherData.response.body.items;
    }

    processWeatherData(weatherData) {
        const items = weatherData.response.body.items;
        let tempWeatherList = [];

        items.item.forEach(item => {
            let weather = this.findWeatherByDateAndTime(tempWeatherList, item);
            if (!weather) {
                weather = new WeatherRowData(item.fcstDate, item.fcstTime);
                tempWeatherList.push(weather);
            }
            this.updateWeatherData(weather, item);
        });

        return tempWeatherList;
    }

    findWeatherByDateAndTime(tempWeatherList, item) {
        return tempWeatherList.find(w => w.fcstDate === item.fcstDate && w.fcstTime === item.fcstTime);
    }

    updateWeatherData(weather, item) {
        switch (item.category) {
            case 'POP':
                weather.pop = item.fcstValue;
                break;
            case 'PTY':
                weather.pty = item.fcstValue;
                break;
            case 'SKY':
                weather.sky = item.fcstValue;
                break;
        }
    }

    async storeWeatherData(client, x,y , weatherList) {
        const data = weatherList.map(weather => JSON.stringify(weather)).join(', ');
        const key = `${x}/${y}`;
        const EXPIRE_TIME = 60 * 60 * 24; // 1 day in seconds
        await client.set(key, data, 'EX', EXPIRE_TIME);
    }

    addToRetryList(x, y) {
        this.retryXList.push(x);
        this.retryYList.push(y);
    }

    updateRetryLists() {
        if (!this.needRetry) {
            this.retryXList = [];
            this.retryYList = [];
            this.needRetry = false;
        }
    }

    
    //base_time은 0500, 1700
    async getWeatherData(nx,ny) {
        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${process.env.API_SERVICE_KEY}&base_date=${this.date}&base_time=${this.time}&nx=${nx}&ny=${ny}&numOfRows=1008&pageNo=1&dataType=JSON`;

        try {
            const response = await axios.get(url, {});
            return response.data;
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            return null;
        }
    }
  }
  