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

    @Column()
    checkUpdate: boolean;

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
        return this.checkUpdate;
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

    set setCheckUpdate(check: boolean){
        this.checkUpdate = check;
    }

    set setUser(user: User){
        this.user = user;
    }
}
