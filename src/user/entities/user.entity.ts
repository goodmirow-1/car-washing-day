import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { Washingcarday } from '../../washingcarday/entities/washingcarday.entity';

  @Entity({ name: 'user' })
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: '고유 ID' })
    userId: number;

    @Column({ nullable: false, unique: true })
    @ApiProperty({ description: '이메일' })
    private email: string;

    @Column({ nullable: false})
    @ApiProperty({ description: '로그인 유형' })
    private loginType: string;

    @Column({ nullable: false})
    @ApiProperty({ description: '닉네임' })
    private nickName: string;

    @Column({ nullable: false})
    @ApiProperty({ description: '주소' })
    private address: string

    @Column({ nullable: true})
    @ApiProperty({ description: 'fcm 토큰' })
    public fcmToken: string;

    @Column({ nullable: false})
    @ApiProperty({ description: '뱃지 카운트' })
    private badgeCount: number;

    @Column({ nullable: false})
    @ApiProperty({ description: '알람 여부' })
    private alarm: boolean;

    @Column({ nullable: false})
    @ApiProperty({ description: '사용자 강수 확률' })
    custom_pop: number;

    @OneToMany(() => Washingcarday, (washingcarday) => washingcarday.user)
    @ApiProperty({ description: '등록한 세차일' })
    washingcarday: Washingcarday[];

    @CreateDateColumn({ type: 'datetime', nullable: false })
    @ApiProperty({ description: '가입일' })
    private created_at: Date;
  
    @UpdateDateColumn({ type: 'datetime', nullable: false })
    @ApiProperty({ description: '수정일' })
    private last_modified_at: Date;

    get getUserId(): number {
        return this.userId;
      }

    get getEmail(): string {
        return this.email;
    }

    get getLoginType(): string{
        return this.loginType;
    }

    get getNickName(): string {
      return this.nickName;
    }

    get getAddress(): string {
      return this.address;
    }

    get getAlarm(): boolean {
      return this.alarm;
    }

    get getBadgeCount(): number {
      return this.badgeCount;
    }

    get getFcmToken(): string {
      return this.fcmToken;
    }

    set setEmail(email: string){
      this.email = email;
    }

    set setLoginType(loginType: string){
      this.loginType = loginType;
    }

    set setNickName(nickName: string){
      this.nickName = nickName;
    }

    set setAddress(address: string){
      this.address = address;
    }

    set setBadgeCount(badgeCount: number){
      this.badgeCount = badgeCount;
    }

    set setAlarm(alarm: boolean){
      this.alarm = alarm;
    }

    set setFcmToken(fcmToken: string){
      this.fcmToken = fcmToken;
    }

    set setCustomPop(pop: number){
      this.custom_pop = pop;
    }

    get getCustomPop(): number{
      return this.custom_pop;
    }

    get getCreatedAt(): Date {
      return this.created_at;
    }

    get getLastModifiedAt(): Date {
      return this.last_modified_at;
    }
}
