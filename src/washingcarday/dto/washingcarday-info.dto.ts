import { Washingcarday } from '../entities/washingcarday.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

    @ApiPropertyOptional({ description: '고유 Id' })
    id: number;

    @ApiPropertyOptional({ description: '세차 시작일' })
    started_at : Date;

    @ApiPropertyOptional({ description: '지속 종료일' })
    finished_at : Date;

    @ApiPropertyOptional({ description: '단기 nx' })
    nx: number;

    @ApiPropertyOptional({ description: '단기 ny' })
    ny: number;

    @ApiPropertyOptional({ description: '중기 regid' })
    regId: string;

    @ApiPropertyOptional({ description: '세차일 등록시 무시 확률' })
    custom_pop: number;

    @ApiPropertyOptional({ description: '기후 변화로 지속일이 변한적이 있나' })
    check_update : boolean;
}

