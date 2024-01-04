import { IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWashingcardayDto {

    @ApiPropertyOptional({ description: '세차 시작일' })
    @IsString()
    started_at: Date;

    @ApiPropertyOptional({ description: '지속 종료일' })
    @IsString()
    finished_at: Date;

    @ApiPropertyOptional({ description: '단기 nx' })
    @IsNumber()
    @Type(() => Number)
    nx: number;

    @ApiPropertyOptional({ description: '단기 ny' })
    @IsNumber()
    @Type(() => Number)
    ny: number;

    @ApiPropertyOptional({ description: '중기 regid' })
    @IsString()
    regId: string;

    @ApiPropertyOptional({ description: '세차일 등록시 무시 확률' })
    @IsNumber()
    @Type(() => Number)
    custom_pop: number;
}
