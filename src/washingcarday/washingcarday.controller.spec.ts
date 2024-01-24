import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WashingcardayController } from './washingcarday.controller';
import { Washingcarday } from './entities/washingcarday.entity';
import { WashingcardayService } from './washingcarday.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RedisService } from '../services/redis.service';

const mockRedisModule = {
  provide: 'RedisModule:default', // Replace this with the correct token if different
  useValue: {
    get: jest.fn().mockResolvedValue('some value'), // Mock for get method
    set: jest.fn().mockResolvedValue(true), // Mock for set method
    del: jest.fn().mockResolvedValue(1), // Mock for del method
    // Add other methods or properties that are required by your service
  },
};

const mockObjRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

describe('WashingcardayController', () => {
  let controller: WashingcardayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WashingcardayController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockObjRepository
        },
        WashingcardayService,
        {
          provide: getRepositoryToken(Washingcarday),
          useValue: mockObjRepository
        },
        mockRedisModule
      ],
    }).compile();

    controller = module.get<WashingcardayController>(WashingcardayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
