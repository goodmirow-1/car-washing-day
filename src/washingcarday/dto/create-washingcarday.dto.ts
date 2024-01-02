import { IsString, IsDate } from 'class-validator';

export class CreateWashingcardayDto {
    @IsString()
    started_at: Date;

    @IsString()
    finished_at: Date;
}
