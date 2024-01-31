import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Connection, Repository, QueryFailedError } from 'typeorm';
import { createMemoryDB } from '../utils/connections/create-memory-db';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Washingcarday } from '../washingcarday/entities/washingcarday.entity';
import { BasicMessageDto } from '../utils/basic-message.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';

describe("findOne fetches data from the API endpoint", () => {
  let userService: UserService;
  let connection: Connection;
  let userRepository: Repository<User>;

  const NAME = 'NAME';
  const EMAIL = 'test3@test.com';
  const LOGIN_TYPE = '구글';
  const ADDRESS = '인천';
  const WRONG_TOKEN = 'asdfasdf';
  const CUSTOM_POP = 10;

  const saveUser = async (): Promise<User> => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setLoginType = LOGIN_TYPE;
    savedUser.setNickName = NAME;
    savedUser.setAddress = ADDRESS;
    savedUser.setCustomPop = CUSTOM_POP;
    return await userRepository.save(savedUser);
  };

  beforeAll(async () => {
      connection = await createMemoryDB([User, Washingcarday]);
      userRepository = connection.getRepository(User);
      userService = new UserService(userRepository);
  });

  afterAll(async () => {
      await connection.close();
  });

  afterEach(async () => {
      await userRepository.query('DELETE FROM user');
  });

  it('should be defined', () => {
      expect(userService).toBeDefined();
  });


  it('saveUser(): Should Save User', async () => {
      const dto = new CreateUserDto(EMAIL,LOGIN_TYPE,NAME,ADDRESS,CUSTOM_POP,true);

      const responseDto = await userService.saveUser(dto);
      expect(responseDto.email).toBe(EMAIL);
      expect(responseDto.nickName).toBe(NAME);
      expect(responseDto.loginType).toBe(LOGIN_TYPE);
      expect(responseDto.address).toBe(ADDRESS);
      expect(responseDto.custom_pop).toBe(CUSTOM_POP);
      expect(responseDto.alarm).toBe(true);
      expect(typeof responseDto.userId).toBe('number');

      const userId = responseDto.userId;

      const savedUser = await userRepository
      .createQueryBuilder()
      .select()
      .where('userId = :userId', { userId })
      .getOne();

      expect(savedUser.getUserId).toBe(responseDto.userId);
      expect(savedUser.getNickName).toBe(responseDto.nickName);
      expect(savedUser.getEmail).toBe(responseDto.email);
  });

  it('getUserInfo(): Should get user info correctly', async () => {
      const savedUser = await saveUser();
  
      const response = await userService.getUserInfo(
        savedUser.getUserId,
        generateAccessToken(savedUser.getUserId),
      );
      expect(response.userId).toBe(savedUser.getUserId);
      expect(response.nickName).toBe(savedUser.getNickName);
      expect(response.email).toBe(savedUser.getEmail);
  });

  it('getUserInfo(): Should throw NotFoundException if user_id is invalid', async () => {
      expect.assertions(1);
      try {
        await userService.getUserInfo(-1, generateAccessToken(-1));
      } catch (exception) {
        expect(exception).toBeInstanceOf(NotFoundException);
      }
  });

  it('getUserInfo(): Should throw ForbiddenException if userId in token is not equal to path parameter', async () => {
      expect.assertions(1);
      const savedUser = await saveUser();
      try {
        await userService.getUserInfo(
          savedUser.getUserId,
          generateAccessToken(-1),
        );
      } catch (exception) {
        expect(exception).toBeInstanceOf(ForbiddenException);
      }
    });
  
    it('getUserInfo(): Should throw UnauthorizedException if token is wrong', async () => {
      expect.assertions(1);
      const savedUser = await saveUser();
      try {
        await userService.getUserInfo(savedUser.getUserId, WRONG_TOKEN);
      } catch (exception) {
        expect(exception).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('updateUserInfo(): Should update user infos(Both name and password)', async () => {
      const savedUser = await saveUser();
  
      const updateDto = new UpdateUserDto();
      updateDto.loginType = '카카오';
      updateDto.nickName = 'NEW_NAME';
      updateDto.address = 'NEW_ADDRESS';
      updateDto.custom_pop = 100;
      updateDto.alarm = false;
  
      const response = await userService.update(
        savedUser.getUserId,
        updateDto,
        generateAccessToken(savedUser.getUserId),
      );
  
      expect(response).toBeInstanceOf(BasicMessageDto);
  
      const userId = savedUser.getUserId;

      const updatedUser = await userRepository
      .createQueryBuilder()
      .select()
      .where('userId = :userId', { userId })
      .getOne();
      
      expect(updatedUser.getNickName).toBe('NEW_NAME');
      expect(updatedUser.getLoginType).toBe('카카오');
  }); 

  it('removeUser(): Should remove user', async () => {
      const savedUser = await saveUser();
  
      const response = await userService.delete(
        savedUser.getUserId,
        generateAccessToken(savedUser.getUserId),
      );
      expect(response).toBeInstanceOf(BasicMessageDto);

      const userId = savedUser.getUserId;
  
      const user = await userRepository
      .createQueryBuilder()
      .select()
      .where('userId = :userId', { userId })
      .andWhere('is_exit = false')
      .getOne();

       expect(user).toBeNull();
    });
  
  it('login(): Should login user', async () => {
      const savedUser = await saveUser();
  
      const requestDto = new UserLoginRequestDto();
      requestDto.email = EMAIL;
      requestDto.loginType = LOGIN_TYPE;
  
      const response = await userService.login(requestDto);
      expect(response.email).toBe(EMAIL);
      expect(response.nickName).toBe(NAME);
      expect(response.userId).toBe(savedUser.getUserId);
      extractUserId(response.accessToken);
      expect(extractUserId(response.accessToken)).toBe(savedUser.getUserId);
  });
  
  it('login(): Should throw NotFoundException is login data is invalid', async () => {
      await saveUser();
      const requestDto = new UserLoginRequestDto();
      requestDto.email = 'wrong@email.com';
      requestDto.loginType = LOGIN_TYPE;
  
      expect.assertions(1);
      try {
        await userService.login(requestDto);
      } catch (exception) {
        expect(exception).toBeInstanceOf(NotFoundException);
      }
  });
});