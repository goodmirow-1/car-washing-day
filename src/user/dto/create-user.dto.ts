import { IsEmail, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiPropertyOptional({ description: '이메일' })
  @IsEmail()
  email: string;

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
  custom_pop: number;

  get getEmail(): string {
    return this.email;
  }

  get getLoginType(): string {
    return this.loginType;
  }

  get getNickName(): string {
    return this.nickName;
  }

  get getAddress(): string {
    return this.address;
  }
}

export class FcmTokenDto {

  @ApiPropertyOptional({ description: 'fcm token' })
  @IsString()
  fcmToken: string;
}
