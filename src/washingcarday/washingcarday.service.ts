import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWashingcardayDto } from './dto/create-washingcarday.dto';
import { UpdateWashingcardayDto } from './dto/update-washingcarday.dto';
import { Washingcarday } from './entities/washingcarday.entity';
import { BasicMessageDto } from '../common/basic-message.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';

@Injectable()
export class WashingcardayService {
  constructor(
    @InjectRepository(Washingcarday) private washingCarDayRepository: Repository<Washingcarday>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  private getUser = async (userId: number): Promise<User> => {
    // return await this.userRepository.isEmailUsed(email);
      return 
      (await this.userRepository
        .createQueryBuilder()
        .select()
        .where('userId = :userId', { userId })
        .getOne()
    );
  };

  private objCreateDtoToEntity = async (userId:number, dto: CreateWashingcardayDto): Promise<Washingcarday> => {
    const user = await this.userRepository
    .createQueryBuilder()
    .select()
    .where('userId = :userId', { userId })
    .getOne();

    if (!!user) {
      const obj = new Washingcarday();
      obj.setStartedAt = new Date(dto.started_at);
      obj.setFinishedAt = new Date(dto.finished_at);
      obj.setCheckUpdate = false;
      obj.setUser = user;
      return obj;
    } else throw new NotFoundException();
  };

  async create(
    userId: number,
    dto: CreateWashingcardayDto,
    token: string) {
      if (extractUserId(token) !== userId) {
        throw new ForbiddenException('Not authorized to create this user info.');
      }

      const o = await this.objCreateDtoToEntity(userId, dto);

      console.log(o);

      const obj = await this.washingCarDayRepository.save(
        o,
      );

    return obj;
  }

  findAll() {
    return `This action returns all washingcarday`;
  }

  findOne(id: number) {
    return `This action returns a #${id} washingcarday`;
  }

  update(id: number, updateWashingcardayDto: UpdateWashingcardayDto) {
    return `This action updates a #${id} washingcarday`;
  }

  remove(id: number) {
    return `This action removes a #${id} washingcarday`;
  }
}
