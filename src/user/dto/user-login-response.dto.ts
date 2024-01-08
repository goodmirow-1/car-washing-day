import { User } from '../entities/user.entity';
import { Washingcarday } from '../../washingcarday/entities/washingcarday.entity';
import { WashingcardayInfoResponseDto } from '../../washingcarday/dto//washingcarday-info.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserLoginResponseDto {
  constructor(user: User, washingcardays: Washingcarday[]) {
    this.userId = user.getUserId;
    this.nickName = user.getNickName;
    this.loginType = user.getLoginType;
    this.email = user.getEmail;
    this.address = user.getAddress;
    this.badgeCount = user.getBadgeCount;
    this.alarm = user.getAlarm;
    this.custom_pop = user.getCustomPop;
    this.is_exit = user.getIsExit;
    this.createdAt = user.getCreatedAt;
    this.washingcardays = washingcardays;
    this.schema = 'Bearer';
  }

  @ApiPropertyOptional({ description: '고유 Id' })
  userId: number;

  @ApiPropertyOptional({ description: '닉네임' })
  nickName: string;

  @ApiPropertyOptional({ description: '로그인 유형' })
  loginType: string;

  @ApiPropertyOptional({ description: '이메일' })
  email: string;

  @ApiPropertyOptional({ description: '주소' })
  address: string;

  @ApiPropertyOptional({ description: '알람 개수'})
  badgeCount: number;

  @ApiPropertyOptional({ description: '알람 여부' })
  alarm: boolean;

  @ApiPropertyOptional({ description: '사용자 강수 무시 확률' })
  custom_pop: number;

  @ApiPropertyOptional({ description: '탈퇴 여부' })
  is_exit: boolean;

  @ApiPropertyOptional({ description: 'auth에 필요한 값' })
  schema: string;

  @ApiPropertyOptional({ description: '가입일' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'auth token' })
  accessToken: string;

  @ApiPropertyOptional({ description: '세차일', type: WashingcardayInfoResponseDto })
  washingcardays: WashingcardayInfoResponseDto[];
}
