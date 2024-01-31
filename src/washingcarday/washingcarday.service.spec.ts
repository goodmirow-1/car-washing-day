import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Connection, Repository, QueryFailedError } from 'typeorm';
import { createMemoryDB, createRedisDB } from '../utils/connections/create-memory-db';
import { CreateWashingcardayDto } from './dto/create-washingcarday.dto';
import { WashingcardayInfoResponseDto } from './dto/washingcarday-info.dto';
import { WashingcardayService } from './washingcarday.service';
import { Washingcarday } from './entities/washingcarday.entity';
import { User } from '../user/entities/user.entity';
import Redis from 'ioredis';
import {
  extractUserId,
  generateAccessToken,
} from '../utils/auth/jwt-token-util';


describe('WashingcardayService', () => {
  let service: WashingcardayService;
  let connection: Connection;
  let userRepository: Repository<User>;
  let washingcardayRepository: Repository<Washingcarday>;

  const NAME = 'NAME';
  const EMAIL = 'washingcar@test.com';
  const LOGIN_TYPE = '구글';
  const ADDRESS = '인천';
  const WRONG_TOKEN = 'asdfasdf';
  const CUSTOM_POP = 10;

  const STARTED_AT = '2024-01-01';
  const FINISHED_AT = '2024-01-15';
  const NX = 60;
  const NY = 127;
  const REG_ID = '11B00000';

  const saveUser = async (): Promise<User> => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setLoginType = LOGIN_TYPE;
    savedUser.setNickName = NAME;
    savedUser.setAddress = ADDRESS;
    savedUser.setCustomPop = CUSTOM_POP;
    return await userRepository.save(savedUser);
  };

  const getCreateWashingCarDayDto = (): CreateWashingcardayDto => {
    const dto = new CreateWashingcardayDto();
    dto.started_at = STARTED_AT;
    dto.finished_at = FINISHED_AT;
    dto.nx = NX;
    dto.ny = NY;
    dto.regId = REG_ID;
    dto.custom_pop = CUSTOM_POP;
    return dto;
  };

  const saveWashingCarDay = async (): Promise<User> => {
    const savedUser = await saveUser();
    const washingcarday = new Washingcarday();
    washingcarday.setStartedAt = new Date(STARTED_AT);
    washingcarday.setFinishedAt = new Date(FINISHED_AT);
    washingcarday.setNx = NX;
    washingcarday.setNy = NY;
    washingcarday.setRegId = REG_ID;
    washingcarday.setCustomPop = CUSTOM_POP;
    washingcarday.setUser = savedUser;
    washingcarday.check_update = false;
    await washingcardayRepository.save(washingcarday);

    const email = savedUser.getEmail;
    const loginType = savedUser.getLoginType;

    return await userRepository.createQueryBuilder('user')
    .leftJoinAndSelect('user.washingcarday', 'washingcarday') // Include the 1:N relationship
    .where('email = :email', { email })
    .andWhere('loginType = :loginType', {loginType})
    .orderBy('washingcarday.id', 'DESC') // Order by id in descending order
    .limit(1) // Limit the result to only get the first (most recent) WashingCarDay
    .getOne()
  };

  beforeAll(async () => {
    connection = await createMemoryDB([User, Washingcarday]);
    userRepository = connection.getRepository(User);
    washingcardayRepository = connection.getRepository(Washingcarday);

    const redisClient = await createRedisDB();
    service = new WashingcardayService(washingcardayRepository, userRepository, redisClient);
  });

  afterAll(async () => {
      await connection.close();
      await service.closeRedis();
  });

  afterEach(async () => {
      await washingcardayRepository.query('DELETE FROM washingcarday');
      await userRepository.query('DELETE FROM user');
  });

  it('should be defined', () => {
      expect(service).toBeDefined();
  });

  it('saveWashingCarDay(): Should save washingcarday', async () => {
    const savedUser = await saveUser();
    const requestDto = getCreateWashingCarDayDto();
    const result = await service.create(
      savedUser.getUserId,
      requestDto,
      generateAccessToken(savedUser.getUserId),
    );
    expect(result).toBeInstanceOf(WashingcardayInfoResponseDto);
    expect(result.nx).toBe(NX);
    expect(result.ny).toBe(NY);
    expect(result.regId).toBe(REG_ID);

    const warshingdayId = result.id;

    const savedWashingcarday = await washingcardayRepository
    .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
    .select()
    .where('id = :warshingdayId', {warshingdayId})
    .getOne();

    expect(savedWashingcarday.getID).toBe(result.id);
    expect(savedWashingcarday.getNx).toBe(NX);
    expect(savedWashingcarday.getNy).toBe(NY);
  });

  it('saveWashingCarDay(): Should throw UnauthorizedException if token is wrong', async () => {
    const savedUser = await saveUser();
    expect.assertions(1);
    const requestDto = getCreateWashingCarDayDto();
    try {
      await service.create(
        savedUser.getUserId,
        requestDto,
        WRONG_TOKEN,
      );
    } catch (exception) {
      expect(exception).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('removeWashingCarDay(): Should successfully remove', async () => {
    const savedUser = await saveWashingCarDay();
    const id = savedUser.washingcarday[0].getID;
    console.log(id);
    await service.delete(
      savedUser.getUserId,
      id,
      generateAccessToken(savedUser.getUserId),
    );
    const washingcar = await washingcardayRepository
    .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
    .select()
    .where('id = :id', {id})
    .getOne();

    expect(washingcar).toBeNull();
  });

  
});
