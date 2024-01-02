import { IsEmail, IsString } from 'class-validator';

export class UserLoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  loginType: string;
}
