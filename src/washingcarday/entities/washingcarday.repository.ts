import { EntityRepository, Repository } from 'typeorm';
import { Washingcarday } from './washingcarday.entity';

@EntityRepository(Washingcarday)
export class WashingcardayRepository extends Repository<Washingcarday> {
}
