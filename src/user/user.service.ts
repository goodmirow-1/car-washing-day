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
import { admin } from '../firebase/firebaseAdmin';


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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async login(dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    const email = dto.email;
    const loginType = dto.loginType;
    const user = await this.userRepository
    .createQueryBuilder('user')
      // .select()
      .leftJoinAndSelect('user.washingcarday', 'washingcarday') // Include the 1:N relationship
      .where('email = :email', { email })
      .andWhere('loginType = :loginType', {loginType})
      .orderBy('washingcarday.id', 'DESC') // Order by id in descending order
      .limit(1) // Limit the result to only get the first (most recent) WashingCarDay
      .getOne()

    if (!!user) {
      const dto = new UserLoginResponseDto(user, user.washingcarday);
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

  async test(
    userId: number
  ): Promise<BasicMessageDto> {
    const user = await this.userRepository
      .createQueryBuilder()
      .select()
      .where('userId = :userId', { userId })
      .getOne();

      console.log(user.fcmToken);

    if (user) {
      // Send a message to the device corresponding to the provided registration token
      const message = {
        token: user.fcmToken,
        notification: {
          title: 'test',
          body: 'tesbody',
        },
      };

      const response = await admin.messaging().send(message);

      return new BasicMessageDto('semd fcm success');
    } else throw new NotFoundException();
  }
}
