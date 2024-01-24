import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { generateAccessToken } from '../src/utils/auth/jwt-token-util';
import { CreateWashingcardayDto } from '../src/washingcarday/dto/create-washingcarday.dto';
import { WashingcardayInfoResponseDto } from '../src/washingcarday/dto/washingcarday-info.dto';
import { Washingcarday } from '../src/washingcarday/entities/washingcarday.entity';
import { User } from '../src/user/entities/user.entity';
import { BasicMessageDto } from '../src/common/basic-message.dto';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { UserLoginRequestDto } from '../src/user/dto/user-login-request.dto';
import { UserLoginResponseDto } from '../src/user/dto/user-login-response.dto';
import { UserResponseDto } from '../src/user/dto/user-response.dto';
import { UserModule } from '../src/user/user.module';
import { WashingcardayModule } from '../src/washingcarday/washingcarday.module';
import { WeatherController } from '../src/controller/weather.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let washingcardayRepository: Repository<Washingcarday>;

  const NAME = 'NAME';
  const EMAIL = 'app.e2e@test.com';
  const LOGIN_TYPE = '구글';
  const ADDRESS = '인천';
  const WRONG_TOKEN = 'asdfasdf';
  const CUSTOM_POP = 10;

  const STARTED_AT = '2024-01-01';
  const FINISHED_AT = '2024-01-15';
  const NX = 61;
  const NY = 127;
  const REG_ID = '11B00000';

  const saveUser = async (): Promise<User> => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setLoginType = LOGIN_TYPE;
    savedUser.setNickName = NAME;
    savedUser.setAddress = ADDRESS;
    savedUser.setCustomPop = CUSTOM_POP;
    savedUser.setAlarm = true;
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        WashingcardayModule,
        ScheduleModule.forRoot(),
        RedisModule.forRoot({
          readyLog: true,
          config: {
            url: process.env.REDIS_HOST,
            port: 6379
          },
        }),
        ConfigModule.forRoot({
          /** env 파일 등록 */
          envFilePath: '.env',
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'mariadb',
          port: 3306,
          host: process.env.DATASOURCE_URL,
          username: process.env.DATASOURCE_USERNAME,
          password: process.env.DATASOURCE_PASSWORD,
          database: 'carwarshingday_test',
          entities: [User, Washingcarday],
          logging: true,
          synchronize: true,
        }),
      ],
      controllers: [WeatherController]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    userRepository = moduleFixture.get('UserRepository');
    washingcardayRepository = moduleFixture.get('WashingcardayRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await washingcardayRepository.query('DELETE FROM washingcarday');
    await userRepository.query('DELETE FROM user');
  });

  it('[POST] /user : Response is OK if conditions are right', async () => {
    const dto = new CreateUserDto(EMAIL,LOGIN_TYPE,NAME,ADDRESS,CUSTOM_POP,true);
    const result = await request(app.getHttpServer())
      .post('/v1/user')
      .send(dto)
      .expect(HttpStatus.CREATED);

    const response = result.body as UserResponseDto;
    expect(response.email).toBe(EMAIL);
    expect(response.loginType).toBe(LOGIN_TYPE);
    expect(typeof response.userId).toBe('number');
  });

  it('[POST] /user: Response is BAD_REQUEST if email is not type of email', async () => {
    const dto = new CreateUserDto('',LOGIN_TYPE,NAME,ADDRESS,CUSTOM_POP,true);
    const result = await request(app.getHttpServer()).post('/v1/user').send(dto);
    expect(result.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[POST] /user: Response is CONFLICT if email already exists.', async () => {
    await saveUser();
    const dto = new CreateUserDto(EMAIL,LOGIN_TYPE,NAME,ADDRESS,CUSTOM_POP,true);
    const result = await request(app.getHttpServer()).post('/v1/user').send(dto);
    expect(result.status).toBe(HttpStatus.CONFLICT);
  });

  it('[POST] /user/login : Response is OK if userId exists.', async () => {
    const savedUser = await saveUser();
    const dto = new UserLoginRequestDto();
    dto.email = EMAIL;
    dto.loginType = LOGIN_TYPE;

    const result = await request(app.getHttpServer())
      .post(`/v1/user/login`).send(dto);
    expect(result.status).toBe(HttpStatus.CREATED);

    const response = result.body as UserLoginResponseDto;
    expect(response.userId).toBe(savedUser.getUserId);
    expect(response.email).toBe(EMAIL);
    expect(response.loginType).toBe(LOGIN_TYPE);
  });

  it('[PATCH] /user/:userId : Response is OK if update success.', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUserId;
    const token = generateAccessToken(userId);
    const dto = new UpdateUserDto();
    dto.loginType = '카카오';
    dto.nickName = 'changed nickname';
    dto.address = 'changed address';
    dto.custom_pop = 100;
    dto.alarm = false;

    const result = await request(app.getHttpServer())
      .patch(`/v1/user/${userId}`).set('authorization', `Bearer ${token}`).send(dto);
    expect(result.status).toBe(HttpStatus.OK);
  });

  it('[PATCH] /user/:userId : Response is NOT_FOUND if userId is invalid.', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUserId;
    const token = generateAccessToken(userId);
    const dto = new UpdateUserDto();
    dto.loginType = LOGIN_TYPE;
    dto.nickName = NAME;
    dto.address = ADDRESS;
    dto.custom_pop = 10;
    dto.alarm = true;

    const result = await request(app.getHttpServer())
      .patch(`/v1/user/-1`).set('authorization', `Bearer ${token}`).send(dto);
    expect(result.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[PUT] /user/{userId} : Response is UNAUTHOZIRED if token is malformed.', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUserId;
    const dto = new UpdateUserDto();
    dto.loginType = LOGIN_TYPE;
    dto.nickName = NAME;
    dto.address = ADDRESS;
    dto.custom_pop = 10;
    dto.alarm = true;

    const result = await request(app.getHttpServer())
      .patch(`/v1/user/${userId}`)
      .set('authorization', `Bearer ${WRONG_TOKEN}`).send(dto);
      
    expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[DELETE] /user/{userId} : Response is OK if all conditions are right', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUserId;
    const token = generateAccessToken(userId);
    const result = await request(app.getHttpServer())
      .delete(`/v1/user/${userId}`)
      .set('authorization', `Bearer ${token}`);
    expect(result.status).toBe(HttpStatus.OK);

    const user = await userRepository
    .createQueryBuilder()
    .select()
    .where('userId = :userId', { userId })
    .andWhere('is_exit = false')
    .getOne();

    expect(user).toBeNull();
  });

  it('[GET] /weather/short : Response is OK if all conditions are right', async () => {
    const result = await request(app.getHttpServer())
    .get(`/v1/weather/short/61/127`);
    expect(result.status).toBe(HttpStatus.OK);

    expect(typeof result.body.rnSt0Am).toBe('number');
  });

  it('[GET] /weather/middle : Response is OK if all conditions are right', async () => {
    const result = await request(app.getHttpServer())
    .get(`/v1/weather/middle/${REG_ID}`);
    expect(result.status).toBe(HttpStatus.OK);

    expect(typeof result.body.rnSt3Am).toBe('number');
  });

  it('[POST] /washingcarday: Response is OK if all conditions are right', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUserId;
    const token = generateAccessToken(userId);
    const dto = getCreateWashingCarDayDto();

    const result = await request(app.getHttpServer())
    .post(`/v1/washingcarday/${userId}`).set('authorization', `Bearer ${token}`).send(dto);
    expect(result.status).toBe(HttpStatus.CREATED);
  });

  it('[DELETE] /washingcarday: Response is OK if all conditions are right', async () => {
    const savedUser = await saveUser();
    const userId = savedUser.getUserId;
    const token = generateAccessToken(userId);
    const dto = getCreateWashingCarDayDto();

    const createResult = await request(app.getHttpServer())
    .post(`/v1/washingcarday/${userId}`).set('authorization', `Bearer ${token}`).send(dto);
    expect(createResult.status).toBe(HttpStatus.CREATED);

    const day = await washingcardayRepository
    .createQueryBuilder('washingcarday') // Alias for the WashingCarDay entity
    .leftJoinAndSelect('washingcarday.user', 'user') // Assuming 'users' is the name of the relationship in WashingCarDay entity
    .select()
    .where('user.userId = :userId', {userId})
    .getOne();

    expect(typeof day.id).toBe('number');

    const deleteResult = await request(app.getHttpServer())
    .delete(`/v1/washingcarday/${userId}/${day.id}`).set('authorization', `Bearer ${token}`);
  });
});
