import { IsEmail, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  loginType: string;

  @IsString()
  nickName: string;

  @IsString()
  address: string;

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

  @IsString()
  fcmToken: string;
}
