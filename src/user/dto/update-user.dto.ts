import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto,FcmTokenDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {}

export class UpdateFcmTokenDto extends PartialType(FcmTokenDto) {}
