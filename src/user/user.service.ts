import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateFcmTokenDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { User } from './entities/user.entity';
import { BasicMessageDto } from '../common/basic-message.dto';
import { Repository } from 'typeorm';

import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';

@Injectable()
export class UserService {

  // constructor(private readonly userRepository: UserRepository) {}
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
    return user;
  };

  private isEmailUsed = async (email: string): Promise<boolean> => {
    // return await this.userRepository.isEmailUsed(email);
      return (
      (await this.userRepository
        .createQueryBuilder()
        .select('u.userId')
        .from(User, 'u')
        .where('u.email = :email', { email })
        .getOne()) !== undefined
    );
  };

  async saveUser(dto: CreateUserDto): Promise<UserResponseDto> {
    if (false == await this.isEmailUsed(dto.email)) {
      throw new ConflictException('Email is already in use!');
    } else {
      const user = await this.userRepository.save(
        this.userCreateDtoToEntity(dto),
      );
      return new UserResponseDto(user);
    }
  }

  async update(
    userId: number,
    dto: UpdateUserDto,
    token: string,
    ) : Promise<BasicMessageDto> {
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
      var data = [];
      console.log(user);
      if(user.washingcarday.length > 0){
        const now = new Date();
        now.setHours(9,0,0,0);

        if(user.washingcarday[0].started_at >= now){
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
    dto: UpdateFcmTokenDto,
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
    } else throw new NotFoundException();
  }
}
