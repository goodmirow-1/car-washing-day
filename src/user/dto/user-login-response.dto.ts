import { User } from '../entities/user.entity';
import { Washingcarday } from '../../washingcarday/entities/washingcarday.entity';
import { WashingcardayInfoResponseDto } from '../../washingcarday/dto//washingcarday-info.dto';

export class UserLoginResponseDto {
  constructor(user: User, washingcardays: Washingcarday[]) {
    this.userId = user.getUserId;
    this.nickName = user.getNickName;
    this.loginType = user.getLoginType;
    this.email = user.getEmail;
    this.address = user.getAddress;
    this.badgeCount = user.getBadgeCount;
    this.alarm = user.getAlarm;
    this.createdAt = user.getCreatedAt;
    this.washingcardays = washingcardays;
    this.schema = 'Bearer';
  }
  userId: number;
  nickName: string;
  loginType: string;
  email: string;
  address: string;
  badgeCount: number;
  alarm: boolean;
  schema: string;
  createdAt: Date;
  accessToken: string;
  washingcardays: WashingcardayInfoResponseDto[];
}
