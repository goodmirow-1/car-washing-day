import { IsEmail, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {

    @ApiPropertyOptional({ description: '로그인 유형' })
    @IsString()
    loginType: string;
  
    @ApiPropertyOptional({ description: '닉네임' })
    @IsString()
    nickName: string;
  
    @ApiPropertyOptional({ description: '주소' })
    @IsString()
    address: string;
  
    @ApiPropertyOptional({ description: '사용자 강수 확률' })
    @IsNumber()
    @Type(() => Number)
    custom_pop: number;

    @ApiPropertyOptional({ description: '알람 여부' })
    @IsBoolean()
    @Type(() => Boolean)
    alarm: boolean;
}
