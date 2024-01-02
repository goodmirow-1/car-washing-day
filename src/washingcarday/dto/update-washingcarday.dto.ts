import { PartialType } from '@nestjs/mapped-types';
import { CreateWashingcardayDto } from './create-washingcarday.dto';

export class UpdateWashingcardayDto extends PartialType(CreateWashingcardayDto) {}
