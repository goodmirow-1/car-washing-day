import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, FcmTokenDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { User } from './entities/user.entity';
import { BasicMessageDto } from '../utils/basic-message.dto';
import { Repository } from 'typeorm';

import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  private userCreateDtoToEntity = (dto: CreateUserDto): User => {
    const user = new User();
    user.setEmail = dto.email;
    user.setLoginType = dto.loginType;
    user.setNickName = dto.nickName;
    user.setAddress = dto.address;
    user.setCustomPop = dto.custom_pop;
    user.setAlarm = dto.alarm;
    return user;
  };

  private isEmailUsed = async (email: string): Promise<boolean> => {
      return (
      (await this.userRepository
        .createQueryBuilder()
        .select('u.userId')
        .from(User, 'u')
        .where('u.email = :email', { email })
        .getOne()) !== null
    );
  };

  async saveUser(dto: CreateUserDto): Promise<UserResponseDto> {
    if (await this.isEmailUsed(dto.email)) {
      throw new ConflictException('Email is already in use!');
    } else {
      const user = await this.userRepository.save(
        this.userCreateDtoToEntity(dto),
      );
      return new UserResponseDto(user);
    }
  }

  async getUserInfo(
    userId: number,
    token: string,
  ): Promise<UserResponseDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to get this user info.');
    }
    const user = await this.userRepository
    .createQueryBuilder()
    .select()
    .where('userId = :userId', { userId })
    .getOne();
    if (!!user) {
      return new UserResponseDto(user);
    } else throw new NotFoundException();
  }

  async update(
    userId: number,
    dto: UpdateUserDto,
    token: string,
    ) : Promise<BasicMessageDto> {
      if(userId <= 0) {
        throw new NotFoundException(); 
      }

      if (extractUserId(token) !== userId) {
        throw new ForbiddenException('Not authorized to udpate this user info.');
      }

    const result = await this.userRepository
      .createQueryBuilder()
      .select()
      .update('user', { ...dto })
      .where('userId = :userId', { userId })
      .execute();

    if (result.affected !== 0) {
      return new BasicMessageDto('Updated Successfully.');
    } else throw new NotFoundException();
  }

  async login(dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    const email = dto.email;
    const loginType = dto.loginType;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.washingcarday', 'washingcarday') // Include the 1:N relationship
      .where('email = :email', { email })
      .andWhere('loginType = :loginType', {loginType})
      .orderBy('washingcarday.id', 'DESC') // Order by id in descending order
      .limit(1) // Limit the result to only get the first (most recent) WashingCarDay
      .getOne()

    if (!!user) {
      // if(user.getIsExit == true) throw new NotImplementedException('탈퇴한 회원입니다.');

      var data = [];
      if(user.washingcarday.length > 0){
        const now = new Date();
        now.setHours(8,59,59,0);

        const start = new Date(user.washingcarday[0].started_at);
        start.setHours(9,0,0,0);

        if(start >= now){
          data = user.washingcarday;
        }
      }

      const dto = new UserLoginResponseDto(user, data);
      dto.accessToken = generateAccessToken(user.getUserId);
      return dto;
    } else throw new NotFoundException();
  }

  async updateFcmToken(
    userId: number,
    dto: FcmTokenDto,
    token: string,
  ): Promise<BasicMessageDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to udpate this user info.');
    }
    const result = await this.userRepository
      .createQueryBuilder()
      .select()
      .update('user', { ...dto })
      .where('userId = :userId', { userId })
      .execute();
    if (result.affected !== 0) {
      return new BasicMessageDto('Updated Successfully.');
    } else throw new NotImplementedException("Not implemented update fcmtoken");
  }

  async delete(
    userId: number,
    token: string,
  ): Promise<BasicMessageDto> {
    if (extractUserId(token) !== userId) {
      throw new ForbiddenException('Not authorized to udpate this user info.');
    }

    const result = await this.userRepository
    .createQueryBuilder()
    .update('user')
    .set({ is_exit: true})
    .where('userId = :userId', { userId })
    .execute();

    if (result.affected !== 0) {
      return new BasicMessageDto('Updated Successfully.');
    } else throw new NotImplementedException('Not Implemented update user');
  }
}
