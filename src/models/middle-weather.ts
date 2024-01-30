import Redis from 'ioredis';
import axios from 'axios';

export class MiddleWeatherRowData {
    rnSt3Am: number;
    rnSt3Pm: number;
    rnSt4Am: number;
    rnSt4Pm: number;
    rnSt5Am: number;
    rnSt5Pm: number;
    rnSt6Am: number;
    rnSt6Pm: number;
    rnSt7Am: number;
    rnSt7Pm: number;
    rnSt8: number;
    rnSt9: number;
    rnSt10: number;
    wf3Am: string;
    wf3Pm: string;
    wf4Am: string;
    wf4Pm: string;
    wf5Am: string;
    wf5Pm: string;
    wf6Am: string;
    wf6Pm: string;
    wf7Am: string;
    wf7Pm: string;
    wf8: string;
    wf9: string;
    wf10: string;

    constructor(){
        this.rnSt3Am = 0;
        this.rnSt3Pm = 0;
        this.rnSt4Am = 0;
        this.rnSt4Pm = 0;
        this.rnSt5Am = 0;
        this.rnSt5Pm = 0;
        this.rnSt6Am = 0;
        this.rnSt6Pm = 0;
        this.rnSt7Am = 0;
        this.rnSt7Pm = 0;
        this.rnSt8 = 0;
        this.rnSt9 = 0;
        this.rnSt10 = 0;
        this.wf3Am = '';
        this.wf3Pm = '';
        this.wf4Am = '';
        this.wf4Pm = '';
        this.wf5Am = '';
        this.wf5Pm = '';
        this.wf6Am = '';
        this.wf6Pm = '';
        this.wf7Am = '';
        this.wf7Pm = '';
        this.wf8 = '';
        this.wf9 = '';
        this.wf10 = '';
    }
}

export class MiddleWeather {
    regIdList: string[];
    retryRegIdList: string[];
    tmFc: string;
    date: string;
    time: string;
    needRetry: boolean;

    constructor(regIdList: string[], tmFc: string) {
        this.regIdList = regIdList;
        this.retryRegIdList = [];
        this.tmFc = tmFc;
        this.needRetry = false;
    }

    //중기예보 계산
    async setMiddleWeatherData(client) {
        while(this.regIdList.length > 0){
            await this.processCoordinates(client,this.regIdList);
            this.updateRetryLists();
            this.regIdList = this.retryRegIdList;
        }
    }

    async processCoordinates(client, regIdList) {
        for (let i = 0; i < regIdList.length; ++i) {
            console.log('Running scheduled task to fetch middle range weather data');
            const weatherData = await this.getMiddleWeatherData(regIdList[i]);

            if (!this.isValidWeatherData(weatherData)) {
                this.handleInvalidData(regIdList[i]);
                continue;
            }

            await this.processAndStoreWeatherData(client, regIdList[i], weatherData);
        }
    }

    isValidWeatherData(weatherData) {
        return weatherData && weatherData.response && weatherData.response.body && weatherData.response.body.items;
    }

    async processAndStoreWeatherData(client, regId, weatherData) {
        const temp = this.extractWeatherData(weatherData.response.body.items);
        const EXPIRE_TIME = 60 * 60 * 24; // 1 day in seconds
        await client.set(regId, JSON.stringify(temp), 'EX', EXPIRE_TIME);
    }

    extractWeatherData(items) {
        const temp = new MiddleWeatherRowData();
        if (items.item.length > 0) {
            const item = items.item[0]; // Assuming all relevant data is in the first item
            Object.keys(item).forEach(key => {
                if (temp.hasOwnProperty(key)) {
                    temp[key] = item[key];
                }
            });
        }
        return temp;
    }

    handleInvalidData(regId) {
        console.log('Invalid weather data found');
        this.retryRegIdList.push(regId);
        this.needRetry = true;
    }

    updateRetryLists() {
        if (!this.needRetry) {
            this.retryRegIdList = [];
            this.needRetry = false;
        }
    }

    async getMiddleWeatherData(regId) {
        const url = `http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?serviceKey=${process.env.MIDDLE_API_SERVICE_KEY}&tmFc=${this.tmFc}&regId=${regId}&numOfRows=10&pageNo=1&dataType=JSON`;

        try {
            const response = await axios.get(url, {});
            return response.data;
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            return null;
        }
    }
}