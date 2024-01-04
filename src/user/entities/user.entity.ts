import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
  } from 'typeorm';

  import { Washingcarday } from '../../washingcarday/entities/washingcarday.entity';

  @Entity({ name: 'user' })
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ nullable: false, unique: true })
    private email: string;

    @Column({ nullable: false})
    private loginType: string;

    @Column({ nullable: false})
    private nickName: string;

    @Column({ nullable: false})
    private address: string

    @Column({ nullable: true})
    public fcmToken: string;

    @Column({ nullable: false})
    private badgeCount: number;

    @Column({ nullable: false})
    private alarm: boolean;

    @Column({ nullable: false})
    custom_pop: number;

    @OneToMany(() => Washingcarday, (washingcarday) => washingcarday.user)
    washingcarday: Washingcarday[];

    @CreateDateColumn({ type: 'datetime', nullable: false })
    private created_at: Date;
  
    @UpdateDateColumn({ type: 'datetime', nullable: false })
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
