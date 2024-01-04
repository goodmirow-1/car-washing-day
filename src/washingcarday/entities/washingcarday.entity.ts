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

import { User } from '../../user/entities/user.entity'

@Entity({ name: 'washingcarday' })
export class Washingcarday extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'datetime', nullable: false })
    started_at: Date;

    @Column({ type: 'datetime', nullable: false })
    finished_at: Date;

    @Column({nullable: false })
    nx: number;

    @Column({nullable: false })
    ny: number;

    @Column({nullable: false })
    regId: string;

    @Column({nullable: false })
    custom_pop: number;

    @Column()
    check_update: boolean;

    @CreateDateColumn({ type: 'datetime', nullable: false })
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
