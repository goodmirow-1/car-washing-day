import { IsEmail, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserLoginRequestDto {

  @ApiPropertyOptional({ description: '이메일' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: '로그인 유형' })
  @IsString()
  loginType: string;
}
