import { Washingcarday } from '../entities/washingcarday.entity';

export class WashingcardayInfoResponseDto{
    constructor(obj: Washingcarday) {
        this.id = obj.getID;
        this.started_at = obj.getStartedAt;
        this.finished_at = obj.getFinishedAt;
        this.checkUpdate = obj.getCheckUpdate;
    }

    id: number;
    started_at : Date;
    finished_at : Date;
    checkUpdate : boolean;
}

