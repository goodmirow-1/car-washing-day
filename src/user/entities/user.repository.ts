import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async isEmailUsed(email: string) {
        const result = await this.createQueryBuilder("user")
            .where("user.email = :email", { email })
            .getOne();
    
        return result !== undefined;
    }
}
