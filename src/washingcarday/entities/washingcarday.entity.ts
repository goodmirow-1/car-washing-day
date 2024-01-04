import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    JoinColumn
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity'

@Entity({ name: 'washingcarday' })
export class Washingcarday extends BaseEntity{
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: '고유 ID' })
    id: number;

    @Column({ type: 'datetime', nullable: false })
    @ApiProperty({ description: '세차 시작일' })
    started_at: Date;

    @Column({ type: 'datetime', nullable: false })
    @ApiProperty({ description: '지속 만료일' })
    finished_at: Date;

    @Column({nullable: false })
    @ApiProperty({ description: '단기 nx' })
    nx: number;

    @Column({nullable: false })
    @ApiProperty({ description: '단기 ny' })
    ny: number;

    @Column({nullable: false })
    @ApiProperty({ description: '중기 regId' })
    regId: string;

    @Column({nullable: false })
    @ApiProperty({ description: '사용자 강수 무시 확률' })
    custom_pop: number;

    @Column()
    @ApiProperty({ description: '기후 변화로 지속일이 변한적이 있나' })
    check_update: boolean;

    @CreateDateColumn({ type: 'datetime', nullable: false })
    @ApiProperty({ description: '세차 등록일' })
    private created_at: Date;

    @ManyToOne(() => User, (user) => user.washingcarday)
    @JoinColumn({ name: 'userId' })
    user: User;

    get getID(): number{
        return this.id;
    }

    get getStartedAt(): Date{
        return this.started_at;
    }

    get getFinishedAt(): Date{
        return this.finished_at;
    }

    get getCheckUpdate(): boolean{
        return this.check_update;
    }

    get getNx(): number{
        return this.nx;
    }

    get getNy(): number{
        return this.ny;
    }

    get getRegId(): string{
        return this.regId;
    }

    get getCreatedAt(): Date {
        return this.created_at;
    }

    set setID(id: number){
        this.id = id;
    }

    set setStartedAt(started_at: Date){
        this.started_at = started_at;
    }

    set setFinishedAt(finished_at: Date){
        this.finished_at = finished_at;
    }

    set setNx(nx: number){
        this.nx = nx;
    }

    set setNy(ny: number){
        this.ny = ny;
    }

    set setRegId(regId: string){
        this.regId = regId;
    }

    set setCheckUpdate(check: boolean){
        this.check_update = check;
    }

    set setUser(user: User){
        this.user = user;
    }

    set setCustomPop(pop: number){
        this.custom_pop = pop;
    }
  
    get getCustomPop(): number{
        return this.custom_pop;
    }
}
