import { IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWashingcardayDto {
    @IsString()
    started_at: Date;

    @IsString()
    finished_at: Date;

    @IsNumber()
    @Type(() => Number)
    nx: number;

    @IsNumber()
    @Type(() => Number)
    ny: number;

    @IsString()
    regId: string;

    @IsNumber()
    @Type(() => Number)
    custom_pop: number;
}
