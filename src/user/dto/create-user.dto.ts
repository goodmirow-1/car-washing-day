import { IsEmail, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  constructor(email:string, loginType:string,nickName:string,address:string,custom_pop:number,alarm:boolean ){
    this.email = email,
    this.loginType = loginType,
    this.nickName = nickName,
    this.address = address,
    this.custom_pop = custom_pop,
    this.alarm = alarm
  }

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

  @ApiPropertyOptional({ description: '알람 여부' })
  @IsBoolean()
  alarm: boolean;

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
