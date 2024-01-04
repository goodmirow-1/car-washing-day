import { User } from '../entities/user.entity';

export class UserResponseDto {
  constructor(user: User) {
    this.userId = user.getUserId;
    this.email = user.getEmail;
    this.loginType = user.getLoginType;
    this.nickName = user.getNickName;
    this.address = user.getAddress;
    this.badgeCount = user.getBadgeCount;
    this.alarm = user.getAlarm;
    this.custom_pop = user.getCustomPop;
    this.createdAt = user.getCreatedAt;
    this.lastModifiedAt = user.getLastModifiedAt;
  }
  userId: number;
  email: string;
  loginType: string;
  nickName: string;
  address: string;
  badgeCount: number;
  alarm: boolean;
  custom_pop: number;
  createdAt: Date;
  lastModifiedAt: Date;
}
