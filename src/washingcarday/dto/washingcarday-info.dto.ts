import { Washingcarday } from '../entities/washingcarday.entity';

export class WashingcardayInfoResponseDto{
    constructor(obj: Washingcarday) {
        this.id = obj.getID;
        this.started_at = obj.getStartedAt;
        this.finished_at = obj.getFinishedAt;
        this.nx = obj.getNx;
        this.ny = obj.getNy;
        this.regId = obj.getRegId;
        this.custom_pop = obj.getCustomPop;
        this.check_update = obj.getCheckUpdate;
    }

    id: number;
    started_at : Date;
    finished_at : Date;
    nx: number;
    ny: number;
    regId: string;
    custom_pop: number;
    check_update : boolean;
}

